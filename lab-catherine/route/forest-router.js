'use strict';

const {Router} = require('express');
const jsonParser = require('body-parser').json();

const Forest = require('../model/forest');
const logger = require('../lib/logger');
const httpErrors = require('http-errors');

const forestRouter = module.exports = new Router();

forestRouter.post('/api/forests', jsonParser, (request, response, next) => {

  if(!request.body.name || !request.body.location || !request.body.type || !request.body.description) {
    return next(httpErrors(400, 'name, location, type and description are required'));
  }
  
  return new Forest(request.body).save()
    .then(forest => response.json(forest))
    .catch(next);
});

forestRouter.get('/api/forests', (request, response) => {

  return Forest.find({}, (error, forests) => {
    let forestMap = [];

    forests.forEach(forest => {
      forestMap.push(forest);
    });

    return response.json(forestMap);
  });
});

forestRouter.get('/api/forests/:id', (request, response, next) => {

  return Forest.findById(request.params.id)
    .then(forest => {
      if(!forest){
        throw httpErrors(404, 'forest not found');
      }
      logger.log('info', 'GET - Returning a 200 status code');
      return response.json(forest);
    }).catch(next);
});

forestRouter.delete('/api/forests/:id', (request, response, next) => {
  return Forest.findByIdAndRemove(request.params.id)
    .then(forest => {
      if(!forest) {
        throw httpErrors(404, 'forest not found');
      } 
      logger.log('info', 'DELETE - Returning a 204 status code');
      return response.sendStatus(204);
    }).catch(next);
});

forestRouter.delete('/api/forests', (request, response) => {
  return response.sendStatus(400);
});

forestRouter.put('/api/forests/:id', jsonParser, (request, response, next) => {
  let options = {runValidators: true, new: true};
  return Forest.findByIdAndUpdate(request.params.id, request.body, options)
    .then(forest => {
      if(!forest) {
        throw httpErrors(404, 'forest not found');
      }
      logger.log('info', 'PUT - Returning a 200 status code');
      return response.json(forest);
    }).catch(next);
});