import {Redis} from '@upstash/redis'
import {Ratelimit} from '@upstash/ratelimit'


const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
})

export const rateLimit = new Ratelimit({
    redis,
    // first parameter is the number of requests and second is one time
    limiter: Ratelimit.tokenBucket(1 , '10m' , 10), // here 5 tokens are provided and each token is added every 1 hour
    prefix: '@upstash/ratelimit', // for identifying
    analytics: true  // for dashboard (recording)
})



