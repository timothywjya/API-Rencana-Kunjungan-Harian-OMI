import userService from "../services/user-service.js";

const login = async (req, res, next) => {
    try {
        const result = await userService.login(req.body);
        result.status === 200
            ? res.status(result.status).json(result)
            : next(result);
    } catch (e) {
        next(e);
    }
};

const userInfo = async (req, res, next) => {
    try {
        const result = await userService.userInfo(req.headers, req.body);
        result.status === 200
            ? res.status(result.status).json(result)
            : next(result);
    } catch (e) {
        next(e);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const result = await userService.forgotPassword(req.body);
        result.status === 200
            ? res.status(result.status).json(result)
            : next(result);
    } catch (e) {
        next(e);
    }
};

const otpVerification = async (req, res, next) => {
    try {
        const result = await userService.otpVerification(req.body);
        result.status === 200
            ? res.status(result.status).json(result)
            : next(result);
    } catch (e) {
        next(e);
    }
};

const setPassword = async (req, res, next) => {
    try {
        const result = await userService.setPassword(req.body);
        result.status === 200
            ? res.status(result.status).json(result)
            : next(result);
    } catch (e) {
        next(e);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const result = await userService.resetPassword(req);
        result.status === 200
            ? res.status(result.status).json(result)
            : next(result);
    } catch (e) {
        next(e);
    }
};

const createUser = async (req, res, next) => {
    try {
        const result = await userService.createUser(req.body);
        result.status === 200
            ? res.status(result.status).json(result)
            : next(result);
    } catch (e) {
        next(e);
    }
};

const getDataUser = async (req, res, next) => {
    try {
        const result = await userService.getDataUser(req.body);
        result.status === 200
            ? res.status(result.status).json(result)
            : next(result);
    } catch (e) {
        next(e);
    }
};

const getVersion = async (req, res, next) => {
    try {
        const result = await userService.getVersion();
        result.status === 200
            ? res.status(result.status).json(result)
            : next(result);
    } catch (e) {
        next(e);
    }
};

export default {
    // register,
    // getAllData,
    login,
    userInfo,
    forgotPassword,
    otpVerification,
    setPassword,
    resetPassword,
    getDataUser,
    createUser,
    getVersion,
};
