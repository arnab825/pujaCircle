import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../views/response.view.js';

/**
 * [MIDDLEWARE] Generic Zod Request Validator
 * Validates req.body, req.query, or req.params against a Zod schema.
 * 
 * Usage:
 * router.post('/login', validate(loginSchema), authController.login);
 */
export const validate = (
  schema: ZodSchema,
  target: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req[target]);
      req[target] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issue = error.issues[0];
        const errorMessage = issue ? `${issue.path.join('.') || 'input'}: ${issue.message}` : 'Validation failed';
        const cleanErrors = error.issues.map((i) => ({
          field: i.path.join('.') || 'input',
          message: i.message,
        }));
        sendError(res, errorMessage, 400, cleanErrors);
        return;
      }
      sendError(res, 'Invalid request data', 400);
    }
  };
};
