import fc from 'fast-check';

import { describe, expect, test } from 'vitest';

import { BLACK, ImmutableMap, RED } from '@/ImmutableMap.ts';

describe('ImmutableMap', () => {
  describe('delete()', () => {
    test('create a valid red-black tree by deletion', () => {
      fc.assert(
        fc.property(largeRedBlackTree(), fc.maxSafeInteger(), (tree, x) => {
          assertRedBlackTree(new ImmutableMap(tree).delete(x)['_root']);
        }),
      );
    });

    test('delete the inserted value', () => {
      fc.assert(
        fc.property(
          smallRedBlackTree(),
          fc.integer({ min: 0, max: 100 }),
          (tree, x) => {
            const xs = new ImmutableMap(tree).set(x, 1).delete(x);
            expect(xs.has(x)).toBe(false);
            expect(xs.get(x)).toBe(undefined);
          },
        ),
      );
    });

    test('delete all existing values', () => {
      fc.assert(
        fc.property(
          smallRedBlackTree(),
          fc.infiniteStream(
            fc.noBias(
              fc.integer({ min: 0, max: 0xffffff }).map((i) => i / 0xffffff),
            ),
          ),
          (tree, rng) => {
            const xs = shuffle(
              Array.from({ length: 101 }, (_, i) => i),
              rng,
            ).reduce((ys, x) => ys.delete(x), new ImmutableMap(tree));
            expect(xs.isEmpty()).toBe(true);
          },
        ),
      );
    });

    test('delete an existing value', () => {
      const arbitrary = fc
        .tuple(smallRedBlackTree(), fc.integer({ min: 0, max: 100 }))
        .filter(([tree, x]) => new ImmutableMap(tree).has(x));
      fc.assert(
        fc.property(arbitrary, ([tree, x]) => {
          const xs = new ImmutableMap(tree).delete(x);
          expect(xs.has(x)).toBe(false);
          expect(xs.get(x)).toBe(undefined);
        }),
      );
    });

    test('preserve the value unaffected by deletion', () => {
      const arbitrary = fc
        .tuple(
          smallRedBlackTree(),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
        )
        .filter(([tree, x, y]) => new ImmutableMap(tree).has(x) && x !== y);
      fc.assert(
        fc.property(arbitrary, ([tree, x, y]) => {
          const xs = new ImmutableMap(tree).delete(y);
          expect(xs.has(x)).toBe(true);
          expect(xs.get(x)).toBe(0);
        }),
      );
    });
  });

  describe('update()', () => {
    test('create a valid red-black tree by update', () => {
      fc.assert(
        fc.property(largeRedBlackTree(), fc.maxSafeInteger(), (tree, x) => {
          assertRedBlackTree(
            new ImmutableMap(tree).update(x, (v) => v + 1)['_root'],
          );
        }),
      );
    });

    test('update an existing value', () => {
      const arbitrary = fc
        .tuple(smallRedBlackTree(), fc.integer({ min: 0, max: 100 }))
        .filter(([tree, x]) => new ImmutableMap(tree).has(x));
      fc.assert(
        fc.property(arbitrary, ([tree, x]) => {
          const xs = new ImmutableMap(tree).update(x, (v) => v + 1);
          expect(xs.has(x)).toBe(true);
          expect(xs.get(x)).toBe(1);
        }),
      );
    });

    test('do not update anything if the key is not exist', () => {
      const arbitrary = fc
        .tuple(smallRedBlackTree(), fc.integer({ min: 0, max: 100 }))
        .filter(([tree, x]) => !new ImmutableMap(tree).has(x));
      fc.assert(
        fc.property(arbitrary, ([tree, x]) => {
          const xs = new ImmutableMap(tree).update(x, (v) => v + 1);
          expect(xs.has(x)).toBe(false);
          expect(xs.get(x)).toBe(undefined);
        }),
      );
    });
  });

  describe('upsert()', () => {
    test('create a valid red-black tree by upsert', () => {
      fc.assert(
        fc.property(largeRedBlackTree(), fc.maxSafeInteger(), (tree, x) => {
          assertRedBlackTree(
            new ImmutableMap(tree).upsert(
              x,
              (v) => v + 1,
              () => 0,
            )['_root'],
          );
        }),
      );
    });

    test('update an existing value', () => {
      const arbitrary = fc
        .tuple(smallRedBlackTree(), fc.integer({ min: 0, max: 100 }))
        .filter(([tree, x]) => new ImmutableMap(tree).has(x));
      fc.assert(
        fc.property(arbitrary, ([tree, x]) => {
          const xs = new ImmutableMap(tree).upsert(
            x,
            (v) => v + 1,
            () => 0,
          );
          expect(xs.has(x)).toBe(true);
          expect(xs.get(x)).toBe(1);
        }),
      );
    });

    test('insert the default value if the key is not exist', () => {
      const arbitrary = fc
        .tuple(smallRedBlackTree(), fc.integer({ min: 0, max: 100 }))
        .filter(([tree, x]) => !new ImmutableMap(tree).has(x));
      fc.assert(
        fc.property(arbitrary, ([tree, x]) => {
          const xs = new ImmutableMap(tree).upsert(
            x,
            (v) => v + 1,
            () => 0,
          );
          expect(xs.has(x)).toBe(true);
          expect(xs.get(x)).toBe(0);
        }),
      );
    });
  });

  describe('entries()', () => {
    test('enumerate entries in ascending order', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.maxSafeInteger(), { minLength: 0, maxLength: 100 }),
          (xs) => {
            const ys = xs.reduce(
              (xs, x, i) => xs.set(x, i),
              ImmutableMap.empty(),
            );

            expect(Array.from(ys.entries())).toEqual(
              xs.map((x, i) => [x, i] as const).sort(([x], [y]) => x - y),
            );
          },
        ),
      );
    });
  });

  describe('isEmpty()', () => {
    test('return whether the root of the tree is nil', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.maxSafeInteger(), { minLength: 0, maxLength: 100 }),
          (xs) => {
            const ys = xs.reduce(
              (xs, x, i) => xs.set(x, i),
              ImmutableMap.empty(),
            );

            expect(ys.isEmpty()).toEqual(xs.length === 0);
          },
        ),
      );
    });
  });

  describe('keys()', () => {
    test('enumerate keys in ascending order', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.maxSafeInteger(), { minLength: 0, maxLength: 100 }),
          (xs) => {
            const ys = xs.reduce(
              (xs, x, i) => xs.set(x, i),
              ImmutableMap.empty(),
            );

            expect(Array.from(ys.keys())).toEqual(xs.sort((x, y) => x - y));
          },
        ),
      );
    });
  });

  describe('set()', () => {
    test('get the inserted value', () => {
      fc.assert(
        fc.property(largeRedBlackTree(), fc.maxSafeInteger(), (tree, x) => {
          const xs = new ImmutableMap(tree).set(x, 1);
          expect(xs.has(x)).toBe(true);
          expect(xs.get(x)).toBe(1);
        }),
      );
    });

    test('create a valid red-black tree by insertion', () => {
      fc.assert(
        fc.property(
          smallRedBlackTree(),
          fc.integer({ min: 0, max: 100 }),
          (tree, x) => {
            assertRedBlackTree(new ImmutableMap(tree).set(x, 1)['_root']);
          },
        ),
      );
    });

    test('replace an old value with the new value', () => {
      const arbitrary = fc
        .tuple(smallRedBlackTree(), fc.integer({ min: 0, max: 100 }))
        .filter(([tree, x]) => new ImmutableMap(tree).has(x));
      fc.assert(
        fc.property(arbitrary, ([tree, x]) => {
          const xs = new ImmutableMap(tree).set(x, 1);
          expect(xs.has(x)).toBe(true);
          expect(xs.get(x)).toBe(1);
        }),
      );
    });

    test('do not add more than that it was supposed to add', () => {
      const arbitrary = fc
        .tuple(
          smallRedBlackTree(),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
        )
        .filter(([tree, x, y]) => !new ImmutableMap(tree).has(x) && x !== y);
      fc.assert(
        fc.property(arbitrary, ([tree, x, y]) => {
          const xs = new ImmutableMap(tree).set(y, 1);
          expect(xs.has(x)).toBe(false);
          expect(xs.get(x)).toBe(undefined);
        }),
      );
    });
  });

  describe('values()', () => {
    test('enumerate values in ascending order', () => {
      fc.assert(
        fc.property(
          fc.uniqueArray(fc.maxSafeInteger(), { minLength: 0, maxLength: 100 }),
          (xs) => {
            const ys = xs.reduce(
              (xs, x, i) => xs.set(x, i),
              ImmutableMap.empty(),
            );

            expect(Array.from(ys.values())).toEqual(
              xs
                .map((x, i) => [x, i] as const)
                .sort(([x], [y]) => x - y)
                .map(([_, i]) => i),
            );
          },
        ),
      );
    });
  });

  test('generate a valid red-black tree', () => {
    fc.assert(
      fc.property(largeRedBlackTree(), (tree) => {
        assertRedBlackTree(tree);
      }),
    );
  });
});

