var utils = {
    noop: new Function(),
    walk: function(foo, elems) {
        var childs;
        var elem;

        for (var i = 0, l = elems.length; i < l; i++) {
            elem = elems[i];
            if (elem.type === 'tag') {
                childs = [].concat(elem.children);
                if (foo(elem) !== false && childs.length) {
                    utils.walk(foo, childs);
                }
            }
        }
    }
};

module.exports = utils;
