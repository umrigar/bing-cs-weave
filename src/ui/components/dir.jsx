//-*- mode: rjsx-mode;

'use strict';

const React = require('react');
const ReactDom = require('react-dom');


/*************************** App Component ***************************/

class Dir extends React.Component {

  constructor(props) {
    super(props);
  }


  render() {
    const dir = this.props.dir || [];
    const list = [];
    for (const [i, d] of dir.entries()) {
      const a = (
        <p key={i}>
          <a href={d}>{d}</a>
        </p>
      );
      list.push(a);
    }
    return list;
  }
}

module.exports = Dir;
