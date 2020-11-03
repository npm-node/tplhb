/**
 * @file        : index.js
 * @description : express项目（https://github.com/iuloveforever/template_express.git）中handlebars模板处理
 * @author      : YanXianPing
 * @creatTime   : 2020/10/30 11:53
 */

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// 用户定义配置
const OPTIONS = {};
// 模板缓存
let templateCache = {};

/**
 * 注册handlebars的helper
 * @param helpers <{key<string>:value<function>}>
 */
function registerHelpers(helpers = {}) {
    for (let key in helpers) {
        try {
            if (typeof helpers[key] === "function") {
                Handlebars.unregisterHelper(key);
                Handlebars.registerHelper(key, helpers[key]);
            } else {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error('handlebars helper must be a function');
            }
        } catch (e) {
            console.log('【registerHelpers】', e);
        }
    }
}

/**
 * 注册handlebars的partial
 * @param partialPath <string> partial绝对路径
 */
function registerPartials(partialPath) {
    // 入口文件夹路径
    const entryDirPath = path.resolve(OPTIONS.viewsPath, OPTIONS.partialsDirectoryName);
    try {
        let filesList = fs.readdirSync(partialPath);
        filesList.forEach(item => {
            let itemPath = path.resolve(partialPath, item);
            let fileStats = fs.statSync(itemPath);
            if (fileStats.isDirectory()) {
                registerPartials(itemPath);
            } else if (fileStats.isFile()) {
                let partialRelativePath = path.relative(entryDirPath, itemPath);
                let ext = path.extname(partialRelativePath);
                let hbRegExp = /\.(hb)$/;
                if (hbRegExp.test(ext)) {
                    let sep = path.sep;
                    let partialName = partialRelativePath.replace(ext, '').replace(sep, '/');
                    let partialTemplate = fs.readFileSync(itemPath, 'utf-8');
                    Handlebars.unregisterPartial(partialName);
                    Handlebars.registerPartial(partialName, partialTemplate);
                }
            } else {
                // 其他
                throw new Error(`the path of '${itemPath}' is not a directory or a file`);
            }
        });
    } catch (e) {
        console.log('【registerPartials】', e);
    }
}

/**
 * 获取编译后的html字符串
 * @param path hb模板路径
 * @param options 需要渲染的数据
 * @return {Promise<Object>} 编译好的html字符串
 */
function getHtml(path, options) {
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
                templateCache[path] = template;
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
    registerHelpers(options.helpers);
    registerPartials(path.resolve(OPTIONS.viewsPath, OPTIONS.partialsDirectoryName));

    app.set('views', options.viewsPath);
    app.engine('hb', appEngineCallback);
};

module.exports = tplHb;
