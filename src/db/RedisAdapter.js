'use strict';
import _ from 'lodash';
import redis from 'redis';
import  Promise from 'bluebird';
let instances = {};
import {redis as client} from '../config';

class Redis{
    constructor(){
        if(_.isEmpty(instances)){
            Promise.promisifyAll(redis);
            var redisClient = redis.createClient(client.port, client.host, client.options);
            instances['redis'] = redisClient;
            if(redisClient){
                console.log('redis is start ok!');
                redisClient.on('error',function (err) {
                    console.log('redis err:',err);
                })
            }
        }
    }
    getInstance(){
        return instances['redis'];
    }
}

module.exports = function () {
    return new Redis().getInstance();
};