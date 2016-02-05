module.exports = {
    aheader: {
        addSize: function(src) {
            return src + '220';
        }
    },
    abanner: {
        addAuthor: function(word, author) {
            return word + '[by ' + author + ']';
        }
    },
    asummary: {
        htmlDecode: function(str) {
            return str.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        }
    }
};
