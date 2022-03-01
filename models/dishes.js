const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Mongoose-currency intorduces a new data type currency
require("mongoose-currency").loadType(mongoose);
//Declaring the currency type
const Currency = mongoose.Types.Currency;

const commentSchema = new Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const dishSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: "",
    },
    price: {
      type: Currency,
      required: true,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    comments: [commentSchema], //Here "type" for "comments" is the commentSchema. We are using subDocument of commentSchema in Dish Schema
  },
  //MongoDB adds timestamps[Created at and updated at] automatically
  { timestamps: true }
);

//Constrcut model form the Schema
var Dishes = mongoose.model("Dish", dishSchema);

module.exports = Dishes;
