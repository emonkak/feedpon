import { describe, expect, it } from 'vitest';

import { defaultParameterSerializer } from '../src/serializer.ts';

describe('defaultParameterSerializer', () => {
  it.each([
    ['matrix', false, ';color'],
    ['matrix', true, ';color'],
    ['label', false, '.'],
    ['label', true, '.'],
    ['simple', false, ''],
    ['simple', true, ''],
    ['form', false, '?color='],
    ['form', true, '?color='],
  ] as const)('serializes nullable values', (style, explode, expected) => {
    expect(
      defaultParameterSerializer(null, {
        name: 'color',
        in: 'query',
        style,
        explode,
        allowEmptyValue: true,
      }),
    ).toBe(expected);
  });

  it.each([
    ['matrix', false, ';color=blue'],
    ['matrix', true, ';color=blue'],
    ['label', false, '.blue'],
    ['label', true, '.blue'],
    ['simple', false, 'blue'],
    ['simple', true, 'blue'],
    ['form', false, '?color=blue'],
    ['form', true, '?color=blue'],
  ] as const)('serializes string values', (style, explode, expected) => {
    expect(
      defaultParameterSerializer('blue', {
        name: 'color',
        in: 'query',
        style,
        explode,
      }),
    ).toBe(expected);
  });

  it.each([
    ['matrix', false, ';color=blue,black,brown'],
    ['matrix', true, ';color=blue;color=black;color=brown'],
    ['label', false, '.blue,black,brown'],
    ['label', true, '.blue.black.brown'],
    ['simple', false, 'blue,black,brown'],
    ['simple', true, 'blue,black,brown'],
    ['form', false, '?color=blue,black,brown'],
    ['form', true, '?color=blue&color=black&color=brown'],
    ['spaceDelimited', false, '?color=blue%20black%20brown'],
    ['pipeDelimited', false, '?color=blue%7Cblack%7Cbrown'],
  ] as const)('serializes array values', (style, explode, expected) => {
    expect(
      defaultParameterSerializer(['blue', 'black', 'brown'], {
        name: 'color',
        in: 'query',
        style,
        explode,
      }),
    ).toBe(expected);
  });

  it.each([
    ['matrix', false, ';color=R,100,G,200,B,150'],
    ['matrix', true, ';R=100;G=200;B=150'],
    ['label', false, '.R,100,G,200,B,150'],
    ['label', true, '.R=100.G=200.B=150'],
    ['simple', false, 'R,100,G,200,B,150'],
    ['simple', true, 'R=100,G=200,B=150'],
    ['form', false, '?color=R,100,G,200,B,150'],
    ['form', true, '?R=100&G=200&B=150'],
    ['spaceDelimited', false, '?color=R%20100%20G%20200%20B%20150'],
    ['pipeDelimited', false, '?color=R%7C100%7CG%7C200%7CB%7C150'],
    ['deepObject', true, '?color%5BR%5D=100&color%5BG%5D=200&color%5BB%5D=150'],
  ] as const)('serializes object values', (style, explode, expected) => {
    expect(
      defaultParameterSerializer(
        { R: 100, G: 200, B: 150 },
        {
          name: 'color',
          in: 'query',
          style,
          explode,
        },
      ),
    ).toBe(expected);
  });
});
