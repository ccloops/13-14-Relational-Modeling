'use strict';

const faker = require('faker');
const continentMock = require('./continent-mock');
const Forest = require('../../model/forest');

const forestMock = module.exports = {};

forestMock.create = () => {
  let mock = {};
  return continentMock.create()
    .then(continent => {
      mock.continent = continent;

      return new Forest({
        name: faker.lorem.words(4),
        location: faker.lorem.words(1),
        type: 'Rain Forest',
        description: faker.lorem.words(100),
        continent: continent._id, 
      }).save();
    })
    .then(forest => {
      mock.forest = forest;
      return mock;
    });
};
forestMock.createMany = (howMany) => {
  let mock = {};

  return continentMock.create()
    .then(continent => {
      mock.continent = continent;
      return Promise.all(new Array(howMany)
        .fill(0)
        .map(() => {
          return new Forest({
            name: faker.lorem.words(4),
            location: faker.lorem.words(1),
            type: 'Rain Forest',
            description: faker.lorem.words(100),
            continent: continent._id, 
          }).save();
        }));
    })
    .then(forests => {
      mock.forests = forests;
      return mock;
    });
};
forestMock.remove = () => Promise.all([
  Forest.remove({}),
  continentMock.remove(),
]);
