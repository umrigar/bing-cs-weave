//-*- mode: rjsx-mode;

'use strict';

const React = require('react');
const ReactDom = require('react-dom');

const KEYWORDS = require('../../keywords');

/*************************** Course Component **************************/

class Course extends React.Component {

  constructor(props) {
    super(props);
    this.courses = this.courses || {};
    this.courses[props.path] = props.course;
    this.state = { errors: {}, success: '' };
    this.submit = this.submit.bind(this);
  }

  async submit(event) {
    event.preventDefault();
    try {
      const course = this.courses[this.props.path];
      const success = await this.props.ws.update(course);
      this.setState({success});
    }
    catch (err) {
      this.props.app.error(err);
    }
  }

  async updateRubric(index, key, value) {
    const course = this.courses[this.props.path];
    course.rubrics[index][key] = value;
    this.setState({success: ''});
  }


  error(key, err) {
    const errors = Object.assign({}, this.state.errors);
    if (err) {
      Object.assign(errors, {key: err});
    }
    else {
      delete errors.key;
    }
    this.setState({errors});
  }

  render() {
    const {rubrics} = this.props.course;
    const outs = [];
    for (const [i, rubric] of rubrics.entries()) {
      const props = { index: i, course: this, rubric };
      outs.push(<Rubric key={i} {...props}/>);
    }
    const isError = Object.keys(this.state.errors).length > 0;
    const errMsg =
      (isError) ? 'Please fix above errors in order to update file' : '';
    const form = (
      <form method="POST" onSubmit={this.submit}>
        {outs}
        <div className="error">{errMsg}</div>
        <input type="submit" disabled={isError} value="Update File"/>
        <div className="success">{this.state.success}</div>
      </form>
    );
    return form;
  }

}

class Rubric extends React.Component {
  constructor(props) { super(props); }
  render() {
    const {rubric, index, course} = this.props;
    return (
      <div className="rubric">
        <NameValue name="Rubric" type="rubric"
                   value={rubric.rubric} index={index}/>
        <NameValue name="Metric" type="metric"
                   value={rubric.metric} index={index}/>
        <Report value={rubric.report}
                type="report" course={course} index={index}/>
        <Trigger value={rubric.trigger}
                 type="trigger" course={course} index={index}/>
      </div>
    );
  }
}

module.exports = Course;

class ReportTrigger extends React.Component {
  constructor(props) {
    super(props);
    this.onBlur = this.onBlur.bind(this);
  }

  async onBlur(event) {
    const value = this.state.value;
    const { course, index, type } = this.props;
    console.log(index, type, value);
    if (type === 'trigger' && value.trim().length === 0) {
      const error = `trigger value must be specified`;
      this.props.course.error(`${index}-${type}`, error);
      this.setState({error});
    }
    else {
      const keyword = hasKeyword(value);
      console.log('kw', keyword);
      if (keyword) {
        const error = `${type} cannot contain keyword "${keyword}"`;
        this.props.course.error(`${index}-${type}`, error);
        this.setState({error});
      }
      else {
        course.error(`${index}-${type}`);
        this.setState({error: ''});
        course.updateRubric(index, type, value);
      }
    }
  }

}

class Trigger extends ReportTrigger {
  constructor(props) {
    super(props);
    const value = props.value;
    const isTriggered = !value.match(/^\s*no\s+trigger/i);
    this.ref = React.createRef();
    this.state = { isTriggered, value, error: '' };
    this.onChange = this.onChange.bind(this);
  }

  async onChange(event) {
    if (event.target.type.startsWith('select')) {
      const isTriggered = event.target.value === "true";
      const value =  isTriggered ? '' : 'No Trigger';
      this.setState({error: '', isTriggered, value});
      const { course, index, type } = this.props;
      course.updateRubric(index, type, value);
      course.error(`${index}-${type}`);
    }
    else {
      this.setState({value: event.target.value});
    }
  }

  componentDidUpdate() {
    if (this.state.isTriggered && !this.state.value) this.ref.current.focus();
  }

  render() {
    const i = this.props.index;
    const keys = [ `trigger0-${i}`, `trigger1-${i}` ];
    const {isTriggered, value, error} = this.state;
    const valueDiv =
      (isTriggered)
      ? <div  key={keys[0]}>
          <textarea className="trigger" onChange={this.onChange} ref={this.ref}
                    value={value} onBlur={this.onBlur}/>
          <div className="error">{error}</div>
        </div>
      : <div key={keys[0]} className="error">{error}</div>;
    return (
      <React.Fragment key={`trigger-${i}`}>
        <select className="trigger" onChange={this.onChange}
                key={keys[1]} value={isTriggered}>
           <option value={false}>No Trigger</option>
           <option value={true}>Trigger</option>
        </select>
        {valueDiv}
      </React.Fragment>
    );
  }
}

class Report extends ReportTrigger {
  constructor(props) {
    super(props);
    this.state = { value: props.value, error: '' };
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.setState({value: event.target.value});
  }

  render() {
    const i = this.props.index;
    const {error} = this.state;
    return (
      <React.Fragment key={`report-${i}`}>
        <div className="report0" key={`report0-${i}`}>Report</div>
        <div key={`report1-${i}`} className="report1" >
          <textarea onChange={this.onChange} onBlur={this.onBlur}
                    value={this.state.value}/>
          <div className="error">{error}</div>
        </div>
      </React.Fragment>
    );
  }
}



function NameValue(props) {
  const {name, value, type, index: i} = props;
  const lines = value.split('\n').map((ln, i)=><span key={i}>{ln}<br/></span>);
  return (
   <React.Fragment key={`report-${i}`}>
      <div className={`${type}0`} key={`${name}0-${i}`}>{props.name}</div>
      <div className={`${type}1`} key={`${name}1-${i}`}>
        {lines}
      </div>
    </React.Fragment>
  );
}

function hasKeyword(str) {
  for (const kw of KEYWORDS) {
    if (str.indexOf(kw) >= 0) return kw;
  }
}
