import { NextFunction, Request, Response } from 'express';
export const setDefaultLanguage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('language...');
  req.headers['accept-language'] = req.headers['accept-language'] ?? 'EN';
  next();
};

export const authentication = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('authentication...');
  next();
};


export const authorization = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('authorization...');
  next();
};

