/**
 * Persistent Vector — TypeScript implementation
 *
 * Based on the data structure described by hyPiRion:
 *   https://hypirion.com/musings/understanding-persistent-vector-pt-1
 *
 * Key ideas:
 *  - Immutable, persistent (copy-on-write via structural sharing)
 *  - Bit-partitioned array trie with branching factor 32 (BITS = 5)
 *  - Tail optimisation: last ≤32 elements are stored in a flat array
 *    to make `append` amortized O(1)
 *  - All mutating operations return a NEW PersistentVector,
 *    leaving the original untouched.
 *
 * Complexity summary:
 *  append  – amortized O(1)  (tail fast-path; O(log₃₂ n) on tail overflow)
 *  get     – O(log₃₂ n)     ≈ effectively O(1) for any realistic n
 *  set     – O(log₃₂ n)
 *  pop     – O(log₃₂ n)
 *  count   – O(1)
 */

const BITS = 5; // log₂(branching factor)
const WIDTH = 1 << BITS; // 32 — nodes hold up to 32 children/values
const MASK = WIDTH - 1; // 0b11111

type Node<T> = InternalNode<T> | LeafNode<T>;

/**
 * An internal trie node holds up to WIDTH child nodes.
 */
interface InternalNode<T> {
  readonly children: Node<T>[];
}

/**
 * A leaf node holds up to WIDTH values.
 */
interface LeafNode<T> {
  readonly values: T[];
}

export class ImmutableVec<T> implements Iterable<T> {
  private static _EMPTY: ImmutableVec<any> = new ImmutableVec(
    0,
    BITS,
    null,
    [],
  );

  /**
   * Number of elements stored in the trie (NOT counting the tail).
   */
  private readonly _count: number;

  /**
   * Bit-shift for the root level.
   * Equals BITS * (depth of trie).  Starts at BITS for a 1-level trie.
   */
  private readonly _shift: number;

  /**
   * Root node of the trie (may be null for empty/small vectors).
   */
  private readonly _root: Node<T> | null;

  /**
   * Tail: a mutable-looking but treated-as-immutable flat array.
   */
  private readonly _tail: T[];

  private constructor(
    count: number,
    shift: number,
    root: Node<T> | null,
    tail: T[],
  ) {
    this._count = count;
    this._shift = shift;
    this._root = root;
    this._tail = tail;
  }

  /**
   * Return the canonical empty vector.
   */
  static empty<T>(): ImmutableVec<T> {
    return ImmutableVec._EMPTY;
  }

  /**
   * Construct a vector from an iterable.
   */
  static from<T>(source: Iterable<T>): ImmutableVec<T> {
    let vec = ImmutableVec._EMPTY;
    for (const item of source) {
      vec = vec.push(item);
    }
    return vec;
  }

  /**
   * Number of elements in this vector.
   */
  get length(): number {
    return this._count;
  }

  /**
   * Iterate over all elements in order.
   */
  *[Symbol.iterator](): Generator<T> {
    for (let i = 0, l = this._count; i < l; i++) {
      yield this.get(i);
    }
  }

  /**
   * Return a new vector with `value` appended at the end.
   * Amortized O(1).
   */
  push(value: T): ImmutableVec<T> {
    // Fast path: tail still has room.
    if (this._tail.length < WIDTH) {
      const newTail = this._tail.slice();
      newTail.push(value);
      return new ImmutableVec(
        this._count + 1,
        this._shift,
        this._root,
        newTail,
      );
    }

    // Tail is full — push it into the trie.
    const tailNode: LeafNode<T> = { values: this._tail };
    let newShift = this._shift;
    let newRoot: Node<T>;

    if (this._root === null) {
      // Trie was empty — the full tail becomes the first (and only) leaf.
      newRoot = tailNode;
    } else if (this._tailIndex() >>> this._shift >= WIDTH) {
      // Trie is full at current depth — grow by one level.
      newShift = this._shift + BITS;
      newRoot = {
        children: [this._root, this._newPath(this._shift, tailNode)],
      };
    } else if (isLeaf(this._root)) {
      // Root is currently a single leaf (depth 0).
      // Promote to a one-level internal node.
      newRoot = { children: [this._root, tailNode] };
    } else {
      // Insert tail node into existing trie.
      newRoot = this._pushTail(this._shift, this._root, tailNode);
    }

    return new ImmutableVec(this._count + 1, newShift, newRoot, [value]);
  }

