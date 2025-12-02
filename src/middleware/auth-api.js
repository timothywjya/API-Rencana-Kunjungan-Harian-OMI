import { DB } from "../application/knex-database.js";
import { ResponseError } from "../error/response-error.js";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.replace("Bearer ", "");

            jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
                if (err) {
                    res.status(401)
                        .json({
                            message: "token expired",
                        })
                        .end();
                } else {
                    next();
                }
            });
        } else {
            res.status(400)
                .json({
                    message: "Unauthorized!",
                })
                .end();
        }
    } catch (e) {
        res.status(400)
            .json({
                message: "Unauthorized!",
            })
            .end();
    }
};

export { authMiddleware };
