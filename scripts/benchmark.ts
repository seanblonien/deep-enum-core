import chalkTemplate from 'chalk-template';
import getV from 'get-value';
import inquirer from 'inquirer';
import _ from 'lodash';
import objP from 'object-path';
import objPI from 'object-path-immutable';
import setV from 'set-value';
import {get, createDeepEnumInterface, setImmutable, setMutable} from '../src/core';

const deepConst = {
  a: {
    b: {
      c: {
        d: {
          e: {
            f: {
              g: {
                h: {
                  i: {
                    j: {
                      k: {
                        l: {
                          m: {
                            n: {
                              o: {
                                p: {
                                  q: {
                                    r: {
                                      s: {
                                        t: {
                                          u: {
                                            v: {
                                              w: {
                                                x: {
                                                  y: {
                                                    z: 'foo bar',
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

const {iterations}: {iterations: number} = await inquirer.prompt({
  name: 'iterations',
  type: 'number',
  message: 'How many iterations?',
  default() {
    return 1000;
  },
});

const time = (callback: () => void) => {
  const start = process.hrtime();
  Array.from(Array(iterations)).forEach(callback);
  const [seconds, nanoseconds] = process.hrtime(start);
  return ((seconds * 1e9 + nanoseconds) / 1e6).toFixed(4);
};

const benchmarkLog = (msg: string, spaces = 0) =>
  console.log(
    `${Array(spaces)
      .fill(' ')
      .reduce((p, c) => p + c, '')}${msg}`,
  );

const describe = (label: string, callback: () => void) => {
  benchmarkLog(label, 0);
  callback();
};
const unit = (label: string, callback: (logger: (msg: string) => void) => void) => {
  benchmarkLog(label, 2);
  callback((msg: string) => benchmarkLog(msg, 4));
};
const assert = (result: boolean) => {
  if (!result) {
    throw new Error('Assertion failed');
  }
};

const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

describe('comparing get/set methods to other libraries', () => {
  unit('comparing get methods', log => {
    // @ts-expect-error - testing a very deeply nested enum
    const pathEnum = createDeepEnumInterface(deepConst);

    const deepEnumTime = time(() => {
      const r = get(deepConst, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z);
      assert(r === 'foo bar');
    });
    const lodashTime = time(() => {
      const r = _.get(deepConst, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z);
      assert(r === 'foo bar');
    });
    const objectPathTime = time(() => {
      const r = objP.get(deepConst, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z);
      assert(r === 'foo bar');
    });
    const objectPathImmutableTime = time(() => {
      const r = objPI.get(deepConst, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z);
      assert(r === 'foo bar');
    });
    const getPathTime = time(() => {
      const r = getV(deepConst, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z);
      assert(r === 'foo bar');
    });

    const data = [
      {label: 'black.bgWhite.bold deep-enum get', time: deepEnumTime},
      {label: 'bold lodash get', time: lodashTime},
      {label: 'bold object-path get', time: objectPathTime},
      {label: 'bold object-path-immutable get', time: objectPathImmutableTime},
      {label: 'bold get-path get', time: getPathTime},
    ].sort((a, b) => Number(a.time) - Number(b.time));

    data.forEach(run => log(chalkTemplate`{${run.label}}: ${run.time}ms`));
  });
  unit('comparing set/setter methods', log => {
    const pathEnum = createDeepEnumInterface(deepConst);

    const deepEnumTime = time(() => {
      const deepConstCopy = deepCopy(deepConst);
      const newDeepConstCopy = setImmutable(
        deepConstCopy,
        pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z,
        'baz1',
      );
      const r = newDeepConstCopy.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z as string;
      assert(r === 'baz1');
    });
    const deepEnumMutableTime = time(() => {
      const deepConstCopy = deepCopy(deepConst);
      setMutable(deepConstCopy, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z, 'baz1');
      const r = deepConstCopy.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z as string;
      assert(r === 'baz1');
    });
    const lodashTime = time(() => {
      const deepConstCopy = deepCopy(deepConst);
      _.set(deepConstCopy, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z, 'baz2');
      const r = deepConstCopy.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z as string;
      assert(r === 'baz2');
    });
    const objectPathTime = time(() => {
      const deepConstCopy = deepCopy(deepConst);
      objP.set(deepConstCopy, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z, 'baz3');
      const r = deepConstCopy.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z as string;
      assert(r === 'baz3');
    });
    const objectPathImmutableTime = time(() => {
      const deepConstCopy = deepCopy(deepConst);
      objP.set(deepConstCopy, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z, 'baz4');
      const r = deepConstCopy.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z as string;
      assert(r === 'baz4');
    });
    const setValueTime = time(() => {
      const deepConstCopy = deepCopy(deepConst);
      setV(deepConstCopy, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z, 'baz5');
      const r = deepConstCopy.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z as string;
      assert(r === 'baz5');
    });

    const data = [
      {label: 'black.bgWhite.bold deep-enum set', time: deepEnumTime},
      {label: 'black.bgWhite.bold deep-enum set (mutable)', time: deepEnumMutableTime},
      {label: 'bold lodash set', time: lodashTime},
      {label: 'bold object-path set', time: objectPathTime},
      {label: 'bold object-path-immutable set', time: objectPathImmutableTime},
      {label: 'bold set-value set', time: setValueTime},
    ].sort((a, b) => Number(a.time) - Number(b.time));

    data.forEach(run => log(chalkTemplate`{${run.label}}: ${run.time}ms`));
  });
});
