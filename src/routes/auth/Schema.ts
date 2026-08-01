import Joi from "joi";

export default {
    registerUserSchema : Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
    }).required(),
    loginSchema: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }).required(),
    refreshTokenSchema: Joi.object().keys({
        access_token: Joi.string().required(),
        refresh_token: Joi.string().required(),
    }).required(),
}
