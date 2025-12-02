import winston, { level } from "winston";
import TransportStream from "winston-transport";

// test("create new logger", () => {

class MyTransport extends TransportStream {
  constructor(option) {
    super(option);
  }

  log(info, next) {
    console.log(`${new Date()}: ${info.level.toUpperCase()}: ${info.message}`);
  }
}

global.loggerApp = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    winston.format.simple()
  ),
  transports: [
    // new MyTransport({}),
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

// logger.error("Error");
// logger.warn("Warning");
// logger.info("Info");
// logger.http("Http");
// logger.verbose("Verbose");
// logger.debug("Debug");
// logger.silly("Silly");
// });
