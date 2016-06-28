var is = require('is_js');
var utils = require('../utils/utils');

module.exports = function (fieldData, rule, options, runTimeOptions) {
    var preDate;

    if (is.propertyDefined(rule, "type")) {
        if ((typeof fieldData === 'date' || typeof fieldData === 'string' || typeof fieldData === 'number')) {
            preDate = Date.parse(fieldData);
            if (isNaN(preDate) === true) {
                throw "Field Date is invalid";
            }
        } else {
            throw "Field Date is invalid";
        }
    } else {
        throw "Field type is required";
    }

    if (is.propertyDefined(rule, "future")) {
        if (rule.future === true) {
            if (new Date().getTime() > preDate) {
                throw "Field Date value must be future";
            }
        }
    }

    if (runTimeOptions.format) {
        if (is.propertyDefined(rule, "mask")) {
            preDate = ownDateFomat(preDate, rule.mask, options.dateLang);
        } else {
            preDate = ownDateFomat(preDate, options.dateMask, options.dateLang);
        }

        return preDate;
    } else {
        return fieldData;
    }
};