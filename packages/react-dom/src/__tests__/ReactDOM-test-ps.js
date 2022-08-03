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
let Suspense;

// debugger;
describe('ReactDOM', () => {
  beforeEach(() => {
    jest.resetModules();
    React = require('react');
    ReactDOM = require('react-dom');
    Scheduler = require('scheduler');
    act = require('jest-react').act;
    Suspense = require('react').Suspense;
    // ReactDOMServer = require('react-dom/server');
    // ReactTestUtils = require('react-dom/test-utils');
  });

  it('should bubble onSubmit', async () => {
    const container = document.createElement('div');
    const portal = document.createElement('p');
    // debugger;
    let res;
    // let count = 0;
    let buttonRef = React.createRef();
    let buttonRef1 = React.createRef();
    let buttonRef2 = React.createRef();
    let buttonRef11 = React.createRef();

    const TestContext = React.createContext({
      tv: 1,
    });

    function Ch3(props, ref) {
      React.useEffect(() => {
        console.log('Ch3 useEffect', props.id);
        return () => {
          console.log('Ch3 useEffect cb', props.id);
        };
      }, [props.id]);

      React.useImperativeHandle(ref, () => ({
        focus: () => {
          console.log('focus ch3');
        },
      }));
      return <div>{props.id}</div>;
    }

    const Ch33 = React.forwardRef(Ch3);

    function Ch2() {
      const [sb, setSb] = React.useState([1, 2]);
      const c = React.useContext(TestContext);
      const ch3Ref = React.useRef();

      React.useEffect(() => {
        console.log('Ch2 useEffect', sb);
        return () => {
          console.log('Ch2 useEffect cb', sb);
        };
      }, [sb]);
      return (
        <div
          onClick={() => {
            setSb(pre => [...pre, sb.length]);
            ch3Ref.current.focus();
          }}
          ref={buttonRef2}>
          {sb.map((_sb, i) => {
            return <span key={i}>{_sb}</span>;
          })}
          {c.tv}
          <Ch33 ref={ch3Ref} id={sb} />
        </div>
      );
    }

    const useData = props => {
      return '12';
    };
    function Ch1(props) {
      const [sb, setSb] = React.useState(1);
      const ref = React.useRef();
      const d = useData(props);
      React.useEffect(() => {
        console.log('Ch1 useEffect', sb);
        console.log('Ch1 ref', ref.current);

        return () => {
          console.log('Ch1 useEffect cb', sb);
        };
      }, [sb]);
      React.useLayoutEffect(() => {
        console.log('Ch1 layout');
      });

      return (
        <TestContext.Provider
          value={{
            tv: sb,
          }}>
          <div
            ref={buttonRef1}
            onClick={() => {
              ref.current = {
                b: 12,
              };
              setSb(pre => pre + 1);
            }}>
            {props.uuid}
            {sb !== 2 && <div>{sb}</div>}
            {d}
            {/* <Ch2 /> */}
          </div>
        </TestContext.Provider>
      );
    }

    function Child1(props) {
      const [sb, setSb] = React.useState(1);
      return <h1 ref={buttonRef11}>{props.sb}</h1>;
    }
    function Child2(props) {
      return ReactDOM.createPortal(props.children, portal);
    }
    function Parent() {
      const [sb, setSb] = React.useState(1);
      const [isPending, startTransition] = React.useTransition();

      return (
        <div
          ref={buttonRef}
          onClickCapture={event => {
            startTransition(() => {
              setSb(pre => pre + 1);
            });
          }}>
          {isPending && <span>loading</span>}
          <div>{sb}</div>
        </div>
      );
    }

    document.body.appendChild(container);
    document.body.appendChild(portal);

    ReactDOM.render(<Parent />, container);
    // act(() => {
      buttonRef.current.dispatchEvent(
      new Event('click', {bubbles: true, cancelable: true}),
    );
    // });

    // act(() => {
    // buttonRef.current.dispatchEvent(
    //   new Event('click', {bubbles: true, cancelable: true}),
    // );
    // });

    // buttonRef.current.dispatchEvent(
    //   new Event('click', {bubbles: true, cancelable: true}),
    // );
    // buttonRef.current.dispatchEvent(
    //   new Event('click', {bubbles: true, cancelable: true}),
    // );
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

    return await new Promise((_res, rej) => {
      console.log('not res');
      res = _res;

      setTimeout(() => {
        _res();
      });
    });

    // return '';
    // try {
    //   ReactDOM.render(<Parent />, container);
    //   buttonRef.click();
    //   expect(count).toBe(1);
    // } finally {
    //   document.body.removeChild(container);
    // }
  });
});
