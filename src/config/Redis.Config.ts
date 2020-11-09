import * as asyncRedis from 'async-redis'

const redisClient = asyncRedis.createClient(Number(process.env.REDIS_PORT));
redisClient.on('connect', () => {
  console.log('RedisDB connecting...');
});
redisClient.on("error", (err) => {
  console.log(err);
});

export default redisClient;