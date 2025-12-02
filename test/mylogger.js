import winston, { level } from "winston";

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({}),
    new winston.transports.File({
      filename: "application.log",
    }),
    new winston.transports.File({
      level: "error",
      filename: "application-error.log",
    }),
  ],
});
