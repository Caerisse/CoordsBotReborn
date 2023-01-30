const winston = require('winston');
require('winston-mongodb');

module.exports = {
  getLogger(module, name) {
    // Logger configuration

    const myTransports = [
      new winston.transports.Console({
        level: 'silly',
      }),
      new winston.transports.File({
        level: 'debug',
        filename: './logs/bot.log',
        maxsize: 7000000,
        maxFiles: 50,
        tailable: true,
        // zippedArchive: true,
      }),
    ];

    // if (process.env.MONGO_DB_URL) {
    //   myTransports.push(
    //     new winston.transports.MongoDB({
    //       level: 'debug',
    //       db: process.env.MONGO_DB_URL,
    //       options: {
    //         useUnifiedTopology: true,
    //       },
    //       collection: 'logs',
    //       format: winston.format.combine(
    //         winston.format.timestamp(),
    //         winston.format.json(),
    //       ),
    //     }),
    //   );
    // }

    const logConfiguration = {
      transports: myTransports,
      // format: winston.format.json(),
      format: winston.format.combine(
        winston.format.label({ label: module === name ? `[${name}]` : `[${module}][${name}]` }),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf(
          (info) => `${info.timestamp} - ${info.level} ${info.label}: ${info.message}`,
        ),
      ),
    };

    if (name === 'app') {
      logConfiguration.exceptionHandlers = myTransports;
      logConfiguration.exitOnError = false;
    }

    winston.loggers.add(name, logConfiguration);
    const logger = winston.loggers.get(name);
    return logger;
  },
};
