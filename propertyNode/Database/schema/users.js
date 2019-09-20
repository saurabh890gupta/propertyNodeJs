var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;

var users = new Schema(
  {
    id: String,
    user_type: String,
    user_name: String,
    email: String,
    password: String,
    address: {
      type: String,
      default: "kumar gali"
    },
    comments: [
      {
        email: String,
        date: {
          type: Date,
          default: Date.now
        },
        pincode: String
      }
    ],
    repeatpassword: String,
    remember: Boolean,
    vrifivation_token: String,
    token: String,
    otp: String,
    otpTime: Number,
    linkTime:Number,
    linkFlag:Boolean,
    account_status: Number
  },
  { collection: "Users" }
);

module.exports = mongoose.model("Users", users);
