var is = require('is_js');

module.exports = function (fieldData, rule, options, runTimeOptions) {
    if (is.propertyDefined(rule, "type")) {
        if (!(typeof fieldData === "string")) {
            throw "Field type is invalid";
        }
    } else {
        throw "Field type is required";
    }
    if (is.not.url(fieldData)) {
        throw "Invalid url.";
    }

    return fieldData;
}();