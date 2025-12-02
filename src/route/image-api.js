import express from "express";
import path from "path";
import { checkAccessKey } from "../middleware/image-middleware.js";
import { fileURLToPath } from "url";
import fs from "fs";

const imageRouter = new express.Router();
// imageRouter.use(checkAccessKey);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

imageRouter.get("/api/images/:filename", checkAccessKey, (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, "../../public/images/" + filename);

    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({
                status: 404,
                message: `Image '${filename}' not found`,
            });
        }

        res.sendFile(imagePath);
    });
});

export { imageRouter };
