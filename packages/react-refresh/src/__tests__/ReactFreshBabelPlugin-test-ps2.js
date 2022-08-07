/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const babel = require('@babel/core');
const {wrap} = require('jest-snapshot-serializer-raw');
const freshPlugin = require('react-refresh/babel');

function transform(input, options = {}) {
  return wrap(
    babel.transform(input, {
      babelrc: false,
      configFile: false,
      envName: options.envName,
      plugins: [
        '@babel/syntax-jsx',
        '@babel/syntax-dynamic-import',
        [
          freshPlugin,
          {
            skipEnvCheck:
              options.skipEnvCheck === undefined ? true : options.skipEnvCheck,
            // To simplify debugging tests:
            emitFullSignatures: true,
            ...options.freshOptions,
          },
        ],
        ...(options.plugins || []),
      ],
    }).code,
  );
}

describe('ReactFreshBabelPlugin', () => {
  it('registers top-level function declarations', () => {
    // Hello and Bar should be registered, handleClick shouldn't.
    const str = transform(`
    function Hello() {
      const [s,st] = React.useState(0)
      function handleClick() {}
      return <h1 onClick={handleClick}>Hi</h1>;
    }

    function Bar() {
      return <Hello />;
    }
`);
    console.log('str:', str);
  });
});
