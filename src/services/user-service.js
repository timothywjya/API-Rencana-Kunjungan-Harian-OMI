import { request } from "express";
import { ResponseError } from "../error/response-error.js";

import {
  createUserValidation,
  forgotPasswordValidation,
  headersValidation,
  loginValidate,
  otpValidation,
  resetPasswordValidation,
  setPasswordValidation,
} from "../validation/user-validation.js";
import { validation } from "../validation/validation.js";
import bcrypt from "bcryptjs";
import { DB, DB_IGRCRM } from "../application/knex-database.js";
import jwt from "jsonwebtoken";
import { encodeId } from "../utils/hash-ids.js";
import { mailSender } from "../utils/mail-sender.js";

const expiresIn = "30d";

function createToken(user) {
  // Salin data pengguna tanpa kolom password
  const { password, ...userWithoutPassword } = user;

  // Buat JWT
  const token = jwt.sign({ user: userWithoutPassword }, process.env.JWT_KEY, {
    expiresIn,
  });
  // console.log(process.env.JWT_KEY);

  return token;
}

const login = async (request) => {
  const credentials = validation(loginValidate, request);

  try {
    let check = await DB.table("users")
      .select("id", "role_id", "branch_code", "name", "nik", "password")
      .where("nik", credentials.nik)
      .whereIn("role_id", ["2", "3", "4"])
      .first()
      .then(function (user) {
        if (user)
          return bcrypt
            .compare(
              request.password,
              user.password.replace(/^\$2y(.+)$/i, "$2a$1")
            )
            .then(function (result) {
              if (result) {
                return {
                  status: 200,
                  token: createToken(user),
                  expired_at: Math.floor(Date.now() / 1000) + 60 * 60 * 10 * 30,
                };
              } else {
                return {
                  status: 404,
                  message: "Please check your NIK or Password!",
                };
              }
            });
        else
          return {
            status: 404,
            message: "Data not found!",
          };
      });

    return check;
  } catch (e) {
    return {
      status: 500,
      message: "Failed to process your request, please try again",
      errors: e.message,
    };
  }
};

const userInfo = async (headers, request) => {
  const validate = validation(headersValidation, {
    authorization: headers.authorization,
  });

  try {
    const token = validate.authorization.replace("Bearer ", "");
    let data = jwt.verify(token, process.env.JWT_KEY);

    const decoded = jwt.decode(token, { complete: true });

    const users = await DB.table("users")
      .innerJoin("roles", "roles.id", "=", "role_id")
      .where("users.id", data.user.id)
      .select(
        "users.id",
        "role_id",
        "nik",
        "roles.role",
        "branch_code",
        "name",
        "email",
        "reset_password"
      )
      .first();

    users.id = encodeId(users.id, users.id);

    // GET BRANCH NAME ORACLE
    const branch_name = await DB_IGRCRM.table("tbmaster_cabang")
      .where("cab_kodecabang", users.branch_code)
      .select("cab_namacabang")
      .pluck("cab_namacabang");

    users.branch_name = branch_name.toString();

    return { status: 200, data: users };
  } catch (e) {
    return {
      status: 500,
      message: "Failed to process your request, please try again!",
      errors: e.message,
    };
  }
};

const forgotPassword = async (request) => {
  try {
    const validate = validation(forgotPasswordValidation, request);

    const user = await DB.table("users")
      .where("email", validate.email)
      .first()
      .then(function (user) {
        const otp = Math.random().toString().slice(-8);

        const saveOtp = DB.table("forgot_passwords")
          .insert({
            user_id: user.id,
            otp: otp,
            status: "N",
            created_at: DB.fn.now(),
            updated_at: DB.fn.now(),
          })
          .then(function (result) {
            if (result) {
              const mailResponse = mailSender(
                user.email,
                "RKH OTP",
                `<h1>Please confirm your OTP</h1>
                                <p>Here is your OTP code: ${otp}</p>`
              );

              return {
                status: 200,
                message: "Otp has been send, please check your email!",
              };
            } else {
              return {
                status: 400,
                message: "Failed to send otp, please try again!",
              };
            }
          });

        return saveOtp;
      });

    return user;
  } catch (e) {
    return {
      status: 500,
      message: "Failed to process your request, please try again!",
      erorrs: e.message,
    };
  }
};