  /**
   * Return the element at `index`.  Throws if out of bounds.
   * O(log₃₂ n).
   */
  get(index: number): T {
    if (index < 0 || index >= this._count) {
      throw new RangeError(
        `Index ${index} out of bounds (count=${this._count})`,
      );
    }
    return this._arrayFor(index)[index & MASK]!;
  }

  /**
   * Return a new vector with element at `index` replaced by `value`.
   * O(log₃₂ n).
   */
  set(index: number, value: T): ImmutableVec<T> {
    if (index < 0 || index >= this._count) {
      throw new RangeError(
        `Index ${index} out of bounds (count=${this._count})`,
      );
    }

    // Element is in the tail.
    if (index >= this._tailOffset()) {
      const newTail = this._tail.slice();
      newTail[index & MASK] = value;
      return new ImmutableVec(this._count, this._shift, this._root, newTail);
    }

    // Element is in the trie.
    const newRoot = this._doSet(this._shift, this._root!, index, value);
    return new ImmutableVec(this._count, this._shift, newRoot, this._tail);
  }

  /**
   * Return a new vector with the last element removed.
   * O(log₃₂ n).
   */
  pop(): ImmutableVec<T> {
    if (this._count === 0) {
      throw new RangeError('Cannot pop from an empty vector');
    }

    if (this._count === 1) {
      return ImmutableVec._EMPTY;
    }

    // Easy case: tail still has >1 element.
    if (this._tail.length > 1) {
      const newTail = this._tail.slice(0, -1);
      return new ImmutableVec(
        this._count - 1,
        this._shift,
        this._root,
        newTail,
      );
    }

    // Tail has exactly 1 element — pull new tail from the trie.
    const lastInTrie = this._arrayFor(this._tailOffset() - 1);

    let newRoot: Node<T> | null = this._popTail(this._shift, this._root!);
    let newShift = this._shift;

    // Shrink tree depth if root has only one child left.
    if (newRoot !== null && !isLeaf(newRoot) && newRoot.children.length === 1) {
      newRoot = newRoot.children[0]!;
      newShift = this._shift - BITS;
    }

    // If the trie is now empty, collapse to null.
    if (newRoot !== null && isLeaf(newRoot)) {
      // The single leaf becomes the tail; root becomes null.
      return new ImmutableVec(
        this._count - 1,
        BITS,
        null,
        (newRoot as LeafNode<T>).values,
      );
    }

    return new ImmutableVec(this._count - 1, newShift, newRoot, lastInTrie);
  }

  /**
   * The index at which the tail starts.
   * Equivalently, the number of elements stored in the trie.
   */
  private _tailOffset(): number {
    if (this._count < WIDTH) {
      return 0;
    }
    return ((this._count - 1) >>> BITS) << BITS;
  }

  /**
   * The index of the tail within the trie address space
   * (= first element of the tail).
   */
  private _tailIndex(): number {
    return this._count - this._tail.length;
  }

  /**
   * Return the leaf values-array that contains element `index`.
   * If `index` is in the tail, return the tail itself.
   */
  private _arrayFor(index: number): T[] {
    if (index >= this._tailOffset()) {
      return this._tail;
    }

    let node = this._root!;
    for (let level = this._shift; level > 0; level -= BITS) {
      node = (node as InternalNode<T>).children[(index >>> level) & MASK]!;
    }
    return (node as LeafNode<T>).values;
  }

  /**
   * Create a path of single-child internal nodes down to `node`.
   */
  private _newPath(level: number, node: Node<T>): Node<T> {
    return level === 0
      ? node
      : { children: [this._newPath(level - BITS, node)] };
  }

