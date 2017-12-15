'use strict';

require('./lib/setup');

const superagent = require('superagent');
const server = require('../lib/server');
const continentMock = require('./lib/continent-mock');
const faker = require('faker');

const apiURL = `http://localhost:${process.env.PORT}/api/continents`;

describe('/api/continents', () => {
  beforeAll(server.start);
  afterAll(server.stop);
  afterEach(continentMock.remove);

  describe('POST /continents', () => {
    test('should return a 200 and a continent if there are no errors', () => {
      return superagent.post(apiURL)
        .send({
          name: 'Antarctica', 
          keywords: ['snow', 'ice'],
        })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(response.body.keywords).toEqual(['snow', 'ice']);
        });
    });

    test('should respond with a 400 if incomplete post request', () => {
      return superagent.post(apiURL)
        .send({
          size: faker.random.number(2),
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(400);
        });
    });

    test('DELETE should respond with 404 status code if id is invalid', () => {
      return superagent.delete(`${apiURL}/invalidId`)
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(404);
        });
    });

    test('should return a 409 due to a duplicate name', () => {
      return continentMock.create()
        .then(continent => {
          return superagent.post(apiURL)
            .send({
              name: continent.name,
              keywords: [],
            });
        })
        .then(Promise.reject)
        .catch(response => {
          expect(response.status).toEqual(409);
        });
    });
  });

  describe('GET /continents/:id', () => {
    test('should respond with a 200 status and a continent if there are no errors', () => {
      let tempContinentMock;

      return continentMock.create()
        .then(continent => {
          tempContinentMock = continent;
          return superagent.get(`${apiURL}/${continent.id}`);
        })
        .then(response => {
          expect(response.status).toEqual(200);
          expect(JSON.stringify(response.body.keywords))
            .toEqual(JSON.stringify(tempContinentMock.keywords));
        });
    });
  });

  describe('PUT /continents/:id', () => {

    
    test('should return a 400 status code if invalid PUT request', () => {
      return continentMock.create()
        .then(continent => superagent.put(`${apiURL}/${continent._id}`))
        .catch(response => {
          expect(response.status).toEqual(400);
        });
    });

    test('should update continent and respond with 200 if there are no errors', () => {
      
      let continentToUpdate = null;
      
      return continentMock.create()
        .then(continent => {
          continentToUpdate = continent;
          return superagent.put(`${apiURL}/${continent._id}`)
            .send({name: 'Asia'});
        }).then(response => { 
          expect(response.status).toEqual(200);
          expect(response.body.name).toEqual('Asia');
          expect(response.body.size).toEqual(continentToUpdate.size);
          expect(response.body.population).toEqual(continentToUpdate.population);
          expect(response.body._id).toEqual(continentToUpdate._id.toString()); 
        });
    });
  });

  describe('DELETE /api/continents/:id', () => {
    test('DELETE should respond with 204 status code with no content in the body if successfully deleted', () => {
      return continentMock.create()
        .then(mock => {
          return superagent.delete(`${apiURL}/${mock._id}`)
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

    // test.only('DELETE should respond with 400 status code if no id is provided', () => {
    //   return superagent.delete(`${apiURL}`)
    //     .then(Promise.reject)
    //     .catch(response => {
    //       expect(response.status).toEqual(400);
    //     });
    // });
  });

});