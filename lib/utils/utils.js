'use strict';

module.exports = function () {

    return {
        makeRamdonString: function (options, runTimeOptions) {
            return require('./makeRamdonString')(options, runTimeOptions);
        },
        dateFormat: function () {
            return require('./dateFormat');
        },
        securityStrategy: function (options, runTimeOptions) {
            let SecurityStrategy = require('./securityStrategy');
            let instance = new SecurityStrategy(options, runTimeOptions);
            return instance;
        }
    };

}();