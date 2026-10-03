const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    invoice : {
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Invoice" ,
        required : true
    } ,
    amount : {              //amount != finalAmount 
                            //amount is money of partial payments
        type : Number ,
        required : true ,
         min : 1
    },
    date : {
        type : Date ,
        required : true
    } ,
    method : {
        type : String , 
        enum : ["CASH" , "UPI" , "CHEQUE"] , 
        required : true
    }
})

module.exports = mongoose.model("Payment" , paymentSchema);