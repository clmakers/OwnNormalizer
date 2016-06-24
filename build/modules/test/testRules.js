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


// exactLength
// defaultValue
// 