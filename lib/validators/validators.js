module.exports = function () {

    return {
        validateText: function (fieldData, rule, options, runTimeOptions) {
            return require('./text')(fieldData, rule, options, runTimeOptions);
        },
        validateDate: function (fieldData, rule, options, runTimeOptions) {
            return require('./date')(fieldData, rule, options, runTimeOptions);
        },
        validateNumber: function (fieldData, rule, options, runTimeOptions) {
            return require('./number')(fieldData, rule, options, runTimeOptions);
        },
        validateBoolean: function (fieldData, rule, options, runTimeOptions) {
            return require('./boolean')(fieldData, rule, options, runTimeOptions);
        },
        validateEmail: function (fieldData, rule, options, runTimeOptions) {
            return require('./email')(fieldData, rule, options, runTimeOptions);
        },
        validateUrl: function (fieldData, rule, options, runTimeOptions) {
            return require('./url')(fieldData, rule, options, runTimeOptions);
        },
        validatePhone: function (fieldData, rule, options, runTimeOptions) {
            return require('./phone')(fieldData, rule, options, runTimeOptions);
        },
        validateImage: function (fieldData, rule, options, runTimeOptions) {
            return require('./image')(fieldData, rule, options, runTimeOptions);
        }
    };

}();