'use strict';

const buildError = (message, status = 400) => {
  console.log(message);
  const error = new Error(message);
  error.status = status;
  return error;
};

const buildResponse = (message, status = 200) => {
  console.log(message);
  return {status: status, result: message};
};

module.exports = {
  buildError: buildError,
  buildResponse: buildResponse,
};
