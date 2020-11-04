import * as redis from 'redis';
// import * as bluebird from "bluebird";
import * as asyncRedis from 'async-redis'

const redisClient = asyncRedis.createClient(Number(process.env.REDIS_PORT));
// bluebird.promisifyAll(redisClient);
// bluebird.promisifyAll(redis.Multi.prototype);
redisClient.on('connect', () => {
  console.log('RedisDB connecting...');
});
redisClient.on("error", (err) => {
  console.log(err);
});

export default redisClient;