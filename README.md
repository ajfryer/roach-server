# Roach Server

Backend for Roach - harder to kill investment portfolios. Discover how alternative investments like gold and futures can diversify your stock and bond portfolio

[Live Demo](https://roach.now.sh)

Tech stack: Node, Express, Postgres

Data sources: [AlphaVantage](https://www.alphavantage.co/)

[Client Repo](https://github.com/ajfryer/roach-client)

## Install

1. `yarn install` or `npm install`

2. `cp sample.env .env`

3. Add dev, test, and production database URLs to .env

4. [Create AlphaVantage API key and put in .env](https://www.alphavantage.co/support/#api-key)

5. Migrate database: `yarn migrate` or `npm migrate`

6. Schedule Heroku scheduler to run `yarn refresh-db` or `npm refresh-db` after market close (5pm EST)

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

## Set up Heroku Deployment

1. `heroku create`

2. `heroku addons:create heroku-postgresql:hobby-dev`

3. `yarn migrate:production` or `npm migrate:production`

4. `heroku addons:create scheduler:standard`

5. Cchedule Heroku scheduler to run `yarn refresh-db` or `npm refresh-db` after market close (5pm EST)

6. `heroku config:set AV_API_KEY=<your API key>`

7. `yarn deploy` or `npm run deploy`

8. `heroku ps:scale web=1`
