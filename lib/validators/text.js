var is = require('is_js');
var sanitizer = require('sanitizer');

module.exports = function (fieldData, rule, options, runTimeOptions) {

    if (is.propertyDefined(rule, "type")) {
        if (!(typeof fieldData === rule.type)) {
            throw new Error("Field data type '"+rule.type+"' is invalid");
        }
    } else {
        throw new Error("Field type is required");
    }

    if (is.propertyDefined(rule, "allowedValues")) {
        if(rule.allowedValues.indexOf(fieldData) === -1) {
            throw new Error("Field value '"+fieldData+"' is not one of the posibles values: " + rule.allowedValues.toString());
        }
    }

    if (is.propertyDefined(rule, "maxLength")) {
        if (!(fieldData.length <= rule.maxLength)) {
            throw new Error("Field value cannot be greater than it's maximun length 'maxLength':" + rule.maxLength);
        }
    }

    if (is.propertyDefined(rule, "minLength")) {
        if (!(fieldData.length >= rule.minLength)) {
            throw new Error("Field value cannot be lower than it's minimun length required 'minLength':" + rule.minLength);
        }
    }

    if (is.propertyDefined(rule, "exactLength")) {
        if (!(fieldData.length === rule.exactLength)) {
            throw new Error("Field Length does not match the required length 'exactLength':" + rule.exactLength);
        }
    }

    return sanitizer.escape(sanitizer.sanitize(fieldData));
};