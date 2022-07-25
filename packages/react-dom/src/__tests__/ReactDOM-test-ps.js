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
    let buttonRef1 = React.createRef();
    let buttonRef2 = React.createRef();

    const TestContext = React.createContext({
      tv: 1,
    });
    function Ch2() {
      const [sb, setSb] = React.useState([1, 2]);
      const c = React.useContext(TestContext);

      // React.useImperativeHandle()
      return (
        <div
          onClick={() => {
            setSb(pre => [...pre, sb.length]);
          }}
          ref={buttonRef2}>
          {sb.map((_sb, i) => {
            <span key={i}>{_sb}</span>;
          })}
          {c}
        </div>
      );
    }
    function Ch1(props) {
      const [sb, setSb] = React.useState(1);
      const ref = React.useRef();
      ref.current = {
        b: 12,
      };

      React.useEffect(() => {
        console.log('ref', ref.current);
      }, [sb]);
      return (
        <TestContext.Provider
          value={{
            tv: sb,
          }}>
          <div
            ref={buttonRef1}
            onClick={() => {
              setSb(pre => pre + 1);
            }}>
            {props.uuid}
            {sb !== 2 && <Ch2 />}
          </div>
        </TestContext.Provider>
      );
    }
    function Parent() {
      const [sb, setSb] = React.useState(10);
      const [sb1, setSb1] = React.useState(100);
      const [state, dispatch] = useReducer(
        (state, action) => {
          switch (action.type) {
            case 'dc':
              return {count: state.count + 1};
            case 'd':
              return {count: state.count - 1};
            default:
              throw new Error();
          }
        },
        {count: 1000},
      );

      React.useEffect(() => {
        console.log('log useEffect', sb);
        // console.log('log useEffect', sb1);
      }, [sb]);

      React.useCallback(() => {
        console.log('sb1');
      }, [sb1]);

      React.useLayoutEffect(() => {
        console.log('layout');
      });
      return (
        <div
          ref={buttonRef}
          onClick={event => {
            event.preventDefault();
            setSb(pre => pre + 1);
            setSb1(setSb1 => setSb1 + 1);
            dispatch({
              type: 'dc',
            });
          }}>
          {sb}
          {state.count}
          <Ch1 />
        </div>
      );
    }

    document.body.appendChild(container);

    ReactDOM.render(<Parent />, container);
    buttonRef.current.dispatchEvent(
      new Event('click', {bubbles: true, cancelable: true}),
    );
    buttonRef1.current.dispatchEvent(
      new Event('click', {bubbles: true, cancelable: true}),
    );
    buttonRef2.current.dispatchEvent(
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
