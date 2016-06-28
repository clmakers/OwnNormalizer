module.exports = function () {

    return {
        makeRamdonString: function (options, runTimeOptions) {
            return require('./makeRamdonString')(options, runTimeOptions);
        },
        dateFormat: function () {
            return require('./dateFormat');
        },
        securityStrategy: function (options) {
            return require('./securityStrategy')(options);
        }
    };

}();