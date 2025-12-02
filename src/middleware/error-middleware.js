import jwt from "jsonwebtoken";
import { DB } from "../application/knex-database.js";
import { ResponseError } from "../error/response-error.js";

const errorMiddleware = async (err, req, res, next) => {
    let auth = null;

    try {
        if (req.headers.authorization) {
            auth = jwt.verify(
                req.headers.authorization.replace("Bearer ", ""),
                process.env.JWT_KEY
            );
        }
    } catch (e) {
        return res.status(401)
            .json({
                status: 401,
                message: "Unauthorized: Invalid or expired token.",
                errors: process.env.APP_SERVER === "PRODUCTION" ? null : e.message,
            })
            .end();
    }

    if (req.headers.authorization) {
        auth = jwt.verify(
            req.headers.authorization.replace("Bearer ", ""),
            process.env.JWT_KEY
        );
    }

    try {
        if (!err) {
            next();
            return;
        }

        if (err instanceof SyntaxError && err.status === 500 && "body" in err) {
            return res
                .status(500)
                .json({
                    status: "error",
                    message: "Syntax error",
                    errors: process.env.APP_SERVER === "PRODUCTION" ?
                        null : err.stack,
                })
                .end();
        }

        if (err instanceof ResponseError) {
            // console.log(true);

            res.status(err.status)
                .json({
                    status: err.status,
                    message: err.message,
                })
                .end();
        } else if (err.status == 400 || err.status == 500) {
            await DB.table("logs").insert({
                method: req.method,
                url: req.route.path,
                body: JSON.stringify(req.body),
                status: "error",
                status_code: err.status,
                message: err.status == 400 ? "Bad Request" : "Internal server error",
                error_message: err.errors,
                created_by: auth != null ? auth.user.id : null,
                created_at: DB.fn.now(),
            });

            res.status(err.status)
                .json({
                    status: err.status,
                    message: err.message,
                    errors: process.env.APP_SERVER === "PRODUCTION" ?
                        null : err.errors,
                })
                .end();
        } else if (err.status == 404) {
            await DB.table("logs").insert({
                method: req.method,
                url: req.route.path,
                body: JSON.stringify(req.body),
                status: "error",
                status_code: err.status,
                message: "Not found",
                error_message: err.errors,
                created_by: auth != null ? auth.user.id : null,
                created_at: DB.fn.now(),
            });

            res.status(err.status)
                .json({
                    status: err.status,
                    message: err.message,
                    errors: process.env.APP_SERVER === "PRODUCTION" ?
                        null : err.errors,
                })
                .end();
        } else if (err.status == 200) {
            await DB.table("logs").insert({
                method: req.method,
                url: req.route.path,
                body: JSON.stringify(req.body),
                status: "success",
                status_code: err.status,
                message: err.message != null ? err.message : "",
                data: err.data != null ? JSON.stringify(err.data) : null,
                created_by: auth != null ? auth.user.id : null,
                created_at: DB.fn.now(),
            });

            if (err.message != null) {
                res.status(err.status)
                    .json({
                        status: err.status,
                        message: err.message,
                    })
                    .end();
            } else {
                res.status(err.status)
                    .json({
                        status: err.status,
                        data: err.data,
                    })
                    .end();
            }
        }
    } catch (e) {
        console.log(e.message);

        await DB.table("logs").insert({
            method: req.method,
            url: req.route.path,
            body: JSON.stringify(req.body),
            status: "error",
            status_code: "500",
            message: "Internal server error",
            error_message: e.message,
            created_by: auth != null ? auth.user.id : null,
            created_at: DB.fn.now(),
        });

        res.status(500)
            .json({
                status: err.status,
                message: e.message,
                errors: process.env.APP_SERVER === "PRODUCTION" ?
                    null : err.message,
            })
            .end();
    }
};

export { errorMiddleware };
