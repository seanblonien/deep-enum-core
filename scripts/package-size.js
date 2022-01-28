import {statSync} from 'fs';
import {globby} from 'globby';

const paths = await globby(['./dist/*.js']);
const totalSize = paths.reduce((total, path) => statSync(path).size + total, 0);

console.log(`${totalSize} bytes`);
