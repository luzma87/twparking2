global.chai = require('chai');
global.sinon = require('sinon');
global.sinonChai = require('sinon-chai');
chai.use(sinonChai);
global.expect = chai.expect;

global.app = require('../server/server');
