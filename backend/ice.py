
from types import TracebackType
from typing import Optional, Type

import Ice

from .exceptions import ProxyUnreachableException


class IceRequest:
    def __enter__(self):
        pass

    def __exit__(self, exc_type: Optional[Type[BaseException]],
                 exc_value: Optional[BaseException],
                 exc_tb: TracebackType):
        if isinstance(exc_value, Ice.LocalException):
            raise ProxyUnreachableException(exc_value) from exc_value
        return False
