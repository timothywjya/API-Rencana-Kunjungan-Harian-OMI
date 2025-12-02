import Joi from "joi";
import { joiPasswordExtendCore } from "joi-password";
const joiPassword = Joi.extend(joiPasswordExtendCore);

export const loginValidate = Joi.object({
    nik: Joi.string().max(16).required(),
    password: Joi.string().required(),
});

export const registerUserValidation = Joi.object({
    username: Joi.string().max(100).required(),
    password: Joi.string().max(100).required(),
    name: Joi.string().max(100).required(),
});

export const createUserValidation = Joi.object({
    username: Joi.string().max(100).required(),
    email: Joi.string().max(100).required(),
    password: Joi.string().max(100).required(),
    branch_code: Joi.string().max(2).required(),
    role_id: Joi.string().max(2).required(),
});

export const headersValidation = Joi.object({
    authorization: Joi.string()
        .required()
        .regex(/^Bearer [A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
});

export const forgotPasswordValidation = Joi.object({
    email: Joi.string().max(100).required(),
});

export const otpValidation = Joi.object({
    otp: Joi.string().min(8).max(8).required(),
    email: Joi.string().required(),
});

export const setPasswordValidation = Joi.object({
    password: Joi.string().required(),
    c_password: Joi.string().required(),
    otp: Joi.string().required(),
    email: Joi.string().required(),
});

export const resetPasswordValidation = Joi.object({
    password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .doesNotInclude(["password"])
        .required(),
    c_password: Joi.ref("password"),
});