function assertRedBlackTree<K, V>(tree: ImmutableMap.Tree<K, V>): void {
  expect(verifyRootInvariant(tree), 'root invariant').toBe(true);
  expect(verifyRedInvariant(tree), 'red invariant').toBe(true);
  expect(verifyBlackInvariant(tree), 'black invariant').toBe(true);
  expect(verifyOrderInvariant(tree), 'order invariant').toBe(true);
}

function blackDepth<K, V>(tree: ImmutableMap.Tree<K, V>): number {
  return tree === null
    ? 1
    : (tree.color === RED ? 0 : 1) + blackDepth(tree.left);
}

function largeRedBlackTree(): fc.Arbitrary<ImmutableMap.Tree<number, number>> {
  return fc
    .integer({ min: 0, max: 4 })
    .chain((maxDepth) =>
      redBlackTree(Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, maxDepth),
    );
}

function middle(minimum: number, maximum: number): number {
  return minimum + Math.round((maximum - minimum) / 2);
}

function redBlackTree(
  minValue: number,
  maxValue: number,
  maxDepth: number,
): fc.Arbitrary<ImmutableMap.Tree<number, number>> {
  const red = fc.constant(RED);
  const black = fc.constant(BLACK);
  const value = fc.constant(0);

  const nil: fc.Arbitrary<ImmutableMap.Tree<number, number>> =
    fc.constant(null);

  const redNode = (
    minValue: number,
    maxValue: number,
    depth: number,
  ): fc.Arbitrary<ImmutableMap.Tree<number, number>> => {
    const middleValue = middle(minValue, maxValue);
    const left = tree(RED, minValue, middleValue - 1)(depth);
    const right = tree(RED, middleValue + 1, maxValue)(depth);
    return fc.record({
      color: red,
      key: fc.constant(middleValue),
      value,
      left,
      right,
    });
  };

  const blackNode = (
    minValue: number,
    maxValue: number,
    depth: number,
  ): fc.Arbitrary<ImmutableMap.Tree<number, number>> => {
    const middleValue = middle(minValue, maxValue);
    const left = tree(BLACK, minValue, middleValue - 1)(depth - 1);
    const right = tree(BLACK, middleValue + 1, maxValue)(depth - 1);
    return fc.record({
      color: black,
      key: fc.constant(middleValue),
      value,
      left,
      right,
    });
  };

  const tree = (
    color: ImmutableMap.Color,
    minValue: number,
    maxValue: number,
  ): fc.Memo<ImmutableMap.Tree<number, number>> =>
    fc.memo((n) => {
      if (color === BLACK) {
        if (n <= 0) {
          return nil;
        } else if (n === 1) {
          return fc.oneof(
            nil,
            fc.record({
              color: red,
              key: fc.integer({ min: minValue, max: maxValue }),
              value,
              left: nil,
              right: nil,
            }),
          );
        } else {
          return fc.oneof(
            redNode(minValue, maxValue, n),
            blackNode(minValue, maxValue, n),
          );
        }
      } else {
        if (n <= 1) {
          return nil;
        } else {
          return blackNode(minValue, maxValue, n);
        }
      }
    });

  return tree(RED, minValue, maxValue)(maxDepth);
}

