module.exports = {
    redis:{
        port:6379,
        host:'127.0.0.1',
        options:{
            auth_pass: ''
        }
    },
    limit:{
        request: 100,//同一ip最多刷新图片次数[不保存]
        error: 5,//同一ip验证错误次数极限
        expire: 120, //验证码默认有效时间2分钟
        limitexpire:60*60*24,// 刷新次数或错误次数默认存储有效时间1天
        reqagian: 60*60,//刷新图片次数达到极限后,1小时后再试
        later: 10*60 //错误达到极限后,10分钟后再试
    },
    redisKey:{
        hash:'captcha:info:%s',//hash集合名
        token:'captcha:info:token:%s',//token键值对
        error:'captcha:info:%s:error',//错误总数键值对
        request:'captcha:info:%s:request'//请求次数
    },
    captcha:{
        size:{
            width: 80,//验证码默认宽度
            height: 30//验证码默认长度
        },
        background:{//默认背景色
            red: 0,
            green: 0,
            blue: 0,
            alpha: 0
        },
        color:{//默认验证码颜色
            red: 80,
            green: 80,
            blue: 80,
            alpha: 255
        }
    }
}