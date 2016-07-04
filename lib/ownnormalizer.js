'use strict';

var http = require('http');
var is = require('is_js');
var fs = require('fs');
var path = require('path');
var validators = require('./validators/validators');
var utils = require('./utils/utils');

var repoRules = {};
var runTimeOptions = {};
var options = {};
var defaults = {
    rulesPath: "/rules",
    remoteRules: false,
    remoteRuleMethod: "GET",
    publicMediaDirectory: "/public",
    dateMask: "fullDate",
    dateLang: "en",
    format: true,
    secureDataResponse: true,
    crtPublicKey: "MUMBOJUMBO",
    crtPrivateKey: "",
    crtAlgorithm: "aes-256-cbc",
    crtCodification: "base64",
    crtCharset: "utf8",
    crtJwtSecret: "",
    crtJwtExpiration: 48 * 60 * 60,
    parentDirJumps: "/../../..",
    inlineRules: [],
    numberDefaultMask: '0,0',
    insideEncrypt: false
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
    if (typeof options.crtPrivateKey !== 'undefined' && options.crtPrivateKey !== "") {
        if (!options.crtPrivateKey.length >= 30) {
            throw new Error("crtPrivateKey must be at least 30 characters long");
        }
    } else {
        throw new Error("crtPrivateKey is required");
    }

    if (typeof options.crtJwtSecret !== 'undefined' && options.crtJwtSecret !== "") {
        if (!options.crtJwtSecret.length >= 30) {
            throw new Error("crtJwtSecret must be at least 30 characters long");
        }
    } else {
        throw new Error("crtJwtSecret is required");
    }

    if (typeof options.crtPublicKey !== 'undefined' && options.crtPublicKey !== "") {
        if (options.crtPublicKey === "MUMBOJUMBO") {
            console.log("WARNING : We recomend change default crtPublicKey value");
        }
    } else {
        throw new Error("crtPublicKey is required");
    }

    var v = ["modulesPath", "publicMediaDirectory", "parentDirJumps"];
    for (var i = 0; i < v.length; i++) {
        if (is.propertyDefined(options, v[i])) {
            if (options[v[i]].charAt(0) !== "/") {
                options[v[i]] = "/" + options[v[i]];
            }
            if (options[v[i]].charAt(options[v[i]].length) === "/") {
                options[v[i]] = options[v[i]].substring(0, options[v[i]] - 1);
            }
        }
    }

}
;

function populateRepoRules() {
    if (!options.remoteRules) {
        var directoryFullPath = __dirname + options.parentDirJumps + options.rulesPath;
        fs.readdir(directoryFullPath, function (err, files) {
            if (err)
                return;
            files.forEach(function (f) {
                var fileName = path.parse(f).name;
                if (path.extname(f) === ".json") {
                    if (is.propertyDefined(repoRules, fileName)) {
                        console.log("WARNING : Duplicate rule file has been found, this rule file can not be applied");
//                        throw new Error("Duplicate rule file has been found");
                    } else {
                        repoRules[fileName] = require(directoryFullPath + "/" + f);
                    }
                }
            });
            inline();
        });
    } else {
        var opt = {
            host: options.rulesPath,
            path: '/',
            port: '80',
            method: options.remoteRuleMethod
        };

        http.request(opt, function (response) {
            var rules = '';
            response.on('data', function (chunk) {
                rules += chunk;
            });

            response.on('end', function () {
                if (is.array(rules) && rules.length > 0) {
                    for (var i = 0; i < rules.length; i++) {
                        repoRules[rules[i].ruleName] = rules[i].ruleData;
                    }
                }
            });
        });
    }

    function inline() {
        if (is.array(options.inlineRules) && options.inlineRules.length > 0) {
            for (var i = 0; i < options.inlineRules.length; i++) {
                if (is.propertyDefined(options.inlineRules[i], "ruleName") &&
                        is.propertyDefined(options.inlineRules[i], "ruleData") &&
                        options.inlineRules[i].ruleName !== "" &&
                        options.inlineRules[i].ruleData !== ""
                        ) {
                    repoRules[options.inlineRules[i].ruleName] = options.inlineRules[i].ruleData;
                } else {
                    throw new Error("Defined rule is incorrect");
                }
            }
        }
    }
}
;

