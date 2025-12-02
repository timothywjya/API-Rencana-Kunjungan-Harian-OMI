import { DB } from "../application/knex-database.js";
import { decodeId } from "../utils/hash-ids.js";

const getDataLogApps = async (request) => {
    try {
        const dataLogApps = await DB.table("logs")
            .where("url", '/api/apps-log')
            .select(
                "id",
                "method",
                "body",
                "status",
                "status_code",
                "message",
                "error_message",
                "data"
            )

        return { status: 200, data: dataLogApps };
    } catch (e) {
        return {
            status: 500,
            message: "Failed to process your request, please try again!",
            errors: e.message,
        };
    }
};

const insertDataLogApps = async (req, auth) => {
    const logData = req;
    const url = logData.endpoint ? logData.endpoint : null;
    const method = logData.method ? logData.method : null;

    const status_code_resp = logData.level === 'error' ? 500 : null;
    const message_resp = null;
    const error_message_resp = logData.error;
    const body_log = logData.request ? JSON.stringify(logData.request) : null;

    let status_resp = null;
    if (logData.response && logData.response.status !== undefined) {
        status_resp = logData.response.status;
    }

    if (status_resp === null) {
        status_resp = status_code_resp;
    }

    const data_log = {
        level: logData.level,
        url: url,
        method: method,
        timestamp: logData.timestamp,
        headers: logData.headers,
        response: logData.response,
        timetable_ids: decodeId(logData.timetable_ids, auth.user.id) || null
    };

    try {
        const insertData = await DB.table("logs")
            .insert({
                url: "/api/apps-log",
                method: "POST",
                body: body_log,
                status: status_resp,
                status_code: status_code_resp,
                message: message_resp,
                data: JSON.stringify(data_log),
                error_message: error_message_resp,
                created_at: DB.fn.now(),
                created_by: auth.user.id ? auth.user.id : null
            });

        if (insertData) {
            return {
                status: 200,
                message: "Data has been successfully inserted.",
            };
        } else {
            return {
                status: 500,
                message: "Failed to insert log data, please try again!",
                errors: "Please check your data!",
            };
        }
    } catch (e) {
        return {
            status: 500,
            message: "Failed to process your request, please try again!",
            errors: e.message,
        };
    }
};

export default {
    insertDataLogApps,
    getDataLogApps,
};