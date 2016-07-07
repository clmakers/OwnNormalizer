var is = require('is_js');
var numeral = require('numeral');

module.exports = function (fieldData, rule, options, runTimeOptions) {
    if (is.propertyDefined(rule, "type")) {
        if (!(typeof fieldData === rule.type)) {
            throw new Error("Field data type '"+rule.type+"' is invalid");
        }
    } else {
        throw new Error("Field type is required");
    }

    if (is.propertyDefined(rule, "minValue") && is.propertyDefined(rule, "maxValue")) {
        if (rule.maxValue === rule.minValue) {
            throw new Error("minValue property and maxValue property cannot be equal");
        } else if (rule.maxValue < rule.minValue) {
            throw new Error("property maxValue cannot be lower than minValue property");
        }
        ;
    }

    if (is.propertyDefined(rule, "minValue")) {
        if (fieldData < rule.minValue) {
            throw new Error("Field value cannot be lower than it's minimun value 'minValue':" + rule.minValue);
        }
    }
    if (is.propertyDefined(rule, "maxValue")) {
        if (fieldData > rule.maxValue) {
            throw new Error("Field value cannot be greater than it's maximun value 'maxValue':" + rule.maxValue);
        }
    }
    
    if(is.propertyDefined(rule, "applyMask")){
        if(is.propertyDefined(rule, "mask")){
            fieldData = numeral(fieldData).format(rule.mask);
        }else{
            fieldData = numeral(fieldData).format(options.numberDefaultMask);
        }
    }

    return fieldData;
};