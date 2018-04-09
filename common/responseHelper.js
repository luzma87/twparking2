'use strict';

const buildError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const buildResponse = (message, status = 200) => {
  return {status: status, result: message};
};

module.exports = {
  buildError: buildError,
  buildResponse: buildResponse,
};
