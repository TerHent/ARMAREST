
from typing import Dict, List, Set, Tuple, NoReturn
import argparse
from argparse import ArgumentTypeError
import datetime
import yaml
import sys
import os
import jwt

SERVICES: Dict[str, List[str]] = {
    # service: permissions
    "log": ["read"],
    "emergencystop": ["write"],
    "kinematic": ["read", "write"],
    "remote": ["read", "write"],
}


def parse_permission(perm_str: str) -> Tuple[str, str]:
    service, dot, perm = perm_str.partition('.')
    if not dot:
        raise ArgumentTypeError(
            f"{perm_str}: Permissions must be of the form service.permission")

    try:
        service_perm_spec = SERVICES[service]
    except KeyError:
        raise ArgumentTypeError(f"{service}: No such service")

    if perm == '*':
        return service, '*'

    if perm not in service_perm_spec:
        raise ArgumentTypeError(f"{perm_str}: No such permission")

    return service, perm


parser = argparse.ArgumentParser(
    description='Generate an authentication token for ARMAREST')
parser.add_argument('--from-role',
                    help='Generate the token from a YAML role specification', metavar='FILE',
                    type=argparse.FileType('r'))
parser.add_argument('-d', '--duration',
                    help='How many days this token will be valid (default: 30)', metavar='DAYS',
                    type=int, default=30)
parser.add_argument('permissions',
                    help='Permissions in the token, in the form <service>.<permission> or <service>.*',
                    type=parse_permission, nargs='*')
parser.add_argument('--list-permissions',
                    action='store_true', help='Display all available permissions')
args = parser.parse_args()

if args.list_permissions:
    for service, perms in SERVICES.items():
        print(f'{service}:')
        for perm in perms:
            print(f'  - {perm}')
    sys.exit()


def error(msg: str) -> NoReturn:
    print("Error:", msg, file=sys.stderr)
    sys.exit(127)


if args.from_role is None and not args.permissions:
    error("neither role nor permissions specified")

permissions = {}
role_name = None

if args.from_role is not None:
    try:
        role_data = yaml.load(args.from_role, yaml.loader.Loader)
    except yaml.error.YAMLError as e:
        error(str(e))

    if not isinstance(role_data, dict):
        error('role specification must be a mapping')

    try:
        role_name = role_data['name']
    except KeyError:
        error('role specification must contain a "name" value')

    if not isinstance(role_name, str):
        error('role name must be a string')

    try:
        role_perms = role_data['permissions']
    except KeyError:
        error('role specification must contain a "permissions" value')

    if not isinstance(role_perms, dict):
        error('role permissions must be a mapping')

    for service, service_perms in role_perms.items():
        try:
            service_perm_spec = SERVICES[service]
        except KeyError:
            error(f'{service}: no such service')
        if service_perms == 'all':
            permissions.setdefault(service, set()).add('*')
        elif not isinstance(service_perms, list):
            error('service permissions must be "all" or a list')
        else:
            all_service_perms = permissions.setdefault(service, set())
            for perm in service_perms:
                if perm not in service_perm_spec:
                    error(f'{service}.{perm}: no such permission')
                all_service_perms.add(perm)

for service, perm in args.permissions:
    permissions.setdefault(service, set()).add(perm)

expires = datetime.datetime.now() + datetime.timedelta(days=args.duration)
payload = {
    "exp": expires.timestamp(),
    "permissions":
        {service: list(perms) for service, perms in permissions.items()},
}
if role_name is not None:
    payload['role_name'] = role_name

try:
    secret = os.environ['SECRET_SIGNING_KEY']
except KeyError:
    error('$SECRET_SIGNING_KEY is not set')

token = jwt.encode(payload, key=secret, algorithm="HS256")

print(token)
