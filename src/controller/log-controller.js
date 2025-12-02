import jwt from "jsonwebtoken";
import logService from "../services/log-service.js";

const getDataLogApps = async (req, res, next) => {
    try {
        const result = await logService.getDataLogApps();
        result.status === 200 ?
            res.status(result.status).json(result) :
            next(result);
    } catch (e) {
        next(e);
    }
};

const insertDataLogApps = async (req, res, next) => {
    try {
        const logData = req.body;

        const token = req.headers.authorization.replace("Bearer ", "");
        const auth = jwt.verify(token, process.env.JWT_KEY);

        const result = await logService.insertDataLogApps(logData, auth);
        result.status === 200 ?
            res.status(result.status).json(result) :
            next(result);
    } catch (e) {
        next(e);
    }
};

export default {
    getDataLogApps,
    insertDataLogApps,
};