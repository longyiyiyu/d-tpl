module.exports = {
    prefix: 'q-',
    templateSettings: {
        evaluate: /\{%\{(.+?)\}%\}/g,
        interpolate: /\{%\{=(.+?)\}%\}/g,
        escape: /\{%\{-(.+?)\}%\}/g
    }
};
