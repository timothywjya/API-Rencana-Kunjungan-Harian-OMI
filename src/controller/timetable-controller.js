import timetableService, { upload } from "../services/timetable-service.js";
import { uploadImageValidation } from "../validation/timetable-validation.js";
import { validation } from "../validation/validation.js";
import { DB } from "../application/knex-database.js";
import { decodeId } from "../utils/hash-ids.js";
import multer from "multer";
import fs from "fs";
import { promisify } from "util";
import jwt from "jsonwebtoken";

const getTimetable = async (req, res, next) => {
    try {
        const result = await timetableService.getTimetable(req);

        // next(result);
        result.status === 200
            ? res.status(result.status).json(result)
            : next(result);
    } catch (e) {
        next(e);
    }
};

const changeVisitDate = async (req, res, next) => {
    try {
        const result = await timetableService.changeVisitDate(req);

        result.status === 200
            ? res.status(result.status).json(result)
            : next(result);
    } catch (e) {
        next(e);
    }
};

const uploadTimetable = async (req, res, next) => {
    try {
        const result = await timetableService.uploadTimetable(req);

        next(result);
        // result.status === 200
        //     ? res.status(result.status).json(result)
        //     : next(result);
    } catch (e) {
        next(e);
    }
};

const uploadTimetableQuestion = async (req, res, next) => {
    try {
        const result = await timetableService.uploadTimetableQuestion(req);

        next(result);
        // result.status === 200
        //     ? res.status(result.status).json(result)
        //     : next(result);
    } catch (e) {
        next(e);
    }
};

const insertSales = async (req, res, next) => {
    try {
        const result = await timetableService.insertSales(req);

        next(result);
        // result.status === 200
        //     ? res.status(result.status).json(result)
        //     : next(result);
    } catch (e) {
        next(e);
    }
};

const uploadImage = (req, res, next) => {
    const unlinkAsync = promisify(fs.unlink);
    const token = req.headers.authorization.replace("Bearer ", "");
    const auth = jwt.verify(token, process.env.JWT_KEY);

    try {
        upload(req, res, async (err) => {
            // console.log(err);

            if (err instanceof multer.MulterError) {
                // Kesalahan dari Multer
                if (err.code === "LIMIT_FILE_SIZE") {
                    return next({
                        status: 400,
                        message: "File too large. Maximum size is 5MB.",
                        errors: "File too large. Maximum size is 5MB.",
                    });
                }

                if (!req.file) {
                    return res.status(400).json({
                        status: 400,
                        message: "No file uploaded",
                        errors: "No file uploaded",
                    });
                }

                return next({
                    status: 400,
                    message:
                        "Failed to process your request, please try again!",
                    errors: err.message,
                });
            } else if (err) {
                return next({
                    status: 400,
                    message: err.message,
                    errors: err.message,
                });
            }

            // console.log(decodeId(req.body.timetable_id, auth.user.id));
            if (req.file) {
                // DELETE FILE IF FILE EXISTS
                await DB.table("timetables")
                    .select("image")
                    .where("id", decodeId(req.body.timetable_id, auth.user.id))
                    .whereNotNull("image")
                    .first()
                    .then((result) => {
                        if (result) {
                            if (
                                fs.existsSync(
                                    req.file.destination + result.image
                                )
                            ) {
                                unlinkAsync(
                                    req.file.destination + result.image
                                );
                            }
                        }
                    });

                // UPDATE IMAGE | FILE NAME
                await DB.table("timetables")
                    .where("id", decodeId(req.body.timetable_id, auth.user.id))
                    .update({ image: req.file.filename })
                    .then((result) => {
                        // console.log(req.file);
                        if (result) {
                            // res.status(200).json({
                            //     status: 200,
                            //     message: "Image uploaded successfully",
                            // });

                            next({
                                status: 200,
                                message: "Image uploaded successfully",
                            });
                        } else {
                            // DELETE FILE IF UPDATE DATA IS FAILED
                            unlinkAsync(req.file.path);

                            next({
                                status: 400,
                                message:
                                    "Failed to process your request, please try again!",
                                errors: "Timetable id is wrong",
                            });
                        }
                    })
                    .catch((err) => {
                        // DELETE FILE IF UPDATE DATA IS FAILED
                        unlinkAsync(req.file.path);
                        next({
                            status: 500,
                            message:
                                "Failed to process your request, please try again!",
                            errors: err.message,
                        });
                    });
            } else {
                next({
                    status: 404,
                    message:
                        "Failed to process your request, please try again!",
                    errors: "Image not found",
                });
            }
        });
    } catch (e) {
        // next(e);
        next({
            status: 500,
            message: "Failed to process your request, please try again!",
            errors: e.message,
        });
    }
};

const getTimetableHistory = async (req, res, next) => {
    try {
        const result = await timetableService.getTimetableHistory(req);

        result.status === 200
            ? res.status(result.status).json(result)
            : next(result);
    } catch (e) {
        next(e);
    }
};

export default {
    getTimetable,
    changeVisitDate,
    uploadTimetable,
    uploadTimetableQuestion,
    insertSales,
    uploadImage,
    getTimetableHistory,
};
