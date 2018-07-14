const cron = require("node-cron");
const express = require("express");

app = express();

// Initialize logger
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
        new winston.transports.File({filename: 'logs/monitor.log'})
    ]
});

// Initialize Database
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/monitor.db', (err) => {
    if (err) {
        logger.error(err.message);
    }
    logger.info('Connected to the sqlite database.');
});

const INTERVAL_ONE_MINUTE = 1;
const INTERVAL_FIVE_MINUTES = 2;
const INTERVAL_TEN_MINUTES = 3;
const INTERVAL_30_MINUTES = 4;
const INTERVAL_ONE_HOUR = 5;
const INTERVAL_ONE_DAY = 6;

function runningJob(period) {
    db.serialize(function() {
        db.each("SELECT seq, period, title, monitor_type, query FROM monitors WHERE period = " + period, function(err, row) {
            logger.debug("[job info] seq = " + row.seq + ", title = " + row.title);
            executeProcess(row);
        });
    })
}

function executeProcess(row) {
    try {
        logger.info("type = " + row.monitor_type + ", query = " + row.query);
    } catch (e) {
        logger.error(e);
    }
}

// 매 1분 실행
cron.schedule("* * * * *", function() {
    logger.debug("running a task every minute");
    runningJob(INTERVAL_ONE_MINUTE);
});

// 매 5분 실행
cron.schedule("*/5 * * * *", function() {
	logger.debug("running a task every 5 minutes");
    runningJob(INTERVAL_FIVE_MINUTES);
});

// 매 10분 실행
cron.schedule("*/10 * * * *", function() {
	logger.debug("running a task every 10 minutes");
    runningJob(INTERVAL_TEN_MINUTES);
});

// 매 30분 실행
cron.schedule("0,30 * * * *", function() {
	logger.debug("running a task every 30 minutes");
    runningJob(INTERVAL_30_MINUTES);
});

// 매 1시간 실행
cron.schedule("0 * * * *", function() {
	logger.debug("running a task every 1 hour");
    runningJob(INTERVAL_ONE_HOUR);
});

// 매 1일 실행(매일 오전 9시)
cron.schedule("00 09 * * *", function() {
	logger.debug("running a task every 1 day(9 am)");
    runningJob(INTERVAL_ONE_DAY);
});

logger.info("Start server ....");
app.listen(3128);
