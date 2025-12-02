import { DB, DB_IGRCRM } from "../application/knex-database.js";
import {
    chageVisitDateValidation,
    insertSalesValidation,
    timetableValidation,
    uploadImageValidation,
    uploadTimetableQuestionValidation,
    uploadTimetableQuestionValidationData,
    uploadTimetableValidation,
} from "../validation/timetable-validation.js";
import { validation } from "../validation/validation.js";
import jwt from "jsonwebtoken";
import { decodeId, encodeId } from "../utils/hash-ids.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { format } from "date-fns";
import url from "url";
import { exit } from "process";

// Setup direktori untuk menyimpan gambar
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.join(__dirname, "../../public/images/");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

// Konfigurasi multer dengan validasi
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    // Allowed ext
    const filetypes = /jpeg|jpg/;
    // Check ext
    const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error(" Only JPEG and JPG images are allowed!"));
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Batas ukuran file 5MB
    },
}).single("image");

const getTimetable = async (request) => {
    const validate = validation(timetableValidation, request.body);

    try {
        const token = request.headers.authorization.replace("Bearer ", "");

        const myAuth = jwt.verify(token, process.env.JWT_KEY);

        const currentDate = new Date();

        const dataTimetable = await DB.table("timetables")
            .where("timetable_type_id", request.body.type)
            .where("role_id", myAuth.user.role_id)
            .where("approved_status", "Y")
            .where("implemented_by", myAuth.user.id)
            .whereNull("check_in")
            .whereNull("check_out")
            .where("visit_date", ">=", format(currentDate, "yyyy-MM-dd"))
            .select(
                "id",
                "timetable_type_id",
                "role_id",
                "branch_code",
                "store_code",
                "visit_date",
                "approved_status"
            )
            .then((result) => {
                result.forEach((element) => {
                    element.id = encodeId(element.id, myAuth.user.id);
                    element.timetable_type_id = encodeId(
                        element.timetable_type_id,
                        myAuth.user.id
                    );
                    element.role_id = encodeId(element.role_id, myAuth.user.id);
                    element.visit_date = format(
                        element.visit_date,
                        "dd-MM-yyyy"
                    );
                });

                return result;
            });

        // GET STORE NAME FROM ORACLE & GET QUESTION MSYQL
        await Promise.all(
            dataTimetable.map(async (element) => {
                const store_name = await DB_IGRCRM.table(
                    "tbmaster_tokoigr_interface"
                )
                    .where("tko_kodeomi", element.store_code)
                    .pluck("tko_namaomi");

                // Add Column Store Name
                element.store_name = store_name.toString();

                //Add Column New Visit Date
                const newVisitDate = await DB.table("date_suggestions")
                    .innerJoin(
                        "timetables",
                        "timetables.id",
                        "=",
                        "timetable_id"
                    )
                    .select("date", "status")
                    .where("timetable_id", decodeId(element.id, myAuth.user.id))
                    .orderBy("date_suggestions.id", "DESC")
                    .first()
                    .then((result) => {
                        if (result) {
                            result.date = format(
                                new Date(result.date),
                                "dd-MM-yyyy"
                            );
                            element.new_visit_date = result;
                        }
                    });

                //Add Column Question
                const question = await DB.table("timetable_questions")
                    .where("timetable_id", decodeId(element.id, myAuth.user.id))
                    .then(async (resultQuestion) => {
                        // console.log(resultQuestion);
                        if (resultQuestion[0]["checklist_id"] != null) {
                            // CHECKLISTS
                            const dataQuestion = await DB.table(
                                "timetable_questions"
                            )
                                .innerJoin(
                                    "checklists",
                                    "checklists.id",
                                    "=",
                                    "checklist_id"
                                )
                                .leftJoin(
                                    "question_types",
                                    "question_types.id",
                                    "=",
                                    "qt_id"
                                )
                                .where(
                                    "timetable_id",
                                    decodeId(element.id, myAuth.user.id)
                                )
                                .whereIn(
                                    "checklists.id",
                                    resultQuestion.map(
                                        (item) => item["checklist_id"]
                                    )
                                )
                                .select(
                                    "timetable_questions.id",
                                    "checklists.question",
                                    "question_types.type"
                                )
                                .orderBy("checklists.id", "ASC");

                            // Add HashIDS
                            dataQuestion.forEach((dataQuestionElement) => {
                                dataQuestionElement.id = encodeId(
                                    dataQuestionElement.id,
                                    myAuth.user.id
                                );
                            });
                            element.question = dataQuestion;
                        } else {
                            // REVIEWS
                            const dataQuestion = await DB.table(
                                "timetable_questions"
                            )
                                .innerJoin(
                                    "reviews",
                                    "reviews.id",
                                    "=",
                                    "review_id"
                                )
                                .where(
                                    "timetable_id",
                                    decodeId(element.id, myAuth.user.id)
                                )
                                .whereIn(
                                    "reviews.id",
                                    resultQuestion.map(
                                        (item) => item["review_id"]
                                    )
                                )
                                .select(
                                    "timetable_questions.id",
                                    "reviews.question"
                                )
                                .orderBy("reviews.id", "ASC");

                            // Add HashIDS
                            dataQuestion.forEach((dataQuestionElement) => {
                                dataQuestionElement.id = encodeId(
                                    dataQuestionElement.id,
                                    myAuth.user.id
                                );
                            });
                            element.question = dataQuestion;
                        }
                    });
            })
        );

        return { status: 200, data: dataTimetable };
    } catch (e) {
        return {
            status: 500,
            message: "Failed to process your request, please try again!",
            errors: e.message,
        };
    }
};

