/* eslint-disable import/no-extraneous-dependencies */
import {statSync} from 'fs';
import {globby} from 'globby';

const paths = await globby(['./dist/*.js']);
const totalSize = paths.reduce((total, path) => statSync(path).size + total, 0);
console.log(`${(totalSize * 0.001).toFixed(2)} Kb`);
