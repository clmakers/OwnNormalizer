var dateFomat = require("./dateFormat");
var is = require('./is');
var sanitizer = require('sanitizer');

module.exports = function (options) {

    var OwnNormalizer = {};
    var defaults = {
        modulesPath: "/modulesX",
        dateMask: "fullDate",
        dateLang: "en"
    };


    /*
     * Sets the options that were required
     *
     * @private
     * 
     */
    function applyOptions() {
        var def;
        options = options || {};
        for (def in defaults) {
            if (typeof options[def] === 'undefined') {
                options[def] = defaults[def];
            }
        }
    }

    function validateText(fieldData, rule) {

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
    }

    function validateDate(fieldData, rule) {
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

        if (is.propertyDefined(rule, "mask")) {
            preDate = dateFomat(preDate, rule.mask, options.dateLang);
        } else {
            preDate = dateFomat(preDate, options.dateMask, options.dateLang);
        }

        return preDate;
    }

    function validateEmail(fieldData, rule) {
        if (is.propertyDefined(rule, "type")) {
            if (!(typeof fieldData === "string")) {
                throw "Field type is invalid";
            }
        } else {
            throw "Field type is required";
        }
        if (is.not.email(fieldData)) {
            throw "Invalid email.";
        }

        return fieldData;
    }

    function validateBoolean(fieldData, rule) {
        if (is.propertyDefined(rule, "type")) {
            if (!(typeof fieldData === rule.type)) {
                throw "Field type is invalid";
            }
        } else {
            throw "Field type is required";
        }
        return fieldData;
    }

    function validateNumber(fieldData, rule) {
        if (is.propertyDefined(rule, "type")) {
            if (!(typeof fieldData === rule.type)) {
                throw "Field type is invalid";
            }
        } else {
            throw "Field type is required";
        }

        if (is.propertyDefined(rule, "minValue") && is.propertyDefined(rule, "maxValue")) {
            if (rule.maxValue === rule.minValue) {
                throw "minValue property and maxValue property cannot be equal";
            } else if (rule.maxValue < rule.minValue) {
                throw "property maxValue cannot be lower than minValue property";
            }
            ;
        }

        if (is.propertyDefined(rule, "minValue")) {
            if (fieldData < rule.minValue) {
                throw "Field value cannot be lower than it's minimun value 'minValue':" + rule.minValue;
            }
        }
        if (is.propertyDefined(rule, "maxValue")) {
            if (fieldData > rule.maxValue) {
                throw "Field value cannot be greater than it's maximun value 'maxValue':" + rule.maxValue;
            }
        }

        return fieldData;

    }

    function validatePhone(fieldData, rule) {
        if (is.propertyDefined(rule, "type")) {
            if (!(typeof fieldData === "string")) {
                throw "Field type is invalid";
            }
        } else {
            throw "Field type is required";
        }
        if (is.not.nanpPhone(fieldData)) {
            if (is.not.eppPhone(fieldData)) {
                throw "Invalid phone number.";
            }
        }

        return fieldData;
    }

    function validateUrl(fieldData, rule) {
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
    }

    OwnNormalizer.validate = function (data, module, rule, callback) {
        var rulFile = require(".." + options.modulesPath + "/" + module + "/" + module + "Rules");
        var rules = rulFile[rule];

        var key;
        data = data || {};
        for (key in rules) {
            if (typeof data[key] === 'undefined' || !data[key]) {
                if (is.propertyDefined(rules[key], "required") && rules[key].required) {
                    callback("Dato requerido");
                    break;
                }
            } else {
                try {
                    var responseData = null;
                    switch (rules[key].type) {
                        case "string":
                            responseData = validateText(data[key], rules[key]);
                            break;
                        case "date":
                            responseData = validateDate(data[key], rules[key]);
                            break;
                        case "number":
                            responseData = validateNumber(data[key], rules[key]);
                            break;
                        case "boolean":
                            responseData = validateBoolean(data[key], rules[key]);
                            break;
                        case "email":
                            responseData = validateEmail(data[key], rules[key]);
                            break;
                        case "url":
                            responseData = validateEmail(data[key], rules[key]);
                            break;
                        case "phone":
                            responseData = validatePhone(data[key], rules[key]);
                            break;
                    }
                    callback(responseData);
                } catch (ex) {
                    callback("Error: " + ex);
                }
            }
        }

//        callback("Funciona");
    };

    OwnNormalizer.dtFormat = function () {
        return dateFomat(new Date(), options.dateMask, options.dateLang);
    };

    /***** -> Initialize the instance <- *****/
    applyOptions();
    /***** *****/

    return OwnNormalizer;
};

