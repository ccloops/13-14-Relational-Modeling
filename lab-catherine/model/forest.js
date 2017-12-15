'use strict';

const mongoose = require('mongoose');
const Continent = require('./continent');
const httpErrors = require('http-errors');

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
  continent: {
    type : mongoose.Schema.Types.ObjectId,
    required : true,
    ref : 'continent',
  },
});

forestSchema.pre('save', function(done) { 
  return Continent.findById(this.continent)
    .then(continentFound => {
      if(!continentFound)
        throw httpErrors(404, 'continent not found');

      continentFound.forests.push(this._id);
      return continentFound.save();
    })
    .then(() => done()) 
    .catch(done);

});

forestSchema.post('remove', (document, done) => { 
  return Continent.findById(document.continent)
    .then(continentFound => {
      if(!continentFound) 
        throw httpErrors(404, 'continent not found');

      continentFound.forests = continentFound.forests.filter(forest => {
        return forest._id.toString() !== document._id.toString();
      });
      return continentFound.save();
      
    })
    .then(() => done())
    .catch(done);
});
  
module.exports = mongoose.model('forest', forestSchema);