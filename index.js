import _ from 'lodash';
import parse from './src/parse.js';

const buildTree = (obj1, obj2) => {
  const allKeys = _.union(Object.keys(obj1), Object.keys(obj2));

  return allKeys.reduce((acc, key) => {
    const hasKey1 = Object.hasOwn(obj1, key);
    const hasKey2 = Object.hasOwn(obj2, key);

    if (!hasKey1 || !hasKey2) {
      acc[key] = !hasKey1
        ? { name: key, type: 'added', value: obj2[key] }
        : { name: key, type: 'removed', value: obj1[key] };
    } else {
      const isEquality = obj1[key] === obj2[key];
      acc[key] = isEquality
        ? { name: key, type: 'unchanged', value: obj1[key] }
        : {
          name: key,
          type: 'changed',
          valueOld: obj1[key],
          valueNew: obj2[key],
        };
    }
    if (_.isObject(obj1[key]) && _.isObject(obj2[key])) {
      acc[key] = { name: key, type: 'unchanged', value: buildTree(obj1[key], obj2[key]) };
    }
    return acc;
  }, {});
};

const sortedObject = (obj) => {
  if (!_.isObject(obj) || obj === null) {
    return obj;
  }
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortedObject(obj[key]);
      return acc;
    }, {});
};

const gendiff = (filepath1, filepath2) => {
  const parseFile1 = parse(filepath1);
  const parseFile2 = parse(filepath2);
  const tree = sortedObject(buildTree(parseFile1, parseFile2));
  return tree;
};

export default gendiff;
