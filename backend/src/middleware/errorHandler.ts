import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If response headers have already been sent, pass error to next handler
  if (res.headersSent) {
    return next(err);
  }

  console.error('Global Error Handler caught error:', err);

  // Handle Multer errors specifically
  if (err instanceof multer.MulterError) {
    let message = 'File upload error occurred.';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size is too large. Limit is 5MB for properties and 2MB for site settings logo.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded. Maximum is 10.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Unexpected file field: ${err.field}`;
    }
    return res.status(400).json({ error: message });
  }

  // Handle standard Javascript error (e.g. from fileFilter)
  if (err instanceof Error) {
    return res.status(400).json({ error: err.message });
  }

  // Fallback internal server error
  return res.status(500).json({ error: 'Internal server error.' });
};
