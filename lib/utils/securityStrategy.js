'use strict';

let crypto = require('crypto');
let jwt = require('jsonwebtoken');
let options = {};
let runTimeOptions = {};

module.exports = class SecurityStrategy {
    constructor(_options, _runTimeOptions) {
        options = _options;
        runTimeOptions = _runTimeOptions;
    }

    encrypt(data, callBack) {
        try {
            let cipher = crypto.createCipher(options.crtAlgorithm, options.crtPrivateKey);
            callBack(null, cipher.update(JSON.stringify(data), options.crtCharset, options.crtCodification) + cipher.final(options.crtCodification), options.crtJwtSecret, {expiresIn: options.crtJwtExpiration});
        } catch (ex) {
            callBack(ex, null);
        }
    }

    decrypt(data, callBack) {
        try {
            let decipher = crypto.createDecipher(options.crtAlgorithm, options.crtPrivateKey);
            callBack(null, JSON.parse(decipher.update(data, options.crtCodification, options.crtCharset) + decipher.final(options.crtCharset)));
        } catch (ex) {
            callBack(ex, null);
        }
    }

    encryptJwt(data, callBack) {
        try {
            if (options.insideEncrypt || runTimeOptions.insideEncrypt) {
                this.encrypt(data, function (err, response, crtJwtSecret, crtJwtExpiration) {
                    if (err)
                        callBack(err, null);
                    else
                        callBack(null, jwt.sign({data: response}, crtJwtSecret, crtJwtExpiration));
                });
            } else {
                callBack(null, jwt.sign({data: data}, options.crtJwtSecret, {expiresIn: options.crtJwtExpiration}));
            }
        } catch (ex) {
            callBack(ex, null);
        }
    }

    decryptJwt(data, callBack) {
        try {
            jwt.verify(data, options.crtJwtSecret, function (err, decoded) {
                if (err) {
                    callBack(err, null);
                } else {
                    if (options.insideEncrypt || runTimeOptions.insideEncrypt) {
                        new SecurityStrategy(options, runTimeOptions).decrypt(decoded.data, function (err, response) {
                            if (err)
                                callBack(err, null);
                            else
                                callBack(null, response);
                        });
                    } else {
                        callBack(null, decoded.data);
                    }
                }
            });
        } catch (ex) {
            callBack(ex, null);
        }
    }
}