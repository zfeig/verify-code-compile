import path from 'path';
import _ from 'lodash';
// 通过NODE_ENV来设置环境变量，如果没有指定则默认为生产环境
let env = process.env.NODE_ENV || 'development';
env = env.toLowerCase();
let allConfig = {
    apiPort:3500,
    apiPre:'/api'
};
// C.env 为运行环境
allConfig.env = env;

// 载入配置文件
let file = path.resolve(__dirname, env + '.js');
let config ={};
try {
    let envConfig = require(file);
    config = _.assign(allConfig, envConfig);
    console.log('Load config: [%s] %s', env, file);
} catch (err) {
    console.error('Cannot load config: [%s] %s', env, file);
    throw err;
}
module.exports = config;