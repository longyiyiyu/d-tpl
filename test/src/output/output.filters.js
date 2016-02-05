
module.exports = {
    test: {
        getList: function(list) {
            list.forEach(function(item) {
                item.name += '_long';
            });
            return list;
        },
        isBold: function(size) {
            return size > 10;
        },
        insert: function(list, item) {
            list.push(item);
            return list;
        },
        length: function(list) {
            return list.length;
        }
    }
};