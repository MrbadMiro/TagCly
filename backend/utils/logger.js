// utils/logger.js
import winston from "winston";
const { combine, timestamp, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  return `${timestamp} [${level}]: ${message} ${JSON.stringify(metadata)}`;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/activity.log" }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ],
});

export default logger;
