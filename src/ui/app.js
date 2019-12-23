const React = require('react');
const ReactDom = require('react-dom');

const App = require('./components/app.jsx');
const Ws = require('./ws.js');

function main() {
  const ws = new Ws();
  const app = <App ws={ws}/>;
  ReactDom.render(app, document.getElementById('app'));
}

main();
