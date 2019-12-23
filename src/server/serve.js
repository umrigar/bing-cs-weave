'use strict';

const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');
const { promisify } = require('util');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const querystring = require('querystring');

const parser = require('./parser');
const Course = require('./course');

function serve(port, appDir, coursesDir) {
  const app = express();
  app.locals.port = port;
  app.locals.dir = coursesDir;
  app.use('/build', express.static(`${appDir}/build`));
  setupRoutes(app);
  app.listen(port, function() {
    console.log(`listening on port ${port}`);
  });
}


module.exports = serve;

/******************************** Routes *******************************/

function setupRoutes(app) {
  app.get(`/`, getDir(app));
  app.get(`/:course`, getCourse(app));
  app.post(`/:course`, bodyParser.json(), updateCourse(app));
  app.use(doErrors(app)); //must be last   
}

/*************************** Action Routines ***************************/


function getDir(app) {
  return errorWrap(async function(req, res) {
    try {
      if (req.query.doJson) {
	const dir = (await readdir(app.locals.dir)).
	      filter(f => f !== '.' && f !== '..');
	res.json({type: 'dir', dir});
      }
      else {
	res.type('.html');
	res.send(template('Courses'));
      }
    }
    catch (err) {
      res.status(BAD_REQUEST).json({error: err.toString()});
    }
  });
};

function getCourse(app) {
  return errorWrap(async function(req, res) {
    try {
      const fName = req.params.course;
      if (req.query.doJson) {
	const path = app.locals.dir + '/' + fName;
	const text = await readFile(path, 'utf8');
	res.json({ type: 'course', course: parser.parse(text) });
      }
      else {
	res.type('.html');
	res.send(template(fName));
      }
    }
    catch (err) {
      console.error(err);
      res.status(BAD_REQUEST).json({error: err.toString()});
    }
  });
};

function updateCourse(app) {
  return errorWrap(async function(req, res) {
    try {
      const fName = req.params.course;
      const path = app.locals.dir + '/' + fName;
      const course = new Course(req.body);
      const text = course.text();
      await writeFile(path, text);
      res.type('.text');
      res.send(`updated file ${fName} (${text.length} bytes)`);
    }
    catch (err) {
      console.error(err);
      res.status(BAD_REQUEST).json({error: err.toString()});
    }
  });
};


/** Set up error handling for handler by wrapping it in a 
 *  try-catch with chaining to error handler on error.
 */
function errorWrap(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    }
    catch (err) {
      next(err);
    }
  };
}

const OK = 200;
const CREATED = 201;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const CONFLICT = 409;
const SERVER_ERROR = 500;

/** Ensures a server error results in an error page sent back to
 *  client with details logged on console.
 */ 
function doErrors(app) {
  return async function(err, req, res, next) {
    res.status(SERVER_ERROR);
    res.json({ msg: err.message, });
    console.error(err);
  };
}

function template(heading) {
  return `
  <!DOCTYPE html>
  <html lang="en/us">
    <head>
      <title>Bing CS Weave: ${heading}</title>
      <link rel="stylesheet" type="text/css" href="/build/style.css">
    </head>
    <body>
      <h1>${heading}</h1>
      <div id="app"></div>
      <script src="/build/app.js"></script>
    </body>
  <html>
  `;
}

/************************ General Utilities ****************************/



function isEmpty(v) {
  return (v === undefined) || v === null ||
    (typeof v === 'string' && v.trim().length === 0);
}

/** Return original URL for req.  If index specified, then set it as
 *  _index query param 
 */
function requestUrl(req, index) {
  const port = req.app.locals.port;
  let url = `${req.protocol}://${req.hostname}:${port}${req.originalUrl}`;
  if (index !== undefined) {
    if (url.match(/_index=\d+/)) {
      url = url.replace(/_index=\d+/, `_index=${index}`);
    }
    else {
      url += url.indexOf('?') < 0 ? '?' : '&';
      url += `_index=${index}`;
    }
  }
  return url;
}