const changeVisitDate = async (request) => {
    const validate = validation(chageVisitDateValidation, request.body);
    const token = request.headers.authorization.replace("Bearer ", "");
    let data = jwt.verify(token, process.env.JWT_KEY);

    const myAuth = jwt.verify(token, process.env.JWT_KEY);

    try {
        const insertData = await DB.table("date_suggestions")
            .insert({
                timetable_id: decodeId(request.body.ids, myAuth.user.id),
                date: request.body.new_date,
                status: "N",
                created_by: data.user.id,
                created_at: DB.fn.now(),
            })
            .then((result) => {
                if (result) {
                    return {
                        status: 200,
                        message: "Data has been successfully update.",
                    };
                } else {
                    return {
                        status: 500,
                        message:
                            "Failed to change visit date, please try again!",
                        errors: "Please check your data!",
                    };
                }
            })
            .catch(function (err) {
                return {
                    status: 500,
                    message: "Failed to save visit date, please try again!",
                    errors: err.message,
                };
            });
        return insertData;
    } catch (error) {
        return {
            status: 500,
            message: "Failed to process your request, please try again!",
            errors: e.message,
        };
    }
};

const uploadTimetable = async (request, next) => {
    const validate = validation(uploadTimetableValidation, request.body);

    try {
        const token = request.headers.authorization.replace("Bearer ", "");
        const auth = jwt.verify(token, process.env.JWT_KEY);

        const timetable = request.body.timetable;

        const update = await DB.table("timetables")
            .where("id", decodeId(timetable.id, auth.user.id))
            .andWhere(function () {
                this.where(
                    "visit_date",
                    format(timetable.check_in, "yyyy-MM-dd")
                );
                // this.where(
                //     "visit_date",
                //     format(timetable.check_out, "yyyy-MM-dd")
                // );
                // this.where("visit_date", format(new Date(), "yyyy-MM-dd"));
            })
            .update({
                check_in: timetable.check_in,
                check_out: timetable.check_out,
                implemented_by: auth.user.id,
                implemented_at: timetable.check_in,
                updated_by: auth.user.id,
            })
            .then((result) => {
                if (result) {
                    return {
                        status: 200,
                        message: "Data has been successfully update.",
                    };
                } else {
                    return {
                        status: 400,
                        message:
                            "Failed to upload timetable, please try again!",
                        errors: "Check in or Check out is invalid",
                    };
                }
            })
            .catch((err) => {
                return {
                    status: 500,
                    message: "Failed to upload timetable, please try again!",
                    errors: err.message,
                };
            });
        return update;
    } catch (e) {
        return {
            status: 500,
            message: "Failed to process your request, please try again!",
            errors: e.message,
        };
    }
};

