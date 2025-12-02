import Joi from "joi";
import { decode } from "jsonwebtoken";
import { decodeId } from "../utils/hash-ids.js";

export const timetableValidation = Joi.object({
    type: Joi.number().required(),
});

export const chageVisitDateValidation = Joi.object({
    ids: Joi.string().required(),
    new_date: Joi.date().required(),
});

export const uploadTimetableValidation = Joi.object({
    timetable: Joi.object().required(),
});

export const uploadTimetableQuestionValidation = Joi.object({
    timetable_question: Joi.array().items({
        id: Joi.string().required(),
        question: Joi.string().required(),
        type: Joi.string().allow(null),
        answer: Joi.string().required(),
    }),
});

export const insertSalesValidation = Joi.object({
    sales: {
        timetable_id: Joi.required(),
        lpp_reg: Joi.number().required(),
        lpp_fp: Joi.number().required(),
        sls_last_month: Joi.number().required(),
        sls_this_month: Joi.number().required(),
        avg_spd: Joi.number().required(),
        avg_spd_struk: Joi.number().required(),
        gross_margin: Joi.number().required(),
    },
});

export const uploadImageValidation = Joi.object({
    timetable_id: Joi.string().required(),
});

// export const uploadTimetableQuestionValidationData = async (request) => {
//     for (const element of request) {
//         if (decodeId(element.timetable_id, auth.user.id) == false) {
//             console.log(decodeId(element.timetable_id, auth.user.id) == null);
//             return {
//                 status: 500,
//                 message: "Failed to process your request, please try again",
//                 errors: "Timetable_id is invalid",
//             };
//         }
//     }
// };

export const uploadTimetableQuestionValidationData = (request, auth) => {
    for (const element of request) {
        if (decodeId(element.id, auth) == false) {
            // console.log(decodeId(element.timetable_id, auth.user.id) == null);
            return false;
        }
    }

    return true;
};
