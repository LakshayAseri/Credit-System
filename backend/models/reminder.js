const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
    {
        invoice : {
            type : mongoose.Schema.Types.ObjectId,
            ref:"Invoice",
            required:true
        },
        customer:{
            type : mongoose.Schema.Types.ObjectId,
            ref : "Customer" , 
            required : true
        },
        phone : {
            type : String,
            required : true,
            trim : true
        },
        type : {
            type : String,
            enum : ["DUE_DATE" , "OVERDUE"],
            required : true
        },
        message:{
            type : String,
            required : true
        },

        status : {
            type : String,
            enum : ["SENT" , "FAILED"],
            required : true
        },

        sentAt : {
            type : Date ,
            default : Date.now
        }    
    },
    {
        timestamps : true
    }
);

module.exports = mongoose.model("Reminder" , reminderSchema);