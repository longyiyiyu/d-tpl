function genStringsFactory() {
    var strings = {};
    var id = 0;
    var fn = function(str) {
        strings[++id] = str;
        return genStringsFactory.KEY + id;
    };

    fn.strings = strings;
    fn.value = function(id) {
        return strings[id] || null;
    };
    return fn;
}

genStringsFactory.KEY = '__tplstrings';
genStringsFactory.REGSTR = genStringsFactory.KEY + '(\\d+)';
module.exports = genStringsFactory;
