var tpl = require('../');
var fs = require('fs');
var path = require('path');

function compare(type, caseName) {
    var src = fs.readFileSync(path.join(__dirname, 'src', type, caseName + '.html'), 'utf-8');
    var expect = fs.readFileSync(path.join(__dirname, 'expect', type, caseName + '.html'), 'utf-8');
    tpl.compile({
        raw: src
    }).vm.tpl.should.equal(expect);
}

describe('compile', function() {
    describe('text directive', function() {
        it('should able to use text directive', function() {
            compare('compile', 'text');
        });

        it('should remove the text node', function() {
            compare('compile', 'text-has-text');
        });
    });

    describe('html directive', function() {
        it('should able to use html directive', function() {
            compare('compile', 'html');
        });

        it('should remove the child node', function() {
            compare('compile', 'html-has-html');
        });
    });

    describe('class directive', function() {
        it('should able to use class directive', function() {
            compare('compile', 'class');
        });

        it('should remove the class when exists', function() {
            compare('compile', 'class-exist');
        });

        it('should able to use class directive without arugument', function() {
            compare('compile', 'class-without-arg');
        });

        it('should able to use more than one class directive', function() {
            compare('compile', 'class-more-than-one');
        });
    });

    describe('show directive', function() {
        it('should able to use show directive', function() {
            compare('compile', 'show');
        });

        it('should remove the display style when using show directive', function() {
            compare('compile', 'show-has-style');
        });
    });

    describe('src directive', function() {
        it('should able to use src directive', function() {
            compare('compile', 'src');
        });

        it('should replace the value of src attribute when using show directive', function() {
            compare('compile', 'src-has-src');
        });
    });

    describe('attr directive', function() {
        it('should able to use attr directive', function() {
            compare('compile', 'attr');
        });

        it('should able to use attr directive without arugument', function() {
            compare('compile', 'attr-without-arg');
        });

        it('should able to use more than one attr directive', function() {
            compare('compile', 'attr-more-than-one');
        });
    });

    describe('value directive', function() {
        it('should able to use value directive', function() {
            compare('compile', 'value');
        });

        it('should able to use value directive in checkbox tag', function() {
            compare('compile', 'value-of-checkbox');
        });
    });

    describe('repeat directive', function() {
        it('should able to use repeat directive', function() {
            compare('compile', 'repeat');
        });
    });
});

function output(type, caseName) {
    var src = fs.readFileSync(path.join(__dirname, 'src', type, caseName + '.html'), 'utf-8');
    var filters = require(path.join(__dirname, 'src', type, caseName + '.filters.js'));
    var data = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', type, caseName + '.data.json'), 'utf-8'));
    var expect = fs.readFileSync(path.join(__dirname, 'expect', type, caseName + '.html'), 'utf-8');

    // console.log(tpl.compile({
    //     raw: src,
    //     filters: filters
    // })(data));

    // console.log(data, filters);
    
    // fs.writeFileSync(path.join(__dirname, 'src', type, caseName + '.out.tpl.html'), tpl.compile({
    //     raw: src,
    //     filters: filters
    // }).vm.tpl, 'utf-8');

    // fs.writeFileSync(path.join(__dirname, 'src', type, caseName + '.out.html'), tpl.compile({
    //     raw: src,
    //     filters: filters
    // })(data), 'utf-8');

    tpl.compile({
        raw: src,
        filters: filters
    })(data).should.equal(expect);
}

describe('output:', function() {
    describe('output the html string', function() {
        it('should able to output the html string by filters and data', function() {
            output('output', 'output');
        });

        it('should able to output the html string by filters and data when the template has sub mv', function() {
            output('output', 'atest');
        });
    });
});
