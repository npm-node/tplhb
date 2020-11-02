/**
 * @file        : index.js
 * @description : express项目（https://github.com/iuloveforever/template_express.git）中handlebars模板处理
 * @author      : YanXianPing
 * @creatTime   : 2020/10/30 11:53
 */

const fs = require('fs');
const Handlebars = require('handlebars');

// 用户定义配置
const OPTIONS = {};
// 模板缓存
let templateCache = {};

// TODO 注册handlebars的helper
// TODO 注册handlebars的partial

/**
 * 获取编译后的html字符串
 * @param path hb模板路径
 * @param options 需要渲染的数据
 * @return {Promise<Object>} 编译好的html字符串
 */
function getHtml(path, options) {
    console.log('========>', path);
    let html = '';
    return new Promise((resolve, reject) => {
        try {
            // 编译后的模板方法
            let template = new Function();
            if (OPTIONS.getTemplateFromCache && templateCache[path]) {
                template = templateCache[path];
            } else {
                // TODO ！！！important 替换模板中的css和js版本
                let templateString = fs.readFileSync(path).toString();
                template = Handlebars.compile(templateString);
                caches[path] = template;
            }
            // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
            // (start) : 添加一些脚本（报错捕获），Vue分割符...
            // do something here
            // (end)
            // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            // 生成html字符串
            html = template(options);
            resolve(html);
        } catch (e) {
            resolve(e);
        }
    });
}

/**
 * handlebars模板引擎的回调函数，当express在render文件后缀为.hb模板时触发
 * @param path hb模板路径
 * @param options 需要渲染的数据
 * @param callback 编译完模板后的回调
 */
function appEngineCallback(path, options, callback) {
    getHtml(path, options).then(html => {
        callback(null, html);
    }).catch(e => {
        callback(e);
    });
}

/**
 * express中handlebars模板处理
 * @param app <Object> express实例app
 * @param options <Object> 配置项
 */
const tplHb = (app, options = {
    // 所有handlebars模板存放绝对路径
    viewsPath: '',
    // 用户自定义handlebars的助手对象 {key<string>: value<function>}
    helpers: {},
    // 代码片段目录名称，默认'partials'
    partialsDirectoryName: 'partials',
    // 是否从缓存中获取模板，生产环境应该从缓存获取提供性能和体验
    getTemplateFromCache: false
}) => {
    Object.assign(OPTIONS, options);

    app.set('views', options.viewsPath);
    app.engine('hb', appEngineCallback);
};

module.exports = tplHb;
