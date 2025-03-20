from datetime import datetime

import Ice
import IceStorm
from armarx import Log, LogMessage

from . import LoggerService
from .core import LogMessage as CoreLogMessage
from .core import Verbosity

mapping = {
    "eUNDEFINED": "UNDEFINED",
    "eDEBUG": "DEBUG",
    "eVERBOSE": "VERBOSE",
    "eINFO": "INFO",
    "eIMPORTANT": "IMPORTANT",
    "eWARN": "WARN",
    "eERROR": "ERROR",
    "eFATAL": "FATAL",
}


class LogReceiver(Log):
    service: "LoggerService"

    def __init__(self, service: "LoggerService"):
        super().__init__()
        self.service = service
        topicMgrProxy = service.communicator.stringToProxy(
            "IceStorm/TopicManager")
        topicManager = IceStorm.TopicManagerPrx.checkedCast(topicMgrProxy)
        try:
            topic = topicManager.retrieve("Log")
        except IceStorm.NoSuchTopic:
            print('Failed to get Log topic')
            return

        adapter = service.communicator.createObjectAdapterWithEndpoints(
            "LogAdapter", "tcp")

        proxy = adapter.addWithUUID(self).ice_oneway()
        adapter.activate()

        topic.subscribeAndGetPublisher({}, proxy)

    def writeLog(self, logMsg: LogMessage, current: Ice.Current) -> None:
        self.service.core.add_message(CoreLogMessage(
            verbosity=Verbosity[mapping.get(str(logMsg.type))],
            message=logMsg.what,
            author=logMsg.who,
            group=logMsg.group,
            backtrace=logMsg.backtrace,
            file=logMsg.file,
            function=logMsg.function,
            line=logMsg.line,
            tag=logMsg.tag,
            thread_id=logMsg.threadId,
            timestamp=datetime.fromtimestamp(float(logMsg.time) / 1000000),
            id=-1,
        ))
        pass
