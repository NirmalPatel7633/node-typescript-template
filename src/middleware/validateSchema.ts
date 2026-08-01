import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

type ValidationSource = 'body' | 'headers' | 'query' | 'params';

export const validateSchema = (schema: Joi.ObjectSchema, source: ValidationSource = 'body') => (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[source], { abortEarly: false });
    if (error) {
        const message = error.details.map(d => d.message.replace(/['"]+/g, '')).join(', ');
        console.log(message);
        return res.status(400).json({ status: false, message });
    }
    return next();
};
