import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, stack, ...metadata }) => {
    let log = `${ts} [${level}]: ${message}`;
    if (stack) log += `\n${stack}`;
    if (Object.keys(metadata).length > 0) log += ` ${JSON.stringify(metadata)}`;
    return log;
});

const levels: Record<string, number> = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const level = (): string => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'http';
};

const transports: winston.transport[] = [
    new winston.transports.Console({
        format: combine(colorize({ all: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
    }),
];

if (process.env.NODE_ENV === 'production') {
    transports.push(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
            maxsize: 5242880,
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
            maxsize: 5242880,
            maxFiles: 5,
        })
    );
}

const winstonLogger = winston.createLogger({
    level: level(),
    levels,
    transports,
    exitOnError: false,
});

export default winstonLogger;
