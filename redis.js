const redis = require('redis');

const redisClient = redis.createClient({
    password: process.env.PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 10772
    },
    legacyMode: true
});

redisClient.on('connect', () => {
    console.log('Connected to Redis12345');
})

redisClient.on('error', (err) => {
    console.log(err.message);
})

redisClient.on('ready', () => {
    console.log('Redis is ready');
})

redisClient.on('end', () => {
    console.log('Redis connection ended');
})

process.on('SIGINT', () => {
    redisClient.quit();
})

redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch((err) => {
    console.log(err.message);
})

module.exports = redisClient;