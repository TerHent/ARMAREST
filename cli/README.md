# Command-Line interface

The CLI can create and sign new authentication tokens as outlined in the design document.

## Usage

``$ python generate.py``

Command-line arguments:

``--from-role FILE``

Inherit from the permissions of FILE. Additionally, more permissions can be added by specifying them:

``$ python generate.py service1.permission service2.permission ....``

## Role file format

The role files are YAML files. Here is an example:

```yaml
name: Example
permissions:
  log: all # allow all actions for the logger
  kinematic:
    - read
```