var ownNormalizer = function (opt) {

    options = opt;
    var own = {};

    applyOptions();
    populateRepoRules();

    own.validate = function (valOptions, callback) {
        var responseObject = [];

        if (valOptions.rule) {
            var rules = repoRules[valOptions.rule];
        } else {
            callback("Rule is required", null, null);
        }

        if (typeof valOptions.format !== 'undefined') {
            runTimeOptions.format = valOptions.format;
        } else {
            runTimeOptions.format = defaults.format;
        }

        var key;
        var fullData = valOptions.data || [];
        var errCount = 0;

        for (var d = 0; d < fullData.length; d++) {
            var data = fullData[d];
            var preResponse = {};

            for (key in rules) {
                var selFieldData;
                var greenLight = false;
                if (typeof data[key] === 'undefined' || is.null(data[key])) {
                    var validateRequired = false;

                    if (is.propertyDefined(rules[key], "alterFields") && rules[key].alterFields.length > 0) {
                        var a = rules[key].alterFields;
                        var aKey;
                        for (var aKey = 0; aKey < a.length; aKey++) {
                            if (typeof data[a[aKey]] === 'undefined' || !data[a[aKey]]) {
                                if (!greenLight)
                                    validateRequired = true;
                            } else {
                                selFieldData = data[a[aKey]];
                                greenLight = true;
                                validateRequired = false;
                            }
                        }
                    } else {
                        validateRequired = true;
                    }

                    if (validateRequired) {
                        if (is.propertyDefined(rules[key], "required") && rules[key].required) {
                            errCount += 1;
                            callback("Field " + key + " is required", null, null);
                            break;
                        } else {
                            greenLight = true;
                        }
                    }
                } else {
                    selFieldData = data[key];
                    greenLight = true;
                }

                if (greenLight) {
                    try {
                        var responseData = null;
                        switch (rules[key].type) {
                            case "string":
                                responseData = validators.validateText(selFieldData, rules[key], options, runTimeOptions);
                                break;
                            case "date":
                                responseData = validators.validateDate(selFieldData, rules[key], options, runTimeOptions);
                                break;
                            case "number":
                                responseData = validators.validateNumber(selFieldData, rules[key], options, runTimeOptions);
                                break;
                            case "boolean":
                                responseData = validators.validateBoolean(selFieldData, rules[key], options, runTimeOptions);
                                break;
                            case "email":
                                responseData = validators.validateEmail(selFieldData, rules[key], options, runTimeOptions);
                                break;
                            case "url":
                                responseData = validators.validateUrl(selFieldData, rules[key], options, runTimeOptions);
                                break;
                            case "phone":
                                responseData = validators.validatePhone(selFieldData, rules[key], options, runTimeOptions);
                                break;
                            case "image":
                                responseData = validators.validateImage(selFieldData, rules[key], options, runTimeOptions);
                                break;
                        }
                        preResponse[key] = responseData;
                    } catch (ex) {
                        errCount += 1;
                        callback(ex, null, null);
                        break;
                    }
                }
            }

            responseObject.push(preResponse);
        }
        if (errCount === 0)
        {
            utils.securityStrategy(options).encryptJwt(responseObject, function (err, response) {
                if (err)
                    callback(err, null);
                else
                    callback(null, responseObject, response);
            });
        }

    };

    own.getJwtSecret = function () {
        return options.crtJwtSecret;
    };

    own.encrypt = function (data, callBack) {
        utils.securityStrategy(options).encrypt(data, function (err, response) {
            if (err)
                callBack(err, null);
            else
                callBack(null, response);
        });
    };

    own.decrypt = function (data, callBack) {
        utils.securityStrategy(options).decrypt(data, function (err, response) {
            if (err)
                callBack(err, null);
            else
                callBack(null, response);
        });
    };

    own.encryptJwt = function (data, callBack) {
        utils.securityStrategy(options).encryptJwt(data, function (err, response) {
            if (err)
                callBack(err, null);
            else
                callBack(null, response);
        });
    };

    own.decryptJwt = function (data, callBack) {
        utils.securityStrategy(options).decryptJwt(data, function (err, response) {
            if (err)
                callBack(err, null);
            else
                callBack(null, response);
        });
    };

    return own;

};

/**
 * Module exports.
 * @public
 */

module.exports = ownNormalizer;