'use strict';
import _ from 'lodash';
import  req  from 'request';
import md5  from 'md5';
import C from '../config';


/**
 * @GET请求
 * @param url
 * @returns {Promise|Promise<T>}
 */
exports.httpGet = async (url) =>{
    return  new Promise(function(resolve,reject){
        req(url,function(err,response){
            if(err){ reject(err);}
            if(response.body){
                resolve(response.body);
            }
        });
    });
}



/**
 * @返回信息
 * @param status
 * @param msg
 * @param level
 * @param data
 * @returns {{}}
 */
exports.returnMsg = (status = 200, msg = '', level = 3, data = {}) =>{
    let returnData = {};
    returnData.status = status || 200;
    returnData.message = {
        msg: msg || "",
        level: level || 3,
        time: Date.now()
    };
    returnData.result = {};
    if (typeof data === "object" && data !== null) {
        returnData.result = data;
    }
    return returnData;
};



/**
 *@生成随机数函数16为
 *
 **/
exports.getVerifyCode = (length) =>{
    let seed ="0123456789";
    length = length>0 && length<=seed.length ? length :seed.length;
    let randStr="";
    for(let i =0;i<length;i++){
        let index = Math.floor(Math.random() * seed.length);
        randStr+=seed[index];
    }
    console.log("genarate randStr is:"+randStr);
    return randStr;
}

/**
 *@生成随机数函数16为
 *
 **/
exports.getNonceStr= ()=>{
    let seed ="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let randStr="";
    for(let i =0;i<32;i++){
        let index = Math.floor(Math.random() * seed.length);
        randStr+=seed[index];
    }
    console.log("genarate randStr is:"+randStr);
    return randStr;
}

/**
 * @获取请求ip地址
 * @param ctx
 * @returns {string}
 */
exports.getIp =(ctx) =>{
    let start = ctx.ip.lastIndexOf(':')+1;
    return  ctx.ip.substr(start);
}

/**
 * @翻译redis中的key 支持【%s,%d,%f】
 * @param str
 * @param value
 * @returns {string|*|XML|void}
 */
exports.getRedisK =(str,value) =>{
    return str.replace(/%[s|d|f]/,value);
}






