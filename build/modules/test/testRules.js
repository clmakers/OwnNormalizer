var onNewTestCreeated = {
    id: {
        required:false,
        type: "string"
    },
    title:{
        required:true,
        type: "string",
        maxLength: 100,
        minLength: 1
    },
    description:{
        required:true,
        type: "string",
        minLength: 10
    },
    date: {
        required:false,
        type: "date",
        future:true,
        mask:"dddd dd 'de' mmmm 'del' yyyy"
    }
};

module.exports = {
    onNewTestCreeated:onNewTestCreeated
};

//Globals

/*
 * required
 * type
 * defaultValue
 */


//String Rules

/*
 * maxLength
 * minLength
 * exactLength
 * truncate
 * 
 */

//Dates Rules

/*
 * future
 * mask
 */

//Number Rules

/*
 * allowNegative
 * maxValue
 * minValue
 * upperCased
 * lowerCased
 */

//Boolean Rules

/*
 * 
 */

//URL Rules

/*
 * urlPattern
 * allowedDomain
 */

//HTML Rules
/*
 * allowedScripts
 */

//Password Rules
/*
 * algoritm
 * secretKey
 * minLength
 */

//Email Rules
/*
 * 
 */   

// exactLength
// defaultValue
// allowHtmlTags