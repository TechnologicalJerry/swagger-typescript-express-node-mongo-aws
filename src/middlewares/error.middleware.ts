import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { MongoServerError } from 'mongodb';
import { logger } from '../config/logger';
import { sendError } from '../utils/response.util';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error occurred', err);

  if (err instanceof mongoose.Error.ValidationError) {
    sendError(res, 'Validation error', 400, err.message);
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    sendError(res, 'Invalid identifier', 400, err.message);
    return;
  }

  if (err instanceof MongoServerError && err.code === 11000) {
    sendError(res, 'Duplicate entry', 409, 'Resource already exists');
    return;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    sendError(res, 'Invalid or expired token', 401);
    return;
  }

  const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  sendError(res, message, statusCode);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.path} not found`, 404);
};

