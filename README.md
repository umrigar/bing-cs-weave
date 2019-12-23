# Binghamton CS Weave

Allows updating of accredition weave files using a web form.

## Installation

Requires a recent [nodejs](https://nodejs.org) installation.

Change into directory containing this file and install using:

```sh
$ npm ci
$ npm run build
```

## Running
Start server using:

```sh
$ ./index.js PORT DIR
```

where `PORT` is port on which server should run and `DIR` is path to
directory containing weave files.  Server user must have read/write
access to those files.

Error messages are written to stderr.

An example start up:

```sh
$ ./index.js 2345 ../weave/2020 2>>weave-errors.log &
```

## Not in Scope
Orthogonal issues not in scope for this code:

- Authentication of users.

- Keeping the server up.


