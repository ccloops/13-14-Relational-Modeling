'use strict';

require('./lib/setup');

const faker = require('faker');
const superagent = require('superagent');
const server = require('../lib/server');

const forestMock = require('./lib/forest-mock');
const continentMock = require('./lib/continent-mock');

const apiURL = `http://localhost:${process.env.PORT}/api/forests`;

describe('/api/forests', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  afterEach(forestMock.remove);

  describe('POST /api/forests', () => {
    test('should respond with a forest and 200 status code if there are no errors', () => {
      let tempContinentMock = null;
      return continentMock.create()
        .then(mock => {
          tempContinentMock = mock;
      
          let forestToPost = {
            name : faker.lorem.words(4),
            location : faker.lorem.words(1),
            type: 'Rain Forest',
            description : faker.lorem.words(100),
            continent: mock._id,
          };
          return superagent.post(`${apiURL}`)
            .send(forestToPost)
            .then(response => {
              expect(response.status).toEqual(200);
              expect(response.body._id).toBeTruthy();
              expect(response.body.timestamp).toBeTruthy();
              expect(response.body.continent).toEqual(tempContinentMock._id.toString());          

              expect(response.body.name).toEqual(forestToPost.name);
              expect(response.body.location).toEqual(forestToPost.location);
              expect(response.body.type).toEqual(forestToPost.type);          
              expect(response.body.description).toEqual(forestToPost.description);
            });
        });
    });

    test('should respond with a 404 if the continent id is not present', () => {
      return superagent.post(apiURL)
        .send({
          name : faker.lorem.words(4),
          location : faker.lorem.words(1),
          type: 'Rain Forest',
          description : faker.lorem.words(100),
          continent: 'BAD_ID',
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404);
        });
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
  });

  describe('GET /api/forests/:id', () => {
    test('GET should respond with 200 status code if there is a valid forest id and no errors', () => {
      let tempMock = null;

      return forestMock.create()
        .then(mock => {
          tempMock = mock;
          return superagent.get(`${apiURL}/${mock.forest._id}`);
        })
        .then(response => {
          expect(response.status).toEqual(200);

          expect(response.body._id).toEqual(tempMock.forest._id.toString());
          expect(response.body.timestamp).toBeTruthy();

          expect(response.body.name).toEqual(tempMock.forest.name);
          expect(response.body.location).toEqual(tempMock.forest.location);
          expect(response.body.type).toEqual(tempMock.forest.type);          
          expect(response.body.description).toEqual(tempMock.forest.description);
          
          expect(response.body.continent._id).toEqual(tempMock.continent._id.toString());
          expect(response.body.continent.name).toEqual(tempMock.continent.name);
          expect(JSON.stringify(response.body.continent.keywords)).toEqual(JSON.stringify(tempMock.continent.keywords));
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

  describe('GET /api/forests/', () => {
    test('should return 10 forests (where 10 is the size of the page by default)', () => {
      return forestMock.createMany(100)
        .then(() => {
          return superagent.get(`${apiURL}`);
        })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body.count).toEqual(100);
          expect(response.body.data.length).toEqual(10);        
        });
    });
  });

  describe('DELETE /api/forests/:id', () => {
    test('DELETE should respond with 204 status code with no content in the body if successfully deleted', () => {
      return forestMock.create()
        .then(mock => {
          return superagent.delete(`${apiURL}/${mock.forest._id}`)
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
      
      return forestMock.create()
        .then(mock => {
          forestToUpdate = mock.forest;
          return superagent.put(`${apiURL}/${mock.forest._id}`)
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
    
    test('should return a 404 status code if id is invalid', () => {
      return forestMock.create()
        .then(() => superagent.put(`${apiURL}/invalidId`))
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });
  });
});