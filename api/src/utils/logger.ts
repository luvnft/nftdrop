import { createLogger, format, transports } from "winston";

const logFormatter = format.printf((info) => {
  let { timestamp, level, code, stack, message } = info;

  // print out http error code w/ a space if we have one
  code = code ? ` ${code}` : "";
  // print the stack if we have it, message otherwise.
  message = stack || message;

  return `${timestamp} ${level}${code}: ${message}`;
});

export default createLogger({
  level: "info",
  // put the errors formatter in the parent for some reason, only needed there:
  format: format.errors({ stack: true }),
  transports: new transports.Console({
    format: format.combine(format.timestamp(), logFormatter),
  }),
});
