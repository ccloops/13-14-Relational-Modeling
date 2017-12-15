'use strict';

const faker = require('faker');
const Continent = require('../../model/continent');

const continentMock = module.exports = {};

continentMock.create = () => {
  return new Continent({
    name: faker.lorem.words(1),
    size: faker.random.number(2),
    population: faker.random.number(3),
    keywords: faker.lorem.words(5).split(' '),
  }).save();
};

continentMock.createMany = (howMany) => {
  return Promise.all(new Array(howMany).fill(0).map(() => continentMock.create()));
};

continentMock.remove = () => Continent.remove({});