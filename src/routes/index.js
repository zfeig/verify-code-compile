'use strict';
import _ from 'lodash';
import  uuid from 'uuid';
import  config  from '../config';
import Router from 'koa-router';
import captcha from 'captchapng';
import  redis from '../db/RedisAdapter';
import {returnMsg,getVerifyCode,getIp,getRedisK} from '../common';
const router = new Router();
const DB = new redis();
/**
 * @生成验证码图片并设置CODE
 */
router.get(config.apiPre + '/:apiVer/captcha',async(ctx,next) =>{
    let code = getVerifyCode(5);
    let rdKey = uuid.v4().toUpperCase();//生成唯一的tokenkey
    let requestK = getRedisK(config.redisKey.request,getIp(ctx));
    let tokenK = getRedisK(config.redisKey.token,rdKey);
    let ret = await DB.incrbyAsync(requestK,1);//更新同一ip请求图片总数
    console.log(ret);
    if(ret == 1){//首次刷新请求，设置同一ip刷新请求字段默认有效性
        await  DB.expireAsync(requestK,config.limit.limitexpire);//设置默认过期时间
    }
    if(ret <= config.limit.request){
        await DB.setAsync(tokenK,code);//保存token和key
        await  DB.expireAsync(tokenK,config.limit.expire);//设置默认过期时间
    }else{
        if(ret == config.limit.request+1){
            //设置过期时间1个小时
            await DB.expireAsync(requestK,config.limit.reqagain);
        }
        return ctx.body = returnMsg(400,'超过请求极限,'+config.limit.reqagain/3600+'小时后再试',1);
    }

    //generate pic
    // let p = new captcha(80,30,code); // width,height,numeric captcha
    // p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
    // p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

    let p = new captcha(config.captcha.size.width,config.captcha.size.height,code);
    p.color(config.captcha.background.red,config.captcha.background.green, config.captcha.background.blue, config.captcha.background.alpha);
    p.color(config.captcha.color.red, config.captcha.color.green, config.captcha.color.blue, config.captcha.color.alpha);

    let img = p.getBase64();
    let imgbase64 = new Buffer(img,'base64');
    ctx.set('Content-Type','image/png');
    ctx.set('CS_CODE',rdKey);
    return ctx.body = imgbase64;
});

/**
 * @step1 生成验证码和key
 */
router.get(config.apiPre + '/:apiVer/generateCode',async(ctx,next) =>{
    let code = getVerifyCode(5);
    let rdKey = uuid.v4().toUpperCase();//生成唯一的tokenkey
    let requestK = getRedisK(config.redisKey.request,getIp(ctx));
    let tokenK = getRedisK(config.redisKey.token,rdKey);
    let ret = await DB.incrbyAsync(requestK,1);//更新同一ip请求图片总数
    console.log(ret);
    if(ret == 1){//首次刷新请求，设置同一ip刷新请求字段默认有效性
        await  DB.expireAsync(requestK,config.limit.limitexpire);//设置默认过期时间
    }
    if(ret <= config.limit.request){
        await DB.setAsync(tokenK,code);//保存token和key
        await  DB.expireAsync(tokenK,config.limit.expire);//设置默认过期时间
        let p = new captcha(config.captcha.size.width,config.captcha.size.height,code);
        p.color(config.captcha.background.red,config.captcha.background.green, config.captcha.background.blue, config.captcha.background.alpha);
        p.color(config.captcha.color.red, config.captcha.color.green, config.captcha.color.blue, config.captcha.color.alpha);
        let img = p.getBase64();
        return ctx.body = returnMsg(200,'生成验证码成功',1,{code:code,key:rdKey,img:img});
    }else{
        if(ret == config.limit.request+1){
            //设置过期时间1个小时
            await DB.expireAsync(requestK,config.limit.reqagain);
        }
        return ctx.body = returnMsg(400,'超过请求极限,'+config.limit.reqagain/3600+'小时后再试',1);
    }
});

/**
 * @step2 通过key和code组成动态图片地址
 */