function searchMax<K, V>(
  tree: ImmutableMap.Tree<K, V>,
): ImmutableMap.Tree<K, V> {
  let current = tree;
  if (current !== null) {
    while (current.right !== null) {
      current = current.right;
    }
  }
  return current;
}

function searchMin<K, V>(
  tree: ImmutableMap.Tree<K, V>,
): ImmutableMap.Tree<K, V> {
  let current = tree;
  if (current !== null) {
    while (current.left !== null) {
      current = current.left;
    }
  }
  return current;
}

function shuffle<T>(xs: T[], rng: Iterator<number>): T[] {
  const ys = new Array<T>(xs.length);
  for (let i = 0, l = xs.length; i < l; i++) {
    const j = Math.floor(rng.next().value * (i + 1));
    ys[i] = ys[j]!;
    ys[j] = xs[i]!;
  }
  return ys;
}

function smallRedBlackTree(): fc.Arbitrary<ImmutableMap.Tree<number, number>> {
  return fc
    .integer({ min: 0, max: 3 })
    .chain((maxDepth) => redBlackTree(0, 100, maxDepth));
}

function verifyBlackInvariant<K, V>(tree: ImmutableMap.Tree<K, V>): boolean {
  if (tree === null) {
    return true;
  }
  return (
    blackDepth(tree.left) === blackDepth(tree.right) &&
    verifyBlackInvariant(tree.left) &&
    verifyBlackInvariant(tree.right)
  );
}

function verifyOrderInvariant<K, V>(tree: ImmutableMap.Tree<K, V>): boolean {
  if (tree === null) {
    return true;
  }
  if (tree.left === null && tree.right === null) {
    return true;
  }
  const minTree = searchMin(tree.left);
  const maxTree = searchMax(tree.right);
  return (
    (minTree === null || minTree.key < tree.key) &&
    (maxTree === null || maxTree.key > tree.key) &&
    verifyOrderInvariant(tree.left) &&
    verifyOrderInvariant(tree.right)
  );
}

function verifyRedInvariant<K, V>(tree: ImmutableMap.Tree<K, V>): boolean {
  if (tree === null) {
    return true;
  }
  if (
    tree.color === RED &&
    (tree.left?.color === RED || tree.right?.color === RED)
  ) {
    return false;
  }
  return verifyRedInvariant(tree.left) && verifyRedInvariant(tree.right);
}

function verifyRootInvariant<K, V>(tree: ImmutableMap.Tree<K, V>): boolean {
  return tree === null || tree.color === BLACK;
}
