import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err.message);

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ success: false, error: err.message });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, error: 'Invalid ID format' });
    return;
  }

  // Duplicate key error (MongoDB error code 11000)
  if ('code' in err && (err as { code: number }).code === 11000) {
    res.status(409).json({ success: false, error: 'Duplicate entry' });
    return;
  }

  res.status(500).json({ success: false, error: 'Internal server error' });
};
