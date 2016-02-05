// var _ = require('lodash');
var $ = require('cheerio');
var p;
var globalId = 0;

/*
 * vm对象
 * 尽量保持简单，不对属性做封装
 * 
 */
function Vm(options) {

    options = options || {};

    this.name = options.name || '_root';
    this.index = globalId++;

    // this.parent = options.parent || null;

    this.$el = $(options.raw);

    // 非单根html片段不能使用cheerio
    // if (this.$el.length > 1) {
        this.$el = $('<div>' + options.raw + '</div>');
        this.hasAddWrapperElements = true;
    // }

    // this.stringsFactory = genStringsFactory();

    // this.directives = 
    //     _.extend({}, options.directives || {}, defaultDirectives || {});

    this.children = [];

    // add vmInfo
    // ['raw', 'directives', 'filters'].forEach(function(prop) {
    //     options[prop] && delete options[prop];
    // });

    // this.rawData = options.rawData;

    // this.data = options.data;

    // this.vmInfo = options;
}

p = Vm.prototype;
p.addChild = function(c) {
    this.children.push(c);

    // c.parent = this;
    return this;
};

// Vm.prototype.addChild = function(info) {
//     var index = this.submodules.length;
//     this.submodules.push(_.extend({}, info, {
//         parent: this.name !== '_root' ? this.name : null,
//         index: index
//     }));
//     return '{%{= __getVm(' + index + ') }%}';
// };

module.exports = Vm;
