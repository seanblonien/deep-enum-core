import _get from 'lodash/get';
import _set from 'lodash/set';
import {get, makePathEnum, set} from '../src/enum';

const now = process.hrtime;

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

const time = (callback: () => void) => {
  const start = now();
  callback();
  const [seconds, nanoseconds] = now(start);
  return ((seconds * 1e9 + nanoseconds) / 1e6).toFixed(4);
};

const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

console.log('comparing get/set methods to other libraries');

describe('comparing get/set methods to other libraries', () => {
  it('should get a property', () => {
    const pathEnum = makePathEnum(deepConst);

    const deepEnumTime = time(() => {
      expect(get(deepConst, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z)).toBe('foo bar');
    });
    const lodashTime = time(() => {
      expect(_get(deepConst, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z)).toBe('foo bar');
    });
    console.log(`deep-enum get: ${deepEnumTime}ms`);
    console.log(`lodash get: ${lodashTime}ms`);
  });
  it('should set a property', () => {
    const deepConstCopy = deepCopy(deepConst);
    const pathEnum = makePathEnum(deepConstCopy);

    const deepEnumTime = time(() => {
      const newDeepConstCopy = set(deepConstCopy, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z, 'baz1');
      expect(get(newDeepConstCopy, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z)).toBe('baz1');
    });
    const lodashTime = time(() => {
      _set(deepConstCopy, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z, 'baz2');
      expect(_get(deepConstCopy, pathEnum.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z)).toBe('baz2');
    });
    console.log(`deep-enum set: ${deepEnumTime}ms`);
    console.log(`lodash set: ${lodashTime}ms`);
  });
});
