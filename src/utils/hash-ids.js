import Hashids from "hashids";

export const encodeId = (param, currAuth) => {
    const hashids = new Hashids(process.env.HASHIDS_SALT + currAuth, 16);

    return hashids.encode(param);
};

export const decodeId = (param, currAuth) => {
    const hashids = new Hashids(process.env.HASHIDS_SALT + currAuth, 16);

    return hashids.decode(param).toString();
};
