var dateFomat = require("./dateFormat");
var is = require('is_js');
var fs = require('fs');
var path = require('path');
var validators = require('./validators/validators');

//var filename = "hello.html";


module.exports = function (options) {

    var repoRules = {};
    var OwnNormalizer = {};
    var runTimeOptions = {};

    var defaults = {
        modulesPath: "/rules",
        dateMask: "fullDate",
        dateLang: "en",
        format: true,
        secureDataResponse: true,
        crtPublicKey: "MUMBOJUMBO",
        crtPrivateKey: makeRamdonString(),
        crtAlgorithm: "aes-256-cbc",
        crtCodification: "base64",
        crtCharset: "utf8",
        crtJwtSecret: makeRamdonString(),
        crtJwtExpiration: 48 * 60 * 60
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

    function populateRepoRules() {
        if (options.modulesPath.charAt(0) !== "/") {
            options.modulesPath = "/" + options.modulesPath;
        }
        var directoryFullPath = __dirname + "/../" + "../" + ".." + options.modulesPath;
        fs.readdir(directoryFullPath, function (err, files) {
            if (err)
                return;
            files.forEach(function (f) {
                var fileName = path.parse(f).name;
                if (path.extname(f) === ".json") {
                    if (is.propertyDefined(repoRules, fileName)) {
                        throw "Duplicate rule file has been found";
                    } else {
                        repoRules[fileName] = require(directoryFullPath + "/" + f);
                    }
                }
            });
        });
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
                    }
                    responseObject[key] = responseData;
                } catch (ex) {
                    errCount += 1;
                    callback("Error: " + ex, null, null);
                    break;
                }
            }
        }

        if (errCount === 0)
            callback(null, responseObject);
    };

    OwnNormalizer.getJwtSecret = function () {
        return options.crtJwtSecret;
    };

    /***** -> Initialize the instance <- *****/

    applyOptions();
    populateRepoRules();

    /***** *****/

    return OwnNormalizer;
};