const uploadTimetableQuestion = async (request) => {
    const token = request.headers.authorization.replace("Bearer ", "");
    const auth = jwt.verify(token, process.env.JWT_KEY);

    const trx = await DB.transaction();

    try {
        const question = request.body.timetable_question;

        const validateData = uploadTimetableQuestionValidationData(
            question,
            auth.user.id
        );

        if (validateData == false) {
            return {
                status: 400,
                message: "Failed to process your request, please try again",
                errors: "Timetable_id is invalid",
            };
        }

        const validate = validation(
            uploadTimetableQuestionValidation,
            request.body
        );

        for (const element of question) {
            const update = await trx("timetable_questions")
                .innerJoin("timetables", "timetables.id", "=", "timetable_id")
                .where(
                    "timetable_questions.id",
                    decodeId(element.id, auth.user.id)
                )
                // .andWhere(function () {
                //     this.where("visit_date", format(new Date(), "yyyy-MM-dd"));
                // })
                .update({
                    answer: element.answer,
                    "timetable_questions.updated_at": DB.fn.now(),
                })
                .catch((err) => {
                    trx.rollback();

                    return {
                        status: 500,
                        message:
                            "Failed to upload timetable, please try again!",
                        errors: err.message,
                    };
                });

            if (!update) {
                await trx.rollback();

                return {
                    status: 400,
                    message: "Failed to upload timetable, please try again!",
                    errors: "Visit date is different from server date",
                };
            }
        }

        trx.commit();

        return {
            status: 200,
            message: "Question has been successfully upload.",
        };
    } catch (e) {
        await trx.rollback();

        return {
            status: 500,
            message: "Failed to process your request, please try again!",
            errors: e.message,
        };
    }
};

const insertSales = async (request) => {
    const token = request.headers.authorization.replace("Bearer ", "");
    const auth = jwt.verify(token, process.env.JWT_KEY);

    const sales = request.body.sales;

    if (decodeId(sales.timetable_id, auth.user.id) == "") {
        return {
            status: 400,
            message: "Failed to process your request, please try again",
            errors: "Timetable_id is invalid!",
        };
    }

    const validate = validation(insertSalesValidation, request.body);
    console.log(decodeId(sales.timetable_id, auth.user.id));

    try {
        const checkVisitDate = await DB.table("timetables")
            .where("id", decodeId(sales.timetable_id, auth.user.id))
            // .andWhere(function () {
            //     this.where("visit_date", format(new Date(), "yyyy-MM-dd"));
            // })
            .first();

        if (!checkVisitDate) {
            return {
                status: 400,
                message: "Failed to upload timetable, please try again!",
                errors: "Visit date is different from server date",
            };
        }

        // DELETE SALES
        await DB.table("sales")
            .where("timetable_id", decodeId(sales.timetable_id, auth.user.id))
            .del();

        // GET DATA SALES TYPE
        const salesType = await DB.table("sales_types").orderBy("id", "ASC");
        let dataInsert = [];

        // CREATE DATA INSERT : OBJECT
        await salesType.forEach((element) => {
            let temp = {};

            temp.sales_type_id = element.id;
            temp.timetable_id = decodeId(sales.timetable_id, auth.user.id);
            temp.created_by = auth.user.id;
            temp.created_at = DB.fn.now();

            if (element.id == 1) {
                temp.total = sales.lpp_reg;
            } else if (element.id == 2) {
                temp.total = sales.lpp_fp;
            } else if (element.id == 3) {
                temp.total = sales.sls_last_month;
            } else if (element.id == 4) {
                temp.total = sales.sls_this_month;
            } else if (element.id == 5) {
                temp.total = sales.avg_spd;
            } else if (element.id == 6) {
                temp.total = sales.avg_spd_struk;
            } else if (element.id == 7) {
                temp.total = sales.gross_margin;
            }

            dataInsert.push(temp);
        });

        return await DB.table("sales")
            .insert(dataInsert)
            .then((result) => {
                // console.log(result);
                return {
                    status: 200,
                    message: "Sales has been successfully upload.",
                };
            })
            .catch((error) => {
                return {
                    status: 500,
                    message: "Failed to process your request, please try again",
                    errors: error.message,
                };
            });
    } catch (e) {
        return {
            status: 500,
            message: "Failed to process your request, please try again!",
            errors: e.message,
        };
    }
};

const uploadImage = (request, res) => {
    // return request;
    const validate = validation(uploadImageValidation, request);

    try {
        // DB.table("timetables")
        //     .where("id", decodeId(request.timetable_id))
        //     .update({"image" })
    } catch (error) {
        res.status(500).json({
            message: "File upload failed",
            error: error.message,
        });
    }
};

