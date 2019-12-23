'use strict';

const axios = require('axios');


function Ws() {
}

module.exports = Ws;


Ws.prototype.get = async function(q = {}) {
  try {
    const params = Object.assign({doJson: 1}, q);
    const url = document.location.toString();
    const response = await axios.get(url, { params });
    return response.data;
  }
  catch (err) {
    rethrow(err);
  }
};

Ws.prototype.update = async function(obj) {
  try {
    const url = document.location.toString();
    const response = await axios.post(url, obj);
    return response.data;
  }
  catch (err) {
    rethrow(err);
  }
};

function rethrow(err) {
  console.error(err);
  if (err.response && err.response.data && err.response.data.error) {
    throw err.response.data.error;
  }
  else {
    throw err;
  }
}
