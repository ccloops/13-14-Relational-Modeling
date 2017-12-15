'use strict';

const {Router} = require('express');
const httpErrors = require('http-errors');
const jsonParser = require('body-parser').json();
const Continent = require('../model/continent');

const continentRouter = module.exports = new Router();

continentRouter.post('/api/continents', jsonParser, (request, response, next) => {
  if(!request.body.name)
    return next(httpErrors(400,'continent model requires a name'));

  return new Continent(request.body).save()
    .then(continent => response.json(continent))
    .catch(next);
});

continentRouter.put('/api/continents/:id', jsonParser,(request, response, next) => {
  let options = {new : true, runValidators : true};

  return Continent.findByIdAndUpdate(request.params.id, request.body, options)
    .then(continent => {
      if(!continent)
        throw httpErrors(404,'continent not found');
      return response.json(continent);
    })
    .catch(next);
});

continentRouter.get('/api/continents/:id', (request, response, next) => {
  return Continent.findById(request.params.id)
    .then(continent => {
      if(!continent)
        throw httpErrors(404, 'continent not found');
      return response.json(continent);
    })
    .catch(next);
});


continentRouter.delete('/api/continents/:id',(request, response, next) => {
  return Continent.findByIdAndRemove(request.params.id)
    .then(continent => {
      if(!continent)
        throw httpErrors(404,'continent not found');
      
      return response.sendStatus(204);
    })
    .catch(next);
});