const getTimetableHistory = async (request) => {
    const token = request.headers.authorization.replace("Bearer ", "");
    const auth = jwt.verify(token, process.env.JWT_KEY);

    try {
        const history = await DB.table("timetables")
            .innerJoin(
                "timetable_types",
                "timetable_types.id",
                "=",
                "timetable_type_id"
            )
            .whereNotNull("check_in")
            .where("implemented_by", auth.user.id)
            .whereBetween("visit_date", [
                format(
                    new Date(new Date().setDate(new Date().getDate() - 30)),
                    "yyyy-MM-dd"
                ),
                format(new Date(), "yyyy-MM-dd"),
            ])
            .select(
                "timetables.id",
                "timetable_type_id",
                "type",
                "role_id",
                "branch_code",
                "store_code",
                "visit_date",
                "check_in",
                "check_out",
                "image"
            )
            .orderBy("visit_date", "desc")
            .then((result) => {
                result.forEach((element) => {
                    element.id = encodeId(element.id, auth.user.id);
                    element.timetable_type_id = encodeId(
                        element.timetable_type_id,
                        auth.user.id
                    );
                    element.role_id = encodeId(element.role_id, auth.user.id);
                    element.visit_date = format(
                        new Date(element.visit_date),
                        "dd-MM-yyyy"
                    );
                    element.check_in = format(
                        new Date(element.check_in),
                        "yyyy-MM-dd HH:mm:ss"
                    );
                    element.check_out = format(
                        new Date(element.check_out),
                        "yyyy-MM-dd HH:mm:ss"
                    );
                    element.image =
                        process.env.URL +
                        "/api/images/" +
                        encodeURIComponent(element.image);
                });

                return result;
            });

        await Promise.all(
            history.map(async (element) => {
                const store_name = await DB_IGRCRM.table(
                    "tbmaster_tokoigr_interface"
                )
                    .where("tko_kodeomi", element.store_code)
                    .pluck("tko_namaomi");

                // Add Column Store Name
                element.store_name = store_name.toString();

                //Add Column Question
                const question = await DB.table("timetable_questions")
                    .where("timetable_id", decodeId(element.id, auth.user.id))
                    .then(async (resultQuestion) => {
                        // console.log(resultQuestion);
                        if (resultQuestion[0]["checklist_id"] != null) {
                            // CHECKLISTS
                            const dataQuestion = await DB.table(
                                "timetable_questions"
                            )
                                .innerJoin(
                                    "checklists",
                                    "checklists.id",
                                    "=",
                                    "checklist_id"
                                )
                                .leftJoin(
                                    "question_types",
                                    "question_types.id",
                                    "=",
                                    "qt_id"
                                )
                                .where(
                                    "timetable_id",
                                    decodeId(element.id, auth.user.id)
                                )
                                .whereIn(
                                    "checklists.id",
                                    resultQuestion.map(
                                        (item) => item["checklist_id"]
                                    )
                                )
                                .select(
                                    "timetable_questions.id",
                                    "checklists.question",
                                    "question_types.type",
                                    "timetable_questions.answer"
                                )
                                .orderBy("checklists.id", "ASC");

                            // Add HashIDS
                            dataQuestion.forEach((dataQuestionElement) => {
                                dataQuestionElement.id = encodeId(
                                    dataQuestionElement.id,
                                    auth.user.id
                                );
                            });
                            element.question = dataQuestion;
                        } else {
                            // REVIEWS
                            const dataQuestion = await DB.table(
                                "timetable_questions"
                            )
                                .innerJoin(
                                    "reviews",
                                    "reviews.id",
                                    "=",
                                    "review_id"
                                )
                                .where(
                                    "timetable_id",
                                    decodeId(element.id, auth.user.id)
                                )
                                .whereIn(
                                    "reviews.id",
                                    resultQuestion.map(
                                        (item) => item["review_id"]
                                    )
                                )
                                .select(
                                    "timetable_questions.id",
                                    "reviews.question",
                                    "timetable_questions.answer"
                                )
                                .orderBy("reviews.id", "ASC");

                            // Add HashIDS
                            dataQuestion.forEach((dataQuestionElement) => {
                                dataQuestionElement.id = encodeId(
                                    dataQuestionElement.id,
                                    auth.user.id
                                );
                            });
                            element.question = dataQuestion;
                        }
                    });

                const sales = await DB.table("sales")
                    .innerJoin(
                        "sales_types",
                        "sales_types.id",
                        "=",
                        "sales_type_id"
                    )
                    .where("timetable_id", decodeId(element.id, auth.user.id))
                    .select("sales.id", "type", "total")
                    .then(async (resultSales) => {
                        resultSales.forEach((elementResultSales) => {
                            elementResultSales.id = encodeId(
                                elementResultSales.id,
                                auth.user.id
                            );
                        });

                        element.sales = resultSales;
                    });
            })
        );

        return {
            status: 200,
            data: history,
        };
    } catch (e) {
        return {
            status: 500,
            message: "Failed to process your request, please try again!",
            errors: e.message,
        };
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
