const KEYWORDS = require('../keywords');

class Rubric {
  constructor(obj) {
    const {trigger} = obj;
    if (typeof trigger !== 'string' || trigger.trim().length === 0) {
      console.log(obj);
      throw "trigger must be specified";
    }
    for (const [type, val] of Object.entries(obj)) {
      for (const keyword of KEYWORDS) {
	if (val.indexOf(keyword) >= 0) {
	  throw `${type} cannot contain keyword "${keyword}"`;
	}
      }
    }
    Object.assign(this, obj);
  }

  text() {
    let str = '';
    for (const k of KEYWORDS) str += `${k}\n${this[k.replace('%%', '')]}\n`;
    return str + '\n\n';
  }
  
}

class Course {
  constructor(obj) {
    const rubrics = obj.rubrics.map(r => new Rubric(r));
    Object.assign(this, obj, {rubrics});
  }
  
  text() {
    let str = `<<${this.heading}>>\n\n`;
    this.rubrics.forEach(rubric => str += rubric.text());
    return str;
  }
}

module.exports = Course;
