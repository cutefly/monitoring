const cron = require("node-cron");
const express = require("express");

app = express();

let winston = require('winston');

let logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({filename: 'app.log'})
    ]
});

// 매 1분 실행
cron.schedule("* * * * *", function() {
	logger.debug("running a task every minute");
});

// 매 5분 실행
cron.schedule("*/5 * * * *", function() {
	logger.debug("running a task every 5 minutes");
});

// 매 10분 실행
cron.schedule("*/10 * * * *", function() {
	logger.debug("running a task every 10 minutes");
});

// 매 30분 실행
cron.schedule("0,30 * * * *", function() {
	logger.debug("running a task every 30 minutes");
});

// 매 1시간 실행
cron.schedule("0 * * * *", function() {
	logger.debug("running a task every 1 hour");
});

// 매 1일 실행(매일 오전 9시)
cron.schedule("00 09 * * *", function() {
	logger.debug("running a task every 1 day(9 am)");
});

logger.info("Start server ....");
app.listen(3128);