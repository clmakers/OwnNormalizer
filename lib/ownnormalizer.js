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

    function validateText(textObj, rule) {

        if (is.propertyDefined(rule, "type")) {
            if (!(typeof textObj === 'string')) {
                throw "Field type is invalid";
            }
        } else {
            throw "Field type is required";
        }

        if (is.propertyDefined(rule, "maxLength")) {
            if (!(textObj.length <= rule.maxLength)) {
                throw "Field Max Length is exceeded";
            }
        }

        if (is.propertyDefined(rule, "minLength")) {
            if (!(textObj.length >= rule.minLength)) {
                throw "Field Min Length Required";
            }
        }

        if (is.propertyDefined(rule, "exactLength")) {
            if (!(textObj.length === rule.exactLength)) {
                throw "Field Min Length Required";
            }
        }

        return sanitizer.escape(sanitizer.sanitize(textObj));
    }

    function validateDate(dateObj, rule) {
        var preDate;

        if (is.propertyDefined(rule, "type")) {
            if ((typeof dateObj === 'date' || typeof dateObj === 'string' || typeof dateObj === 'number')) {
                preDate = Date.parse(dateObj);
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

