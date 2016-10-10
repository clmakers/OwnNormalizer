'use strict';

let http = require('http');
let is = require('is_js');
let fs = require('fs');
let path = require('path');
let validators = require('./validators/validators');
let utils = require('./utils/utils');

let repoRules = {};
let options = {};

module.exports = class OwnNormalizer {

    constructor(opt = {}) {
        options = opt;
        this.runTimeOptions = {};
        this.defaults = {
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
        this._applyOptions();
        this._populateRepoRules();
    }

    _applyOptions() {
        for (let def in this.defaults) {
            if (typeof options[def] === 'undefined') {
                options[def] = this.defaults[def];
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

        let v = ["modulesPath", "publicMediaDirectory", "parentDirJumps"];
        for (let i = 0; i < v.length; i++) {
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

    _populateRepoRules() {
        if (!options.remoteRules) {
            let directoryFullPath = __dirname + options.parentDirJumps + options.rulesPath;
            fs.readdir(directoryFullPath, function (err, files) {
                if (err)
                    return;
                files.forEach(function (f) {
                    let fileName = path.parse(f).name;
                    if (path.extname(f) === ".json") {
                        if (is.propertyDefined(repoRules, fileName)) {
                            console.log("WARNING : Duplicate rule file has been found, this rule file can not be applied");
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
                let rules = '';
                response.on('data', function (chunk) {
                    rules += chunk;
                });

                response.on('end', function () {
                    if (is.array(rules) && rules.length > 0) {
                        for (let i = 0; i < rules.length; i++) {
                            repoRules[rules[i].ruleName] = rules[i].ruleData;
                        }
                    }
                });
            });
        }

        function inline() {
            if (is.array(options.inlineRules) && options.inlineRules.length > 0) {
                for (let i = 0; i < options.inlineRules.length; i++) {
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

    _selectValidationType(selFieldData, rules, key, callback) {
        let preResponse = {};

        try {
            let responseData = null;
            switch (rules[key].type) {
                case "string":
                    responseData = validators.validateText(selFieldData, rules[key], options, this.runTimeOptions);
                    break;
                case "date":
                    responseData = validators.validateDate(selFieldData, rules[key], options, this.runTimeOptions);
                    break;
                case "number":
                    responseData = validators.validateNumber(selFieldData, rules[key], options, this.runTimeOptions);
                    break;
                case "boolean":
                    responseData = validators.validateBoolean(selFieldData, rules[key], options, this.runTimeOptions);
                    break;
                case "email":
                    responseData = validators.validateEmail(selFieldData, rules[key], options, this.runTimeOptions);
                    break;
                case "url":
                    responseData = validators.validateUrl(selFieldData, rules[key], options, this.runTimeOptions);
                    break;
                case "phone":
                    responseData = validators.validatePhone(selFieldData, rules[key], options, this.runTimeOptions);
                    break;
                case "image":
                    responseData = validators.validateImage(selFieldData, rules[key], options, this.runTimeOptions);
                    break;
                case "object":
//                    this.validate({
//                        data: [selFieldData],
//                        rule: rules[key].rule
//                    }, function (err, data) {
//                        if (err) {
//                            callback(err, null);
//                            return;
//                        } else {
//                            responseData = data[0];
//                        }
//                    });
                    this.objectValidation(selFieldData, rules[key].rule, function (err, data) {
                        if (err) {
                            callback(err, null);
                            return;
                        } else {
                            responseData = data;
                        }
                    });
                    break;
                case "array":
                    let respArray = [];
                    for (let key2 in rules[key].arrayTypes) {
                        let item = rules[key].arrayTypes[key2];
                        for (let fieldKey in selFieldData) {
                            let fieldData = selFieldData[fieldKey];
                            if (typeof fieldData === item.type) {
                                this._selectValidationType(fieldData, {"value": item}, "value", function (err, resp) {
                                    if (err) {
                                        callback(err, null);
                                        return;
                                    } else {
                                        respArray.push(resp);
                                    }
                                });
                            }
                        }
                    }
                    responseData = respArray;
                    break;
            }
            preResponse[key] = responseData;
            callback(null, preResponse[key]);
        } catch (ex) {
            callback(ex, null);
        }
    }

    objectValidation(selFieldData, rules, callBack) {
        let dataToRespond;
        var errCount = 0;
        
        if(typeof selFieldData !== "object") {
            try {
                selFieldData = JSON.parse(selFieldData);
            } catch (e) {
                callBack("The field object is not valid");
                return;
            }
        }
        
        if (typeof rules === "object") {
            for (var i = 0; i < rules.length; i++) {
                this.validate({
                    data: [selFieldData],
                    rule: rules[i]
                }, function (err, data) {
                    if (err) {
                        errCount++;
                    } else {
                        dataToRespond = data[0];
                    }
                });
            }
        } else {
            this.validate({
                data: [selFieldData],
                rule: rules
            }, function (err, data) {
                if (err) {
                    errCount++;
                } else {
                    dataToRespond = data[0];
                }
            });
        }

        if (errCount === 0) {
            callBack(null, dataToRespond);
        } else {
            callBack("No valid rule for this request was found", null);
        }
    }

    validate(valOptions, callback) {
        let responseObject = [];
        let key;
        let fullData = valOptions.data || [];
        let errCount = 0;
        let rules;

        if (valOptions.rule) {
            if (!is.empty(repoRules)) {
                rules = repoRules[valOptions.rule];
            } else {
                callback("No rule was found", null, null);
                return;
            }
        } else {
            callback("Rule is required", null, null);
            return;
        }

        if (typeof valOptions.format !== 'undefined') {
            this.runTimeOptions.format = valOptions.format;
        } else {
            this.runTimeOptions.format = this.defaults.format;
        }

        if (typeof valOptions.insideEncrypt !== 'undefined') {
            this.runTimeOptions.insideEncrypt = valOptions.insideEncrypt;
        } else {
            this.runTimeOptions.insideEncrypt = this.defaults.insideEncrypt;
        }

        for (let d = 0; d < fullData.length; d++) {
            let data = fullData[d];
            let preResponse = {};

            for (key in rules) {
                let selFieldData;
                let greenLight = false;
                if (typeof data[key] === 'undefined' || is.null(data[key])) {
                    let validateRequired = false;
                    if (is.propertyDefined(rules[key], "alterFields") && rules[key].alterFields.length > 0) {
                        let a = rules[key].alterFields;
                        let aKey;
                        for (let aKey = 0; aKey < a.length; aKey++) {
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
                    this._selectValidationType(selFieldData, rules, key, function (err, response) {
                        if (err) {
                            errCount++;
                            callback(err, null, null);
                        } else {
                            preResponse[key] = response;
                        }
                    });
                }
            }

            responseObject.push(preResponse);
        }
        if (errCount === 0)
        {
            utils.securityStrategy(options, this.runTimeOptions).encryptJwt(responseObject, function (err, response) {
                if (err)
                    callback(err, null);
                else
                    callback(null, responseObject, response);
            });
        }
    }

    getJwtSecret() {
        return options.crtJwtSecret;
    }

    encrypt(data, callBack) {
        utils.securityStrategy(options, this.runTimeOptions).encrypt(data, function (err, response) {
            if (err)
                callBack(err, null);
            else
                callBack(null, response);
        });
    }

    decrypt(data, callBack) {
        utils.securityStrategy(options, this.runTimeOptions).decrypt(data, function (err, response) {
            if (err)
                callBack(err, null);
            else
                callBack(null, response);
        });
    }

    encryptJwt(data, callBack) {
        utils.securityStrategy(options, this.runTimeOptions).encryptJwt(data, function (err, response) {
            if (err)
                callBack(err, null);
            else
                callBack(null, response);
        });
    }

    decryptJwt(data, callBack) {
        utils.securityStrategy(options, this.runTimeOptions).decryptJwt(data, function (err, response) {
            if (err)
                callBack(err, null);
            else
                callBack(null, response);
        });
    }
}