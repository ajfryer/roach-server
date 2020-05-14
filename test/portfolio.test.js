// web service integration tests

import env from '../src/config/env.config.js';
import api from '../src/api.js';

import returnsDB from '../src/database/returns.db.js';
import portfolioDB from '../src/database/portfolio.db.js';

describe('api/portfolio endpoint', () => {
  console.log('running portfolio endpoint test');
  console.log('connecting to db', env.DATABASE_URL);

  // set up environment
  const postgrator = new Postgrator({
    migrationDirectory: 'migrations',
    driver: 'pg',
    connectionString: env.DATABASE_URL,
  });

  describe('api/portfolio/roach', () => {
    beforeEach(async () => {
      // initialize db
      await postgrator.migrate('000');
      await postgrator.migrate('002');
      await returnsDB.seed();
      await portfolioDB.refresh();
    });

    context('given roach simulation exists in db', () => {
      it('GET /api/portfolio/roach?strategy=equalWeight responds with 200 & simulation', (done) => {
        supertest(api)
          .get('/api/portfolio/roach?strategy=equalWeight')
          .end((req, res) => {
            expect(res.statusCode).to.equal(200);
            done();
          });
      });

      it('GET /api/portfolio/roach?strategy=invalid responds with 400', (done) => {
        supertest(api)
          .get('/api/portfolio/roach?strategy=invalid')
          .end((req, res) => {
            expect(res.statusCode).to.equal(400);
            done();
          });
      });
    });
  });

  describe('api/portfolio/benchmark', () => {
    beforeEach(async () => {
      // initialize db
      await postgrator.migrate('000');
      await postgrator.migrate('002');
      await returnsDB.seed();
      await portfolioDB.refresh();
    });
    //
    context('given benchmark simulation does not exist in db', () => {
      it('GET /api/portfolio/benchmark?weights=0.5,0.5,0,0 responds with 200 & simulation', async () => {
        const rows = await portfolioDB.readAll();
        const numRows = rows.length;
        console.log('firt num rows', numRows);

        return supertest(api)
          .get('/api/portfolio/benchmark?weights=0.5,0.5,0,0')
          .expect(async (res) => {
            const newRows = await portfolioDB.readAll();
            const numNewRows = newRows.length;
            console.log('new num rows', numNewRows);
            expect(res.statusCode).to.equal(200);
            expect(numNewRows).to.equal(numRows + 1);
          });
      });
    });

    context('given benchmark simulation does exist in db', (done) => {
      it('GET /api/portfolio/benchmark?weights=0.5,0.5,0,0 responds with 200 & simulation', (done) => {
        supertest(api)
          .get('/api/portfolio/benchmark?weights=0.5,0.5,0,0')
          .end((req, res) => {
            expect(res.statusCode).to.equal(200);
            done();
          });
      });

      it('GET /api/portfolio/benchmark?weights=5,0.1,0,0 responds with 400', (done) => {
        supertest(api)
          .get('/api/portfolio/benchmark?weights=5,0.1,0,0')
          .end((req, res) => {
            expect(res.statusCode).to.equal(400);
            done();
          });
      });
    });
  });

  after(async () => {
    await postgrator.migrate('000');
  });
});
