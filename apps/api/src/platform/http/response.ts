import type { Request, Response } from 'express';
import type { ApiSuccess, PaginationMeta } from '@unimarket/shared';

function createMeta(req: Request) {
  return {
    timestamp: new Date().toISOString(),
    ...(req.requestId ? { requestId: req.requestId } : {}),
  };
}

export function sendSuccess<T>(req: Request, res: Response, data: T, statusCode = 200): Response {
  const payload: ApiSuccess<T> = {
    success: true,
    data,
    meta: createMeta(req),
  };
  return res.status(statusCode).json(payload);
}

export function sendCreated<T>(req: Request, res: Response, data: T): Response {
  return sendSuccess(req, res, data, 201);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).end();
}

export function sendPaginated<T>(
  req: Request,
  res: Response,
  items: T[],
  pagination: PaginationMeta,
  statusCode = 200
): Response {
  return sendSuccess(
    req,
    res,
    {
      items,
      pagination,
    },
    statusCode
  );
}
