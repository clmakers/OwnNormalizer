var is = require('is_js');

module.exports = function (fieldData, rule, options, runTimeOptions) {
    if (is.propertyDefined(rule, "type")) {
        if (!(typeof fieldData === "string")) {
            throw new Error("Field data type '"+rule.type+"' is invalid");
        }
    } else {
        throw new Error("Field type is required");
    }
    if (is.not.url(fieldData)) {
        throw new Error("Invalid url.");
    }

    return fieldData;
};