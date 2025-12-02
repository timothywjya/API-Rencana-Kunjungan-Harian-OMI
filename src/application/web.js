import express from "express";
import { publicRouter } from "../route/public-api.js";
import { privateRouter } from "../route/private-api.js";

import path from "path";
import { FileController } from "../controller/file-controller.js";
import { fileURLToPath } from "url";
import { imageRouter } from "../route/image-api.js";
import { authMiddleware } from "../middleware/auth-api.js";
import { errorMiddleware } from "../middleware/error-middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const web = express();

web.use(express.json());

web.use(publicRouter.use(errorMiddleware));
web.use(imageRouter);
web.use(privateRouter.use(authMiddleware));
web.use(privateRouter.use(errorMiddleware));

web.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        // Jika JSON tidak valid, kirimkan respons dengan pesan error
        return res.status(400).json({
            status: 400,
            message: "Invalid JSON payload",
            errors: process.env.APP_SERVER === "PRODUCTION" ? null : err.stack,
        });
    }
});

web.use((req, res, next) => {
    res.status(404).json({ message: "404 Not Found" });
});

// web.use(errorMiddleware);
