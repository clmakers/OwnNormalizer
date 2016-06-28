var is = require('is_js');
var sanitizer = require('sanitizer');

module.exports = function (fieldData, rule, options, runTimeOptions) {
    
    if (is.propertyDefined(rule, "type")) {
        if (!(typeof fieldData === rule.type)) {
            throw "Field type is invalid";
        }
    } else {
        throw "Field type is required";
    }

    if (is.propertyDefined(rule, "maxLength")) {
        if (!(fieldData.length <= rule.maxLength)) {
            throw "Field value cannot be greater than it's maximun length 'maxLength':" + rule.maxLength;
        }
    }

    if (is.propertyDefined(rule, "minLength")) {
        if (!(fieldData.length >= rule.minLength)) {
            throw "Field value cannot be lower than it's minimun length required 'minLength':" + rule.minLength;
        }
    }

    if (is.propertyDefined(rule, "exactLength")) {
        if (!(fieldData.length === rule.exactLength)) {
            throw "Field Length does not match the required length 'exactLength':" + rule.exactLength;
        }
    }

    return sanitizer.escape(sanitizer.sanitize(fieldData));
};