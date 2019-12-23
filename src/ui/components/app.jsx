//-*- mode: rjsx-mode;

'use strict';

const React = require('react');
const ReactDom = require('react-dom');

const Course = require('./course');
const Dir = require('./dir');

/*************************** App Component ***************************/

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      type: 'dir',
      dir: [],
      error: ''
    };

  }

  error(err) { this.setState({error: err.toString()}); }

  async componentDidMount() {
    const {ws} = this.props;
    let data = {};
    try {
      data = await ws.get();
    }
    catch (err) {
      this.error(err);
    }
    this.setState(data);
  }



  componentDidCatch(error, info) {
    console.error(error, info);
  }


  render() {
    const data = this.state;
    const type = data.type || 'dir';
    if (this.state.error) {
      return <div className="error">{this.state.error}</div>;
    }
    else if (type === 'dir') {
      const dir = data.dir || [];
      return <Dir dir={dir}/>
    }
    else {
      const path = document.location.pathname;
      const {ws} = this.props;
      return <Course app={this} ws={ws} course={data.course} path={path}/>;
    }
  }

}

module.exports = App;
