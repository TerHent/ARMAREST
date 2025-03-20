# Implementation

This project implements the ARMAREST backend and frontend and cli as specified in the design document.

## Installation

To run the backend, you need:

-   a connection to an ArmarX Ice network, e.g. ArmarX simulation running on your device
-   python >= 3.11, e.g. from axii (axii w add tools/python/3.11)
-   the required modules. To install them, run `pip install -r requirements.txt` in the backend folder.

The backend testing server requires the same things, except for an ice connection.

To run the frontend, you need:

-   nodejs, e.g. node 16.13.1, which you can get from axii or other sources
-   either the backend (using live data) or the backend testing server (using example data)
-   all modules installed. To do so, run `npm install` in the frontend folder.

## Running

First, translate slice files to Python:

```
./compile-slice.sh
```

You don't need to do this to run the test server.

Then run the webserver:

```
$PYTHON_3_11 -m backend
```

You can find more detailed instructions on running the backend and the backend testing server in backend/README.md

To start the frontend, run the following commands in the frontend folder:

On Windows:

```
npm run windows-start
```

Everywhere else:

```
npm start
```

## Testing

There are three different test environments:
- python unit tests for the backend
- nodejs unit tests for the frontend
- (nodejs) playwright end2end tests

For information about backend tests, read backend/README.md

The frontend unit tests can be run with `npm run test` after installing the frontend as described above.

## end2end

You might have to install browsers first, using `npx playwright install`.
To allow the tests to run, these processes (explained in the "running" section) have to run in the background:
- react server, e.g. npm start
- backend server, e.g. SECRET_SIGNING_KEY="testkey" python3.11 -m backend.launchtestserver

The backend server has to run with the environment variable SECRET_SIGNING_KEY set to "testkey" as this key is used by the jwt tokens in the tests.

##
This project was created by Arved Ehrnsperger, Konstantin Kanchev, Sebastian Kirmayer and Timur Umarov,

The end2end tests can then be run with `npx playwright test` (Note the x in npx).
