import winston from "winston";

test("create new logger with format", () => {
  const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      winston.format.simple()
    ),
    transports: [new winston.transports.Console({})],
  });

  logger.info("Hello Format");
  logger.info("Hello Format");
  logger.info("Hello Format");

  // logger.error("Error");
  // logger.warn("Warning");
  // logger.info("Info");
  // logger.http("Http");
  // logger.verbose("Verbose");
  // logger.debug("Debug");
  // logger.silly("Silly");
});
