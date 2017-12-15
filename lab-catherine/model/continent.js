'use strict';

const mongoose = require('mongoose');

const continentSchema = mongoose.Schema({
  name: {type: String,
    required: true,
    unique: true,
  },
  size: {type: Number,
  },
  population: {type: Number,
  },
  keywords : [{type : String}],
  timeStamp : {type : Date,
    default: () => new Date(),
  },
  forests : [{type : mongoose.Schema.Types.ObjectId,
    ref: 'forest'}],
}, {
  usePushEach : true,
});

module.exports = mongoose.model('continent', continentSchema);