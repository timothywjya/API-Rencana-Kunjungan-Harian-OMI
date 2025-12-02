import winston from "winston";

test("create new logger with format", () => {
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
    ],
  });

  logger.info("Hello Format");
  logger.error("Hello Error");
  logger.http("Hello Http");
  logger.debug("Hello Format");
  logger.verbose("Hello Format");

  // logger.error("Error");
  // logger.warn("Warning");
  // logger.info("Info");
  // logger.http("Http");
  // logger.verbose("Verbose");
  // logger.debug("Debug");
  // logger.silly("Silly");
});
