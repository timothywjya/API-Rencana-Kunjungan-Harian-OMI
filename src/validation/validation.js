import { ResponseError } from "../error/response-error.js";

const validation = (schema, request) => {
    const result = schema.validate(request, {
        abortEarly: false,
        allowUnknown: false,
    });

    if (result.error) {
        throw new ResponseError(400, result.error.message);
        // throw new ResponseError(400, "Please complete the required data!");
    } else {
        return result.value;
    }
};

export { validation };
