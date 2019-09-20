const mongoose = require("mongoose");
let Schema = mongoose.Schema;

var Contactus = new Schema(
  {
    id: String,
    name: String,
    email: String,
    contact: String,
    address: String,
    query: String,
    user_id: String
  },
  { collection: "Contactus" }
);

module.exports = mongoose.model("Contactus", Contactus);