router.get(config.apiPre + '/:apiVer/:key/:code'+'.png',async(ctx,next) =>{
    let code = ctx.params.code ? ctx.params.code : "";
    let key = ctx.params.key ? ctx.params.key : "";
    //参数校验
    if(_.trim(code).length == 0 || _.trim(key).length == 0){
        return ctx.body = returnMsg(400,'参数错误，请检查！',3);
    }
    let p = new captcha(config.captcha.size.width,config.captcha.size.height,code);
    p.color(config.captcha.background.red,config.captcha.background.green, config.captcha.background.blue, config.captcha.background.alpha);
    p.color(config.captcha.color.red, config.captcha.color.green, config.captcha.color.blue, config.captcha.color.alpha);

    let img = p.getBase64();
    console.log(img);
    let imgbase64 = new Buffer(img,'base64');
    ctx.set('Content-Type','image/png');
    ctx.set('CS_CODE',key);
    return ctx.body = imgbase64;
});

/**
 * @异步验证用户输入的验证码状态
 */
router.post(config.apiPre +"/:apiVer/checkCodeAsync",async(ctx,next) =>{
    let code = ctx.request.body.code ? ctx.request.body.code :"";
    let key = ctx.request.body.key ? ctx.request.body.key:"";
    //参数校验
    if(_.trim(code).length == 0 || _.trim(key).length == 0){
        return ctx.body = returnMsg(400,'参数错误，请检查',3);
    }
    //默认返回结果
    let verify = {verified:false};
    let msg = "验证失败";
    //获取token键值对
    let tokenK = getRedisK(config.redisKey.token,key);console.log('get token:',tokenK);
    let tokenkey = await DB.getAsync(tokenK);
    console.log('get code:',tokenkey);
    //验证验证码
    if(tokenkey == code && tokenkey != null && tokenkey.length > 0){
        verify.verified =true;
        msg = '验证成功';
        return ctx.body = returnMsg(200,msg,1,verify);
    }else if(tokenkey == null){
        msg = '验证码已过期';
    }
    return ctx.body = returnMsg(400,msg,1,);
});

/**
 * @验证验证码有效性
 */
router.post(config.apiPre +"/:apiVer/checkCode",async(ctx,next) =>{
    let code = ctx.request.body.code ? ctx.request.body.code :"";
    let key = ctx.request.body.key ? ctx.request.body.key:"";
    //参数校验
    if(_.trim(code).length == 0 || _.trim(key).length == 0){
        return ctx.body = returnMsg(400,'参数错误，请检查!',3);
    }
    //默认返回结果
    let verify = {verified:false};
    let msg = "验证失败";

    //通过key从redis中查找错误数总数
    let errorK = getRedisK(config.redisKey.error,getIp(ctx));
    let errors = await DB.getAsync(errorK);
    // console.log(errors);
    errors = errors==undefined ? 0:errors;
    console.log('当前错误次数:',errors);
    if(errors>=config.limit.error){
        msg += ',已被锁定,请'+config.limit.later/60+'分钟后再试';
        return ctx.body = returnMsg(400,msg,1,);
    }
    //获取token键值对
    let tokenK = getRedisK(config.redisKey.token,key);
    console.log('get token:',tokenK);
    let tokenkey = await DB.getAsync(tokenK);
    console.log('get code:',tokenkey);
    //验证验证码
    if(tokenkey == code && tokenkey != null && tokenkey.length > 0){
        verify.verified =true;
        await DB.delAsync(tokenK);//验证成功删除KEY
        return ctx.body = returnMsg(200,'验证成功',1,{verified:true});
    }else{
        let errors = await DB.incrbyAsync(errorK,1);//错误次数增加
        console.log("add error times:",errors);
        if(errors == 1){//首次出错，设置同一ip错误字段默认过期时间
            await DB.expireAsync(errorK,config.limit.limitexpire);
        }
        if(errors<config.limit.error){
            msg += '，还有'+(config.limit.error-errors)+'次机会';
        }else if(errors == config.limit.error){
            await DB.expireAsync(errorK,config.limit.later);//设置过期时间
            msg += '超过最大错误次数，ip锁定'+config.limit.later/60+'分钟';
        }
   }
    return ctx.body = returnMsg(400,msg,1,);
});

export  default router;