var mongoose = require("mongoose");

//Define a schema
var Schema = mongoose.Schema;
var admin = new Schema(
  {
    id: String,
    admin_id: String,
    password: String
  },
  { collection: "Admin" }
);

module.exports = mongoose.model("Admin", admin);
