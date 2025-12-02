import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({}),
    new winston.transports.File({
      level: "info",
      filename: "application.log",
    }),
    new winston.transports.File({
      level: "error",
      filename: "application-error.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        winston.format.json()
      ),
    }),
  ],
});
