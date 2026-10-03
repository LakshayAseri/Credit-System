const mongoose  = require ('mongoose');

const customerSchema = new mongoose.Schema({
    name : {
        type : String , 
        required : true , 
        trim : true
    } , 

    phone : {
        type : String , 
        required : true , 
        trim : true
    },
    address : {
        type : String , 
        required : true , 
        trim : true
    } ,
    
    isDeleted : {
        type : Boolean , 
        default : false
    }
},
{
    timestamps : true
}
);

module.exports = mongoose.model("Customer" , customerSchema);