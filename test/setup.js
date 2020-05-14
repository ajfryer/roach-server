// Setup test environment

process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';

import chai from 'chai';
const { expect } = chai;

import supertest from 'supertest';
import Postgrator from 'postgrator';

global.expect = expect;
global.supertest = supertest;
global.Postgrator = Postgrator;
