import shlex
import subprocess
import tempfile
from functools import cache, lru_cache
from getopt import GetoptError, getopt
from pathlib import Path


class CMakeError(Exception):
    pass


@cache
def get_find_package_script() -> Path:
    cmd = [
        "cmake",
        "--find-package",
        "-DNAME=ArmarXCore",
        "-DCOMPILER_ID=GNU",
        "-DLANGUAGE=C",
        "-DMODE=COMPILE",
    ]
    output = run_command(cmd)
    args = shlex.split(output)
    try:
        opts, extra = getopt(args, 'I:')
    except GetoptError:
        opts, extra = [], args
    if extra:
        raise CMakeError(f'bad output from cmake: {output!r}')
    rel_cmake_script = Path("ArmarXCore/core/system/cmake/FindPackageX.cmake")
    for opt, arg in opts:
        assert opt == '-I'
        path = Path(arg) / rel_cmake_script
        if path.exists():
            return path
    raise CMakeError('Could not find FindPackageX.cmake')


@lru_cache(maxsize=32)
def get_data_path(package_name: str) -> list[Path]:
    cmake_script = get_find_package_script()
    cmd = [
        "cmake",
        f"-DPACKAGE={package_name}",
        "-P",
        str(cmake_script),
    ]
    output = run_command(cmd)
    for line in output.split('\n'):
        head, _, content = line.partition(':')
        if head == '-- DATA_DIR':
            return [Path(p) for p in content.split(';')]
    return []


def run_command(cmd: list[str]) -> str:
    with tempfile.TemporaryDirectory() as tmpdir:
        return subprocess.check_output(cmd, cwd=tmpdir).decode('utf-8')
