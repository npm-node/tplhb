# @npm-node/tplhb
express项目中handlebars模板处理包

```javascript
const tplHb = require('@npm-node/tplhb');
const express = require('express');
let app = express();

tplHb(app, options = {
    // 所有handlebars模板存放绝对路径
    viewsPath: '',
    // 用户自定义handlebars的助手对象 {key<string>: value<function>}
    helpers: {},
    // 代码片段目录名称，默认'partials'
    partialsDirectoryName: 'partials',
    // 是否从缓存中获取模板，生产环境应该从缓存获取提供性能和体验
    getTemplateFromCache: false
})
```

