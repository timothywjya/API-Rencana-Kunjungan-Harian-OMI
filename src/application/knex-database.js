import knex from "knex";
import knexfile from "../../knexfile.js";
import knexfileOracle from "../../knexfile-oracle.js";
import "dotenv/config";
// import OracleDB from "oracledb";
import os from "os";

// Inisialisasi klien Oracle
// OracleDB.initOracleClient({
//     libDir:
//         os.platform() == "win32"
//             ? process.env.ORACLE_WINDOWS
//             : process.env.ORACLE_LINUX,
// });

let DB = null;
let DB_IGRCRM = knex(knexfileOracle.connIgrCRM);

if (process.env.APP_SERVER == "DEVELOPMENT") {
    DB = knex(knexfile.development);
} else if (process.env.APP_SERVER == "STAGING") {
    DB = knex(knexfile.staging);
} else if (process.env.APP_SERVER == "PRODUCTION") {
    DB = knex(knexfile.production);
}

export { DB, DB_IGRCRM };
