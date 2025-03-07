import { validate } from './src/validator.ts';

console.log(
  validate(['foo', 'bar'], {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://example.com/unevaluated-items-with-dynamic-ref/derived',
    $ref: './baseSchema',
    $defs: {
      derived: {
        $dynamicAnchor: 'addons',
        prefixItems: [true, { type: 'string' }],
      },
      baseSchema: {
        $id: './baseSchema',
        $comment:
          "unevaluatedItems comes first so it's more likely to catch bugs with implementations that are sensitive to keyword ordering",
        unevaluatedItems: false,
        type: 'array',
        prefixItems: [{ type: 'string' }],
        $dynamicRef: '#addons',
        $defs: {
          defaultAddons: {
            $comment: 'Needed to satisfy the bookending requirement',
            $dynamicAnchor: 'addons',
          },
        },
      },
    },
  }),
);

console.log(
  validate(
    ['a', ['b', 'c', 'd']],
    {
      $dynamicAnchor: 'branch',
      $ref: '/schemas/dynamic-string-tree',
      maxItems: 2,
      $defs: {
        StringTree: {
          $id: 'https://example.com/schemas/string-tree',
          type: 'array',
          items: {
            anyOf: [{ type: 'string' }, { $dynamicRef: '#branch' }],
          },
        },
        BaseStringTree: {
          $id: 'https://example.com/schemas/dynamic-string-tree',
          $dynamicAnchor: 'branch',
          type: 'array',
          items: {
            anyOf: [{ type: 'string' }, { $dynamicRef: '#branch' }],
          },
        },
      },
    },
    { baseURI: 'https://example.com/' },
  ),
);

// console.log(
//   validate(
//     {
//       ['__proto__']: 12,
//       toString: { length: 'foo' },
//       constructor: 37,
//     },
//     {
//       $schema: 'https://json-schema.org/draft/2020-12/schema',
//       required: ['__proto__', 'toString', 'constructor'],
//     },
//   ),
// );

// import feedlyAPI from './feedly.ts';
// import { Client, type ParseSchema } from './src/index.ts';
//
// type Y = unknown[] & ['foo', 'bar'];
//
// type X = ParseSchema<
//   {
//     type: 'object';
//     properties: {
//       name: {
//         type: 'string';
//       };
//       age: {
//         type: 'integer';
//       };
//       sex: {
//         $ref: '#/Sex';
//       };
//       contacts: {
//         type: 'array';
//         items: {
//           type: 'string';
//         };
//       };
//       tuple: {
//         type: 'array';
//         prefixItems: [
//           {
//             const: 'foo';
//           },
//           {
//             const: 'bar';
//           },
//         ];
//       };
//     };
//     required: ['name', 'sex'];
//   },
//   {
//     Sex: {
//       enum: ['male', 'female'];
//     };
//   }
// >;
//
// const X: X = {
//   name: 'foo',
//   age: 123,
//   contacts: ['a'],
//   sex: 'male',
// };
//
// const client = new Client(feedlyAPI);
//
// const subscriptions = await client.request('get', '/subscriptions', {});
//
// const auth = await client.request('post', '/auth/{exchangeToken}', {
//   pathParams: {
//     exchangeToken: 'token',
//   },
//   contentType: 'application/json',
//   body: {
//     code: '',
//     client_id: 'feedly',
//     client_secret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
//     redirect_uri: 'https://feedly.com/feedly.html',
//     grant_type: 'authorization_code',
//   },
// });
//
// const error = auth.unwrap();
