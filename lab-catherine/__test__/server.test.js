'use strict';

process.env.PORT = 3000;

process.env.MONGODB_URI = 'mongodb://localhost/testing';

const faker = require('faker');
const superagent = require('superagent');
const Forest = require('../model/forest');
const server = require('../lib/server');
const logger = require('../lib/logger');

const apiURL = `http://localhost:${process.env.PORT}/api/forests`;

const forestMockCreate = () => {
  return new Forest({
    name : faker.lorem.words(4),
    location : faker.lorem.words(1),
    type: 'Rain Forest',
    description : faker.lorem.words(100),
  }).save();
};

describe('/api/forests', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  afterEach(() => Forest.remove({}));

  describe('POST /api/forests', () => {
    test('should respond with a forest and 200 status code if there are no errors', () => {
      let forestToPost = {
        name : faker.lorem.words(4),
        location : faker.lorem.words(1),
        type: 'Rain Forest',
        description : faker.lorem.words(100),
      };
      return superagent.post(`${apiURL}`)
        .send(forestToPost)
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body._id).toBeTruthy();
          expect(response.body.timestamp).toBeTruthy();

          expect(response.body.name).toEqual(forestToPost.name);
          expect(response.body.location).toEqual(forestToPost.location);
          expect(response.body.type).toEqual(forestToPost.type);          
          expect(response.body.description).toEqual(forestToPost.description);
        })
        .catch(error => logger.log('error', error));
    });

    test('should respond with a 400 status code if we send an incomplete forest', () => {
      let forestToPost = {
        description : faker.lorem.words(100),
      };
      return superagent.post(`${apiURL}`)
        .send(forestToPost)
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(400);
        });
    });

    test('should respond with a 409 status code if a key is unique', () => {
      let forestToPost = {
        name : faker.lorem.words(4),
        location : faker.lorem.words(1),
        type: 'Rain Forest',
        description : faker.lorem.words(100),
      };
      return superagent.post(`${apiURL}`)
        .send(forestToPost)
        .then(() => { 
          return superagent.post(`${apiURL}`)
            .send(forestToPost);
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(409);
        });
    });
  });

  describe('GET /api/forests', () => {
    test('GET should respond with 200 status code if there is a valid forest id and no errors', () => {
      let forestToTest = null;

      return forestMockCreate()
        .then(forest => {
          forestToTest = forest;
          return superagent.get(`${apiURL}/${forest._id}`);
        })
        .then(response => {
          expect(response.status).toEqual(200);

          expect(response.body._id).toEqual(forestToTest._id.toString());
          expect(response.body.timestamp).toBeTruthy();

          expect(response.body.name).toEqual(forestToTest.name);
          expect(response.body.location).toEqual(forestToTest.location);
          expect(response.body.type).toEqual(forestToTest.type);          
          expect(response.body.description).toEqual(forestToTest.description);
        });    
    });

    test('GET should respond with an array of all forest objects if get request is made with out an id', () => {
      return forestMockCreate()
        .then(() => forestMockCreate())
        .then(() => forestMockCreate())
        .then(() => superagent.get(`${apiURL}`))
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body.length).toEqual(3);
        });
    });
    
    test('GET should respond with 404 status code if the id is incorrect', () => {
      return superagent.get(`${apiURL}/mooshy`)
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });
  });

  describe('DELETE /api/forests/:id', () => {
    test('DELETE should respond with 204 status code with no content in the body if successfully deleted', () => {
      return forestMockCreate()
        .then(forest => {
          return superagent.delete(`${apiURL}/${forest._id}`)
            .then(response => {
              expect(response.status).toEqual(204);
            });
        });
    });
  
    test('DELETE should respond with 404 status code if id is invalid', () => {
      return superagent.delete(`${apiURL}/invalidId`)
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });

    test('DELETE should respond with 400 status code if no id is provided', () => {
      return superagent.del(`${apiURL}`)
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(400);
        });
    });
  });

  describe('PUT /api/forests/:id', () => {
    test('should update forest and respond with 200 if there are no errors', () => {
      
      let forestToUpdate = null;
      
      return forestMockCreate()
        .then(forest => {
          forestToUpdate = forest;
          return superagent.put(`${apiURL}/${forest._id}`)
            .send({name: 'Evergreen Forest'});
        }).then(response => { 
          expect(response.status).toEqual(200);
          expect(response.body.name).toEqual('Evergreen Forest');
          expect(response.body.location).toEqual(forestToUpdate.location);
          expect(response.body.type).toEqual(forestToUpdate.type);
          expect(response.body.description).toEqual(forestToUpdate.description);
          expect(response.body._id).toEqual(forestToUpdate._id.toString()); 
        });
    });
    
    test('should return a 400 status code if invalid PUT request', () => {
      return forestMockCreate()
        .then(forest => superagent.put(`${apiURL}/${forest._id}`))
        .catch(response => {
          expect(response.status).toEqual(400);
        });
    });

    test('should return a 404 status code if id is invalid', () => {
      return forestMockCreate()
        .then(() => superagent.put(`${apiURL}/invalidId`))
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });


    test('should respond with a 409 status code if a key is unique', () => {
      let forestToPostOne = {
        name : 'Evergreen Forest',
        location : faker.lorem.words(1),
        type: 'Rain Forest',
        description : faker.lorem.words(100),
      };

      let forestToPostTwo = {
        name : faker.lorem.words(4),
        location : faker.lorem.words(1),
        type: 'Rain Forest',
        description : faker.lorem.words(100),
      };

      return superagent.post(`${apiURL}`)
        .send(forestToPostOne)
        .then(() => { 
          return superagent.post(`${apiURL}`)
            .send(forestToPostTwo);
        })
        .then(response => {
          return superagent.put(`${apiURL}/${response.body._id}`)
            .send({name: 'Evergreen Forest'});
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(409);
        });
    });
  });
});