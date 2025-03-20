import json
from datetime import datetime
from enum import Enum
from functools import total_ordering
from itertools import islice
from typing import List

from flask import Blueprint, Response, request
from pydantic import BaseModel


@total_ordering
class Verbosity(Enum):
    UNDEFINED = 1
    DEBUG = 2
    VERBOSE = 3
    INFO = 4
    IMPORTANT = 5
    WARN = 6
    ERROR = 7
    FATAL = 8

    def __lt__(self, other):
        if self.__class__ is other.__class__:
            return self.value < other.value
        return NotImplemented


class LogMessage(BaseModel):
    verbosity: Verbosity
    message: str
    timestamp: datetime
    author: str
    group: str
    function: str
    file: str
    tag: str
    line: int
    thread_id: int
    backtrace: str
    id: int


class LogMessages(BaseModel):
    """
    This class is only used for serializing a list of log messages with pydantic.
    """
    __root__: List[LogMessage]


class LoggerCore:
    blueprint: Blueprint
    buffer: List[LogMessage]
    next_id: int = 0

    def __init__(self):
        self.blueprint = Blueprint("log", __name__)
        self.blueprint.add_url_rule(
            "/", methods=["GET"], view_func=self.get_log)
        self.buffer = []

    def add_message(self, msg: LogMessage) -> None:
        msg.id = self.next_id
        self.next_id += 1
        self.buffer.append(msg)

    def get_log(self) -> Response:
        verbosity = request.args.get("verbosity")
        if verbosity is None:
            return Response(json.dumps({"error": "No verbosity was provided."}), 400, content_type="application/json")
        try:
            verbosity_enum = Verbosity[verbosity.upper()]
        except KeyError:
            return Response(json.dumps({"error": "Invalid verbosity. Try verbosity=INFO"}), 400, content_type="application/json")

        # Any value in after returns a different result (messages right after "after")
        # then no value in after. Therefore, we can't have a default value for after.
        try:
            after = int(request.args["after"])
        except ValueError:
            return Response(json.dumps({"error": "after must be an integer"}), 400, content_type="application/json")
        except KeyError:
            after = None
        try:
            before = int(request.args.get("before", len(self.buffer)))
        except ValueError:
            return Response(json.dumps({"error": "before must be an integer"}), 400, content_type="application/json")
        component = request.args.get("component")
        function = request.args.get("function")
        tag = request.args.get("tag")
        file = request.args.get("file")

        def useFilters(msg):
            return (component is None or msg.author == component) and \
                (function is None or msg.function == function) and \
                (tag is None or msg.tag == tag) and \
                (file is None or msg.file == file) and \
                (msg.verbosity >= verbosity_enum)

        try:
            max_messages = int(request.args.get("maxMessages", 1000))
        except ValueError:
            return Response(json.dumps({"error": "maxMessages must be an integer"}), 400, content_type="application/json")

        if after is not None:
            sliced = (self.buffer[i] for i in range(after + 1, before))
            # we want the messages right after the message with id=after, not the newest messages
            filtered = list(islice(filter(useFilters, sliced), max_messages))
        else:
            # reminder that before is set to len(self.buffer) unless specified otherwise.
            # requests can still specify large before values
            before = min(before, len(self.buffer))
            # Only consider messages before "before" matching the filter:
            # We use a reverse iterator to avoid filtering all items.
            sliced_reverse = (self.buffer[i] for i in reversed(range(before)))
            filtered = list(
                islice(filter(useFilters, sliced_reverse), max_messages))
            filtered.reverse()

        return Response(LogMessages(__root__=filtered).json(), 200, content_type="application/json")
