const Error = require('./error');

const Course = require('./course');
const KEYWORDS = require('../keywords');

class Parser {
  parse(text, path) {
    const lines = text.split('\n');
    const m = lines[0].match(/^\s*\<\<([\w\-\.]+)\>\>/);
    if (!m) throw new Error('PARSE', `missing heading in ${path}`);
    const heading = m[1];
    const rubrics = [];
    let obj = {};
    let k, v;
    for (const line of lines.slice(1)) {
      const m = line.match(/^\s*(%%(\w+))\b(.*)/);
      if (m && KEYWORDS.has(m[1])) {
	const [_full_match, _full_kw, kw, rest] = m;
	if (k) obj[k] = v.trim();
	if (kw === 'rubric') {
	  if (Object.keys(obj).length > 0) {
	    rubrics.push(obj);
	    obj = {};
	  }
	}
	k = kw; v = rest;
      } //if (m ...)
      else {
	v += '\n' + line.trim();
      }
    } //for
    if (Object.keys(obj).length > 0) {
      if (k) obj[k] = v.trim();
      rubrics.push(obj);
    }
    return new Course({heading, rubrics});
  }
}

module.exports = new Parser();

if (require.main === module) {
  const fs = require('fs');
  for (const path of process.argv.slice(2)) {
    const text = fs.readFileSync(path, 'utf8');
    const parse = new Parser().parse(text, path);
    console.log(JSON.stringify(parse, null, 2));
    console.log(parse.text());
  }
}