  /**
   * Push `tailNode` into the trie, returning a new root.
   */
  private _pushTail(
    level: number,
    parent: InternalNode<T>,
    tailNode: LeafNode<T>,
  ): InternalNode<T> {
    const subIndex = ((this._count - 1) >>> level) & MASK;
    const newChildren = parent.children.slice();

    if (level === BITS) {
      // We're one level above leaves — insert directly.
      newChildren[subIndex] = tailNode;
    } else if (subIndex < parent.children.length) {
      // Path already exists — recurse.
      newChildren[subIndex] = this._pushTail(
        level - BITS,
        parent.children[subIndex] as InternalNode<T>,
        tailNode,
      );
    } else {
      // Path does not exist — create it.
      newChildren[subIndex] = this._newPath(level - BITS, tailNode);
    }

    return { children: newChildren };
  }

  /**
   * Return a copy of the subtree at `node` with element `index` set to `value`.
   */
  private _doSet(
    level: number,
    node: Node<T>,
    index: number,
    value: T,
  ): Node<T> {
    if (level === 0) {
      // Leaf node.
      const newValues = (node as LeafNode<T>).values.slice();
      newValues[index & MASK] = value;
      return { values: newValues };
    }

    const subIndex = (index >>> level) & MASK;
    const newChildren = (node as InternalNode<T>).children.slice();
    newChildren[subIndex] = this._doSet(
      level - BITS,
      newChildren[subIndex]!,
      index,
      value,
    );
    return { children: newChildren };
  }

  /**
   * Remove the last leaf node from the trie, returning the new root (or null).
   */
  private _popTail(level: number, node: Node<T>): Node<T> | null {
    const subIndex = ((this._tailOffset() - 1) >>> level) & MASK;

    if (level > BITS) {
      const child = (node as InternalNode<T>).children[subIndex]!;
      const newChild = this._popTail(level - BITS, child);

      if (newChild === null && subIndex === 0) {
        return null;
      }

      const newChildren = (node as InternalNode<T>).children.slice();
      if (newChild === null) {
        newChildren.splice(subIndex, 1);
      } else {
        newChildren[subIndex] = newChild;
      }
      return { children: newChildren };
    }

    if (subIndex === 0) {
      return null;
    }

    const newChildren = (node as InternalNode<T>).children.toSpliced(
      subIndex,
      1,
    );
    return { children: newChildren };
  }
}

function isLeaf<T>(node: Node<T>): node is LeafNode<T> {
  return 'values' in node;
}

function demo() {
  console.log('=== Persistent Vector Demo ===\n');

  // Build a vector of 0..99
  let v0 = ImmutableVec.empty<number>();
  for (let i = 0; i < 100; i++) v0 = v0.push(i);

  console.log(`count : ${v0.length}`); // 100
  console.log(`get(0): ${v0.get(0)}`); // 0
  console.log(`get(31): ${v0.get(31)}`); // 31
  console.log(`get(32): ${v0.get(32)}`); // 32  (crosses trie boundary)
  console.log(`get(99): ${v0.get(99)}`); // 99  (in tail)

  // Structural sharing: set does NOT mutate v0
  const v1 = v0.set(50, 9999);
  console.log(`\nv0.get(50) = ${v0.get(50)}`); // 50  (unchanged)
  console.log(`v1.get(50) = ${v1.get(50)}`); // 9999

  console.dir(v1, { depth: null });

  // Pop
  const v2 = v0.pop();
  console.log(`\nv0.count after pop: ${v0.length}`); // 100 (unchanged)
  console.log(`v2.count after pop: ${v2.length}`); // 99
  console.log(`v2.get(98) = ${v2.get(98)}`); // 98

  // Iteration
  const arr = Array.from(ImmutableVec.from([10, 20, 30]));
  console.log(`\nIterated: ${arr}`); // [10, 20, 30]

  // Stress test — verify all values after 10 000 appends
  let big = ImmutableVec.empty<number>();
  const N = 10_000;
  for (let i = 0; i < N; i++) big = big.push(i);

  let allCorrect = true;
  for (let i = 0; i < N; i++) {
    if (big.get(i) !== i) {
      allCorrect = false;
      break;
    }
  }
  console.log(`\nStress test (N=${N}): all values correct = ${allCorrect}`);
}

demo();
