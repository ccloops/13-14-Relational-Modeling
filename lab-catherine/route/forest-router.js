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

forestRouter.get('/api/forests/:id', (request, response, next) => {

  return Forest.findById(request.params.id)
    .populate('continent')
    .then(forest => {
      if(!forest){
        throw httpErrors(404, 'forest not found');
      }
      logger.log('info', 'GET - Returning a 200 status code');
      return response.json(forest);
    }).catch(next);
});

forestRouter.get('/api/forests', (request, response, next) => {
  const PAGE_SIZE = 10;
  let {page = '0'} = request.query;
  page = Number(page);
  
  if(isNaN(page)) 
    page = 0;
  
  page = page < 0 ? 0 : page;
  
  let allForests = null;
  
  return Forest.find({})
    .skip(page * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .then(forests => {
      allForests = forests;
      return Forest.find({}).count();
    })
    .then(forestCount => {
      let responseData = {
        count : forestCount,
        data: allForests,
      };
      let lastPage = Math.floor(forestCount / PAGE_SIZE);
      response.links({
        next: `http://localhost:${process.env.PORT}/api/forests?page=${page === lastPage ? lastPage : page + 1}`,
        prev: `http://localhost:${process.env.PORT}/api/forests?page=${page < 1 ? 0 : page - 1}`,
        last: `http://localhost:${process.env.PORT}/api/forests?page=${lastPage}`,
      });
  
      response.json(responseData);
    });
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