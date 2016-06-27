var crypto = require('crypto');
var jwt = require('jsonwebtoken');

cryptoParams = {
    privateKey: "KnUTZQTrVEysyWBgUiQuI4WiVbqVoUqKaWf0SCdHD5arxj5uymBu3CN6SoCw7Fml",
    algorithm: "aes-256-cbc",
    codification: "base64",
    charset: "utf8",
    jwtSecret: "KhIjoiS25VVFpRVHJWRXlzeVdCZ1VpUXVJNFdpVmJxVm9VcUthV2YwU0NkSEQ1Yl",
    jwtExpiration:  48 * 60 * 60
};

function encrypt(data) {
    var cipher = crypto.createCipher(cryptoParams.algorithm, cryptoParams.privateKey);
    return cipher.update(JSON.stringify(data), cryptoParams.charset, cryptoParams.codification) + cipher.final(cryptoParams.codification);
}

function decrypt(data) {
    var decipher = crypto.createDecipher(cryptoParams.algorithm, cryptoParams.privateKey);
    return decipher.update(data, cryptoParams.codification, cryptoParams.charset) + decipher.final(cryptoParams.charset);
}

function makeResponseToken(data) {
    return jwt.sign({data: encrypt(data)}, cryptoParams.jwtSecret, {expiresIn: cryptoParams.jwtExpiration});
}

function parseRequestToken(data) {
    return JSON.parse(decrypt(data));
}

module.exports = {
    makeResponseToken: makeResponseToken,
    parseRequestToken: parseRequestToken
};