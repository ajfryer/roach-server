import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { NODE_ENV } from './config/env.config.js';
import portfolioRouter from './routers/portfolio.router.js';

// express app
const api = express();

// express middleware
if (NODE_ENV !== 'production') api.use(morgan('tiny'));
api.use(helmet());
api.use(cors({ origin: '*' }));

// portfolio endpoint
api.use('/api/portfolio', portfolioRouter);

// root endpoint
api.get('/', (req, res) => {
  return res.status(400).json({ error: 'Invalid endpoint' });
});

// error handling
api.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    console.error(error);
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

export default api;