const otpVerification = async (request) => {
  const validate = validation(otpValidation, request);

  try {
    const check = await DB.table("forgot_passwords")
      .innerJoin("users", "users.id", "=", "forgot_passwords.user_id")
      .where("otp", validate.otp)
      .where("email", validate.email)
      .whereBetween("forgot_passwords.created_at", [
        DB.raw("(DATE_SUB(NOW(),INTERVAL 5 MINUTE))"),
        DB.raw("NOW()"),
      ])
      .then(function (result) {
        return result.length;
      });

    // console.log(check);
    if (check) {
      const updateStatusUser = await DB.table("forgot_passwords")
        .innerJoin("users", "users.id", "=", "forgot_passwords.user_id")
        .where("otp", validate.otp)
        .where("email", validate.email)
        .update({ status: "Y" });

      if (updateStatusUser) {
        return {
          status: 200,
          message: "Your otp is valid",
        };
      }
    } else {
      return { status: 400, message: "Your otp is invalid" };
    }
  } catch (e) {
    return {
      status: 500,
      message: "Failed to process your, please try again!",
      errors: e.message,
    };
  }
  // });

  // return check;
};

const setPassword = async (request) => {
  const validate = validation(setPasswordValidation, request);

  const trx = await DB.transaction();

  try {
    // CEHCK OTP | VALID OR NOT
    const check = await DB.table("forgot_passwords")
      .innerJoin("users", "users.id", "=", "forgot_passwords.user_id")
      .where("email", validate.email)
      .where("otp", validate.otp)
      .where("set_password", "N")
      .where("status", "Y");

    // IF OTP AND EMAIL IS VALID
    if (check.length > 0) {
      // UPDATE PASSWORD | HASH
      await bcrypt.hash(validate.password, 10).then(function (hash) {
        const updateUser = DB.table("users")
          .where("email", validate.email)
          .update({
            password: hash.replace(/^\$2a(.+)$/i, "$2y$1"),
            reset_password: "Y",
            updated_at: DB.fn.now(),
          })
          .then(function (resultUpdateUser) {
            // UPDATE SET PASSWORD | Y
          });
      });

      // UPDATE FLAG FORGOT PASSWORD | Y
      const updateFlagForgotPassword = await DB.table("forgot_passwords")
        .innerJoin("users", "users.id", "=", "forgot_passwords.user_id")
        .where("status", "Y")
        .where("email", validate.email)
        .where("otp", validate.otp)
        .update({
          set_password: "Y",
        });

      // IF UPDATE FLAG FROGOT PASSWORD IS SUCCESS
      if (updateFlagForgotPassword) {
        await trx.commit();

        return {
          status: 200,
          message: "Password has been successfully update.",
        };
      } else {
        await trx.rollback();

        // IF UPDATE FLAG FROGOT PASSWORD IS FAILED
        return {
          status: 400,
          message: "Failed to update password, please check otp or password!",
        };
      }
    } else {
      await trx.rollback();

      // IF OTP AND EMAIL IS INVALID
      return {
        status: 400,
        message: "Failed to update password, please check otp or password!",
      };
    }
  } catch (e) {
    await trx.rollback();

    return {
      status: 500,
      message: "Failed to process your request, please try again! ",
      errors: e.message,
    };
  }
};

const resetPassword = async (request) => {
  const validate = validation(resetPasswordValidation, request.body);

  const token = request.headers.authorization.replace("Bearer ", "");

  let data = jwt.verify(token, process.env.JWT_KEY);

  // const salt = bcrypt.genSaltSync(10);
  const bcrypPassword = await bcrypt.hash(validate.password, 10);
  // return hash;

  try {
    const updatePassword = await DB.table("users")
      .where("id", data.user.id)
      .update({
        password: bcrypPassword.replace(/^\$2a(.+)$/i, "$2y$1"),
        reset_password: "Y",
        updated_at: DB.fn.now(),
      })
      .then(function (result) {
        if (result) {
          return {
            status: 200,
            message: "Your password has been successfully update",
          };
        } else {
          return {
            status: 400,
            message: "Failed to update your password, please try again",
          };
        }
      });

    return updatePassword;
  } catch (e) {
    return {
      status: 500,
      message: "Failed to process your request, please try again!",
      errors: e.message,
    };
  }
};

const getVersion = async (request) => {
  try {
    const version = await DB.table("versions")
      .select("version")
      .orderBy("id", "desc")
      .first();

    return {
      status: 200,
      data: version,
    };
  } catch (e) {
    return {
      status: 500,
      message: "Failed to process your request, please try again! ",
      errors: e.message,
    };
  }
};

export default {
  login,
  userInfo,
  forgotPassword,
  otpVerification,
  setPassword,
  resetPassword,
  getVersion,
};
