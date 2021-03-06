// logger
import winston from 'winston';
import { NODE_ENV } from './config/env.js';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.File({ filename: 'info.log' })],
});

// fix to display formatted error stacks in console
const displayStack = winston.format((info) => {
  if (info.stack) {
    info.message = info.stack;
    info.stack = undefined;
  }
  return info;
});

// print to console
if (NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(displayStack(), winston.format.simple()),
    })
  );
}

export default logger;
