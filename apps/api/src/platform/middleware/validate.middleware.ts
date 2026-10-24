import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { UnprocessableEntityError } from '../errors/http-errors.js';

interface ValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schema: ValidationSchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = (await schema.query.parseAsync(req.query)) as Request['query'];
      }
      if (schema.params) {
        req.params = (await schema.params.parseAsync(req.params)) as Request['params'];
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error?.name === 'ZodError') {
        const issues = error.errors || error.issues || [];
        const details = issues.map((err: any) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
          code: String(err.code || 'VALIDATION_ERROR').toUpperCase(),
          message: err.message || 'Invalid value',
        }));

        // Build a clean, user-friendly aggregate message
        const friendlySummary = details
          .map((d: any) => d.message)
          .filter(Boolean)
          .join('. ');

        next(new UnprocessableEntityError(friendlySummary || 'Validation failed', details));
      } else {
        next(error);
      }
    }
  };
}
