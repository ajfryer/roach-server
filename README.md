# Roach Server

Backend for Roach - harder to kill investment portfolios. Discover how alternative investments like gold and futures can diversify your stock and bond portfolio

Tech stack: Node, Express, Postgres

[Client Repo](https://github.com/ajfryer/roach-client)

[Live Demo](https://roach.now.sh)

## Install

1. `yarn install` or `npm install`

2. `cp sample.env .env`

3. Add dev, test, and production database URLs to .env

4. Migrate database: `yarn migrate` or `npm migrate`

5. Schedule Heroku scheduler to run `yarn refresh-db` or `npm refresh-db` after market close (5pm EST)

## Scripts

Start server: `yarn start` or `npm run start`

Dev server: `yarn dev` or `npm dev`

Refresh database: `yarn update-db` or `npm update-db`

Migrate database: `yarn migrate-db` or `npm migrate-db`

Deploy to Heroku: `yarn deploy` or `npm run deploy`

## API

**Roach Portfolio resource**
'/api/portfolio/roach'

Query params:
'?strategy'

- Roach strategy name
- string ""
- valid params: "equalWeight", "minimumVariance"

**Benchmark Portfolio resource**
'/api/portfolio/benchmark'

Query params:
'?weights'

- Benchmark strategy weights
- array []
- valid params: [.5,.5,0,0] (must sum to 1)

## Heroku

1. `heroku create`

2. `heroku addons:create heroku-postgresql:hobby-dev`

3. `yarn migrate:production` or `npm migrate:production`

4. `heroku addons:create scheduler:standard`

5. Schedule Heroku scheduler to run `yarn refresh-db` or `npm refresh-db` after market close (5pm EST)

6. `yarn deploy` or `npm run deploy`

7. `heroku ps:scale web=1`
