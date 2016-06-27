var is = require('is_js');

module.exports = function (fieldData, rule, options, runTimeOptions) {
    if (is.propertyDefined(rule, "type")) {
        if (!(typeof fieldData === rule.type)) {
            throw "Field type is invalid";
        }
    } else {
        throw "Field type is required";
    }
    return fieldData;
}();