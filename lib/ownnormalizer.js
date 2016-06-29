var http = require('http');
var is = require('is_js');
var fs = require('fs');
var path = require('path');
var validators = require('./validators/validators');
var utils = require('./utils/utils');

//var filename = "hello.html";


module.exports = function (options) {

    var repoRules = {};
    var OwnNormalizer = {};
    var runTimeOptions = {};

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
        inlineRules: []
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

        (function () {
            var v = ["modulesPath", "publicMediaDirectory", "parentDirJumps"];
            for (var i = 0; i < v.length; i++) {
                if (options[v[i]].charAt(0) !== "/") {
                    options[v[i]] = "/" + options[v[i]];
                }
                if (options[v[i]].charAt(options[v[i]].length) === "/") {
                    options[v[i]] = options[v[i]].substring(0, options[v[i]] - 1);
                }
            }
        });
    }

    function populateRepoRules() {
        if (!options.remoteRules) {
            var directoryFullPath = __dirname + options.parentDirJumps + options.modulesPath;
            fs.readdir(directoryFullPath, function (err, files) {
                if (err)
                    return;
                files.forEach(function (f) {
                    var fileName = path.parse(f).name;
                    if (path.extname(f) === ".json") {
                        if (is.propertyDefined(repoRules, fileName)) {
                            throw new Error("Duplicate rule file has been found");
                        } else {
                            repoRules[fileName] = require(directoryFullPath + "/" + f);
                        }
                    }
                });
            });
        } else {
            var options = {
                host: options.rulesPath,
                path: '/',
                port: '80',
                method: options.remoteRuleMethod
            };

            http.request(options, function (response) {
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

        if (is.array(options.inlineRules) && options.inlineRules.length > 0) {
            for (var i = 0; i < options.inlineRules.length; i++) {
                repoRules[options.inlineRules[i].ruleName] = options.inlineRules[i].ruleData;
            }
        }
    }

    OwnNormalizer.validate = function (valOptions, callback) {
        var responseObject = {};

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
        var data = valOptions.data || {};
        var errCount = 0;
        for (key in rules) {
            if (typeof data[key] === 'undefined' || !data[key]) {
                if (is.propertyDefined(rules[key], "required") && rules[key].required) {
                    errCount += 1;
                    callback("Field " + key + " is required", null, null);
                    break;
                }
            } else {
                try {
                    var responseData = null;
                    switch (rules[key].type) {
                        case "string":
                            responseData = validators.validateText(data[key], rules[key], options, runTimeOptions);
                            break;
                        case "date":
                            responseData = validators.validateDate(data[key], rules[key], options, runTimeOptions);
                            break;
                        case "number":
                            responseData = validators.validateNumber(data[key], rules[key], options, runTimeOptions);
                            break;
                        case "boolean":
                            responseData = validators.validateBoolean(data[key], rules[key], options, runTimeOptions);
                            break;
                        case "email":
                            responseData = validators.validateEmail(data[key], rules[key], options, runTimeOptions);
                            break;
                        case "url":
                            responseData = validators.validateUrl(data[key], rules[key], options, runTimeOptions);
                            break;
                        case "phone":
                            responseData = validators.validatePhone(data[key], rules[key], options, runTimeOptions);
                            break;
                        case "image":
                            responseData = validators.validateImage(data[key], rules[key], options, runTimeOptions);
                            break;
                    }
                    responseObject[key] = responseData;
                } catch (ex) {
                    errCount += 1;
                    callback(ex, null, null);
                    break;
                }
            }
        }

        if (errCount === 0)
            utils.securityStrategy(options).encryptJwt(responseObject, function (err, response) {
                if (err)
                    callback(err, null);
                else
                    callback(null, responseObject, response);
            });

    };

    OwnNormalizer.getJwtSecret = function () {
        return options.crtJwtSecret;
    };

    OwnNormalizer.encrypt = function (data, callBack) {
        utils.securityStrategy(options).encrypt(data, function (err, response) {
            if (err)
                callBack(err, null);
            else
                callBack(null, response);
        });
    };

    OwnNormalizer.decrypt = function (data, callBack) {
        utils.securityStrategy(options).decrypt(data, function (err, response) {
            if (err)
                callBack(err, null);
            else
                callBack(null, response);
        });
    };

    OwnNormalizer.encryptJwt = function (data, callBack) {
        utils.securityStrategy(options).encryptJwt(data, function (err, response) {
            if (err)
                callBack(err, null);
            else
                callBack(null, response);
        });
    };

    OwnNormalizer.decryptJwt = function (data, callBack) {
        utils.securityStrategy(options).decryptJwt(data, function (err, response) {
            if (err)
                callBack(err, null);
            else
                callBack(null, response);
        });
    };

    /***** -> Initialize the instance <- *****/

    applyOptions();
    populateRepoRules();

    /***** *****/

    return OwnNormalizer;
};

