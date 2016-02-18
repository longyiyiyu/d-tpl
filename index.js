var _ = require('lodash');
var $ = require('cheerio');
var Vm = require('./lib/vm');
var tags = require('./lib/tags');
var parse = require('./lib/parse');
var DEFAULT = require('./default');
var genStringFactory = require('./lib/stringFactory');
var util = require('./lib/utils');
var defaultDirectives = require('./lib/directives');

_.extend(_.templateSettings, DEFAULT.templateSettings);

function filterExp(item, vm) {
    return '__filterValue(__obj, ' + JSON.stringify(item) + ', "' + vm.name + '")';
}

// var iiii = 0;
function _compile(options) {
    options = options || {};

    var vm = new Vm(options);
    var prefix = options.prefix || DEFAULT.prefix;
    var directives = _.extend({}, options.directives || {}, defaultDirectives || {});

    util.walk(function(ele) {
        var attribs = Object.keys(ele.attribs);
        var cvm;
        var $el = $(ele);
        // if (ele.name === 'content') {
        //     $(ele).replaceWith('{%{= __vm.content }%}');
        // } else if (tags.isCustom(ele.name)) {
        //     $(ele).replaceWith(vm.addSubmodule({
        //         name: ele.name,
        //         content: $(ele).html(),
        //         attribs: ele.attribs
        //     }));
        //     return false;
        // }

        // if (options.name === 'test') {
        //     console.log($(ele).toString(), ele.attribs[prefix + 'cname'], options.name);
        // }

        // TODO: hard code: q-cname
        if (attribs.indexOf(prefix + 'cname') > -1 && ele.attribs[prefix + 'cname'] != options.name) {
            cvm = _compile(_.extend({}, options, {
                raw: $el.toString(),
                parent: vm,
                name: ele.attribs[prefix + 'cname']
            }));
            vm.addChild(cvm);
            $el.before('{%{ var oobj' + cvm.index + ' = __obj; __obj = __getData(__obj, "' + cvm.name + '") || __obj; }%}');
            $el.after('{%{ __obj = oobj' + cvm.index + '; }%}');
            $el.replaceWith(options.stringFactory(cvm.tpl) + '_subtpl');
            return false;
        }

        // q-vm就是子组件
        if (attribs.indexOf(prefix + 'vm') > -1 && ele.attribs[prefix + 'vm'] != options.name) {
            cvm = _compile(_.extend({}, options, {
                raw: $el.toString(),
                parent: vm,
                name: ele.attribs[prefix + 'vm']
            }));
            vm.addChild(cvm);
            $el.before('{%{ var oobj' + cvm.index + ' = __obj; __obj = __getData(__obj, "' + cvm.name + '") || __obj; }%}');
            $el.after('{%{ __obj = oobj' + cvm.index + '; }%}');
            $el.replaceWith(options.stringFactory(cvm.tpl) + '_subtpl');
            return false;
        }

        attribs.filter(function(key) {
            if (key.indexOf(prefix) === 0) return true;
        }).forEach(function(key) {
            var name = key.substring(prefix.length);
            var directive = directives[name];
            if (directive) {
                parse(ele.attribs[key]).forEach(function(item) {
                    try {
                        (directive.update || directive).call({
                            el: ele,
                            arg: item.arg,
                            vm: vm,
                            stringFactory: options.stringFactory
                        }, filterExp(item, vm));
                    } catch (ex) {
                        console.warn('directive failed: ' + name);
                    }
                });
            }
        });
    }, vm.$el);

    // vm.$el
    //     // add class component-x
    //     .addClass(vm.stringsFactory(
    //         '{%{= !__vm.parent && !isNaN(__vm.index) ? "component-" + (__vm.index + 1) : ""}%}'
    //     ))
    //     // add q-vm
    //     .attr(vm.stringsFactory(
    //         '{%{= __vm.parent && !__vm.inline ? "q-vm=" + __vm.name : "" }%}'
    //     ));

    function tplstrings(str, id) {
        return options.stringFactory.value(id);
    }

    // escape strings
    vm.tpl = vm.$el[vm.hasAddWrapperElements ? 'html' : 'toString']()
        .replace(/\{%\{[\s\S]*?\}%\}/g, function(str) {
            return str.replace(/&quot;/g, '"');
        })
        .replace(new RegExp(genStringFactory.REGSTR + '_subtpl', 'g'), tplstrings) // sub vm
        .replace(new RegExp(genStringFactory.REGSTR + '\\s?:\\s?0;?', 'g'), tplstrings) // style
        .replace(new RegExp(genStringFactory.REGSTR + '="0"\\s?', 'g'), tplstrings) // attr
        .replace(new RegExp(genStringFactory.REGSTR, 'g'), tplstrings);

    // .replace(/__tplstrings\d+\s?:\s?0;?/g, tplstrings) // style
    // .replace(/__tplstrings\d+="0"\s?/g, tplstrings) // attr
    // .replace(/__tplstrings\d+/g, tplstrings);

    delete vm.$el;
    return vm;
}

function getFunSerialization(fun, tplFun) {
    var ret = [];

    ret.push('var _ = require("lodash");');
    ret.push('var _fun = ' + tplFun.toString());
    ret.push('module.exports = ' + fun.toString());

    return ret.join('\n');
}

exports.compile = function(options) {
    options = _.extend({}, options || {}, {
        stringFactory: genStringFactory()
    });

    // filters 和 compile 无关，所以不应该与 engine 关联
    // filters 应该和 data 一样，在 output 的时候传进去
    // var filters = _.extend({}, options.filters || {}, DEFAULT.filters || {});

    // 抽成一个函数，后面或许会改这里
    // function __getData(obj, key) {
    //     return obj[key];
    // }

    var vm = _compile(options);
    var _fun = _.template(vm.tpl);
    var fun = function(data, opt) {
        opt = opt || {};
        data = _.extend({}, data, {
            __filterValue: function(data, exp, cname) {
                var root = data[exp.name];
                var name, args, filter;
                for (var i = 0; i < exp.filters.length; i++) {
                    try {
                        name = exp.filters[i][0];
                        args = [].concat(exp.filters[i]);
                        args[0] = root;
                        filter = (opt.filters[cname] || opt.filters)[name];
                        root = filter.apply(data, args);
                    } catch (ex) {
                        console.warn('filter failed: ' + name);
                        return root;
                    }
                }
                return root;
            },
            __getData: function(obj, key) {
                return obj[key];
            }
        });
        data.__obj = data;
        try {
            return _fun(data);
        } catch (ex) {
            console.warn('template error: ' + ex.toString());
            return options.raw;
        }
    };

    var funSerializationStr = getFunSerialization(fun, _fun);

    // vm.tplFun = fun;
    fun.funSerializationStr = funSerializationStr;
    fun.vm = vm;
    return fun;
};
