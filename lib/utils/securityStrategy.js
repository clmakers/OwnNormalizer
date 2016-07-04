var crypto = require('crypto');
var jwt = require('jsonwebtoken');

module.exports = function (options) {

    function encrypt(data, callBack) {
        try {
            var cipher = crypto.createCipher(options.crtAlgorithm, options.crtPrivateKey);
            callBack(null, cipher.update(JSON.stringify(data), options.crtCharset, options.crtCodification) + cipher.final(options.crtCodification));
        } catch (ex) {
            callBack(ex, null);
        }
    }

    function decrypt(data, callBack) {
        try {
            var decipher = crypto.createDecipher(options.crtAlgorithm, options.crtPrivateKey);
            callBack(null, JSON.parse(decipher.update(data, options.crtCodification, options.crtCharset) + decipher.final(options.crtCharset)));
        } catch (ex) {
            callBack(ex, null);
        }
    }

    function encryptJwt(data, callBack) {
        try {
            if (options.insideEncrypt) {
                encrypt(data, function (err, response) {
                    if (err)
                        callBack(err, null);
                    else
                        callBack(null, jwt.sign({data: response}, options.crtJwtSecret, {expiresIn: options.crtJwtExpiration}));
                });
            } else {
                callBack(null, jwt.sign({data: data}, options.crtJwtSecret, {expiresIn: options.crtJwtExpiration}));
            }
        } catch (ex) {
            callBack(ex, null);
        }
    }

    function decryptJwt(data, callBack) {
        try {
            jwt.verify(data, options.crtJwtSecret, function (err, decoded) {
                if (err) {
                    callBack(err, null);
                } else {
                    if (options.insideEncrypt) {
                        decrypt(decoded.data, function (err, response) {
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

    return {
        encrypt: encrypt,
        decrypt: decrypt,
        encryptJwt: encryptJwt,
        decryptJwt: decryptJwt
    };
};