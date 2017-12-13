'use strict';

const mongoose = require('mongoose');

const forestSchema = mongoose.Schema({
  name : {
    type : String,
    required : true,
    unique : true,
  },
  location: {
    type : String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  description : {
    type : String,
    required : true,
    minlength : 10,
  },
  timestamp : {
    type : Date,
    default : () => new Date(),
  },
});

module.exports = mongoose.model('forest', forestSchema);