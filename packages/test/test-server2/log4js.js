
const cluster = require('cluster');

const WORKER_ID = process.env.pm_id || cluster.worker.id;

module.exports = {
    appenders: {
        file: {
            type: 'file',
            filename: `log/mashroom.${WORKER_ID}.log`,
            maxLogSize: 10485760, numBackups: 3,
            layout: {
                type: 'pattern',
                pattern: '%d %p %X{clientIP} %X{username} %c - %m'
            },
        },
        console: {
            type: 'console',
            layout: {
                type: 'colored'
            },
        },
    },
    categories: {
        default: {
            appenders: ['file', 'console'],
            level: 'info'
        }
    },
    disableClustering: true
};
