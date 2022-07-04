/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */
//Open chrome://inspect and press "inspect"

'use strict';

let React;
let ReactDOM;
let ReactDOMClient;
let Scheduler;
let act;

debugger;
describe('ReactDOM', () => {
  beforeEach(() => {
    jest.resetModules();
    React = require('react');
    ReactDOM = require('react-dom');
    Scheduler = require('scheduler');
    act = require('jest-react').act;
    // ReactDOMServer = require('react-dom/server');
    // ReactTestUtils = require('react-dom/test-utils');
  });

  it('should bubble onSubmit', async () => {
    const container = document.createElement('div');
    // debugger;
    let res;
    // let count = 0;
    let buttonRef = React.createRef();

    function Ch(props) {
      return (
        <div>
          <div>
            {props.name}
            {props.uuid}
          </div>
        </div>
      );
    }
    function Parent() {
      const [sb, setSb] = React.useState(10);

      React.useEffect(() => {
        console.log('log useEffect', sb);
      }, [sb]);

      const memoSb = React.useMemo(() => {
        console.log('log memoSb', sb);
        return sb * 10;
      }, [sb]);
      console.log('p', sb);
      return (
        <div
          ref={buttonRef}
          onClick={event => {
            event.preventDefault();
            console.log('p', sb);
            setSb(pre => pre + 1);
          }}>
          {sb}
          <Ch name={sb} uuid={memoSb} />
        </div>
      );
    }

    document.body.appendChild(container);

    ReactDOM.render(<Parent />, container);
    buttonRef.current.dispatchEvent(
      new Event('click', {bubbles: true, cancelable: true}),
    );
    // buttonRef.current.dispatchEvent(
    //   new Event('click', {bubbles: true, cancelable: true}),
    // );
    // buttonRef.current.dispatchEvent(
    //   new Event('click', {bubbles: true, cancelable: true}),
    // );

    // Scheduler.unstable_flushAll();
    // await act(async () => {
    //   buttonRef.current.dispatchEvent(
    //     new Event('click', {
    //       bubbles: true,
    //       cancelable: true,
    //     }),
    //   );
    // });

    await new Promise((_res, rej) => {
      console.log('not res');
      res = _res;
    });

    return '';
    // try {
    //   ReactDOM.render(<Parent />, container);
    //   buttonRef.click();
    //   expect(count).toBe(1);
    // } finally {
    //   document.body.removeChild(container);
    // }
  });
});
