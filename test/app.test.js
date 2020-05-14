import supertest from 'supertest';
import api from '../src/api.js';

describe('App', () => {
  it('GET / responds with 400', () => {
    return supertest(api).get('/').expect(400);
  });
});
