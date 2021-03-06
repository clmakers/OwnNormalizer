var lwip = require('lwip');

module.exports = function (fieldData, rule, options, runTimeOptions) {

    if (fieldData.charAt(0) !== "/") {
        fieldData = "/" + fieldData;
    }

    lwip.open(options.parentDirJumps + fieldData, function (err, image) {
        image.resize(rule.width, rule.height, null, function (err, rImage) {
            rImage.batch()
                    .writeFile(options.parentDirJumps + options.publicMediaDirectory + "image1.png", function (err) {
                        // check err...
                        // done.
                    });
        });
    });





//    if (is.propertyDefined(rule, "type")) {
//        if (!(typeof fieldData === rule.type)) {
//            throw "Field type is invalid";
//        }
//    } else {
//        throw "Field type is required";
//    }
//
//    if (is.propertyDefined(rule, "minValue") && is.propertyDefined(rule, "maxValue")) {
//        if (rule.maxValue === rule.minValue) {
//            throw "minValue property and maxValue property cannot be equal";
//        } else if (rule.maxValue < rule.minValue) {
//            throw "property maxValue cannot be lower than minValue property";
//        }
//        ;
//    }
//
//    if (is.propertyDefined(rule, "minValue")) {
//        if (fieldData < rule.minValue) {
//            throw "Field value cannot be lower than it's minimun value 'minValue':" + rule.minValue;
//        }
//    }
//    if (is.propertyDefined(rule, "maxValue")) {
//        if (fieldData > rule.maxValue) {
//            throw "Field value cannot be greater than it's maximun value 'maxValue':" + rule.maxValue;
//        }
//    }

    return fieldData;
};