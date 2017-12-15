'use strict';

require('./lib/setup');

const superagent = require('superagent');
const server = require('../lib/server');
const continentMock = require('./lib/continent-mock');

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

});