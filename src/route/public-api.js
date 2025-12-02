import express from "express";
import userController from "../controller/user-controller.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { FileController } from "../controller/file-controller.js";
import path from "path";
// import { FileController } from "../controller/file-controller.js";
import rateLimit from "express-rate-limit";

const publicRouter = new express.Router();
// publicRouter.use(errorMiddleware);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    handler: (req, res) => {
        const retryAfter = Math.ceil(
            (req.rateLimit.resetTime - Date.now()) / 1000 / 60
        );
        res.status(429).json({
            status: 429,
            message: "Too many login attempts, please try again later.",
            retryAfter: `${retryAfter} minutes`,
        });
    },
});

// publicRouter.post("/api/login", loginLimiter, userController.login);
publicRouter.post("/api/login", userController.login);
// publicRouter.get("/api/user-info", userController.userInfo);
publicRouter.post("/api/forgot-password", userController.forgotPassword);
publicRouter.post("/api/otp-verification", userController.otpVerification);
publicRouter.post("/api/set-password", userController.setPassword);
publicRouter.get("/api/versions", userController.getVersion);

export { publicRouter };
