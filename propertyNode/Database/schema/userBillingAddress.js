const mongoose=require('mongoose');
let Schema=mongoose.Schema;

var  BillingAddress= new Schema({
    id: String,
    firstName:String,
    lastName:String,
    mobile:String,
    address:String,
    city:String,
    state:String,
    postcode:String,
    country:String,
    paymentMode:String,
    termCondition:String,
    user_id:String,
},{collection:'BillingAddress'})

module.exports=mongoose.model('BillingAddress', BillingAddress);