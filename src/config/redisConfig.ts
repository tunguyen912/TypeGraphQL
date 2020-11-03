import * as redis from 'redis';

export const connectRedis = () => {
    const redisClient = redis.createClient({})
    
    redisClient.on('error', () => {
        console.log('Redis error encounterd.')
    })
    
    redisClient.on('connect', () => {
        console.log('Redis Connected.')
    })
}
