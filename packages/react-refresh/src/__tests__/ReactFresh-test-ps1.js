/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

/* eslint-disable no-for-of-loops/no-for-of-loops */

'use strict';

let React;
let ReactDOM;
let ReactDOMClient;
let ReactFreshRuntime;
let Scheduler;
let act;
let createReactClass;

describe('ReactFresh', () => {
  let container;

  beforeEach(() => {
    if (__DEV__) {
      jest.resetModules();
      React = require('react');
      ReactFreshRuntime = require('react-refresh/runtime');
      ReactFreshRuntime.injectIntoGlobalHook(global);
      ReactDOM = require('react-dom');
      ReactDOMClient = require('react-dom/client');
      Scheduler = require('scheduler');
      act = require('jest-react').act;
      createReactClass = require('create-react-class/factory')(
        React.Component,
        React.isValidElement,
        new React.Component().updater,
      );
      container = document.createElement('div');
      document.body.appendChild(container);
    }
  });

  afterEach(() => {
    if (__DEV__) {
      delete global.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      document.body.removeChild(container);
    }
  });

  function prepare(version) {
    const Component = version();
    return Component;
  }

  function render(version, props) {
    const Component = version();
    act(() => {
      ReactDOM.render(<Component {...props} />, container);
    });
    return Component;
  }

  function patch(version) {
    const Component = version();
    ReactFreshRuntime.performReactRefresh();
    return Component;
  }

  function $RefreshReg$(type, id) {
    ReactFreshRuntime.register(type, id);
  }

  function $RefreshSig$(type, key, forceReset, getCustomHooks) {
    ReactFreshRuntime.setSignature(type, key, forceReset, getCustomHooks);
    return type;
  }

  // Note: This is based on a similar component we use in www. We can delete
  // once the extra div wrapper is no longer necessary.
  function LegacyHiddenDiv({children, mode}) {
    return (
      <div hidden={mode === 'hidden'}>
        <React.unstable_LegacyHidden
          mode={mode === 'hidden' ? 'unstable-defer-without-hiding' : mode}>
          {children}
        </React.unstable_LegacyHidden>
      </div>
    );
  }

  it.only('test', () => {
    const HelloV1 = render(() => {
      function Hello() {
        const [val, setVal] = React.useState(0);
        return (
          <p style={{color: 'blue'}} onClick={() => setVal(val + 1)}>
            {val}
          </p>
        );
      }
      $RefreshReg$(Hello, 'Hello');
      return Hello;
    });
    const el = container.firstChild;

    // act(() => {
    //   el.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    // });

    const Fun = () => {
      return <h1>h1</h1>;
    };
    //执行hmr
    const HelloV2 = patch(() => {
      function Hello1() {
        const [val, setVal] = React.useState(0);
        React.useEffect(() => {
          console.log('sdfsdf');
        }, [val]);
        return (
          <p style={{color: 'red'}} onClick={() => setVal(val + 1)}>
            <div>{val}</div>
            <Fun />
          </p>
        );
      }
      $RefreshReg$(Hello1, 'Hello');
      return Hello1;
    });

    act(() => {
      el.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    });

    //重新挂载
    render(() => {
      function Hello() {
        const [val, setVal] = React.useState(0);
        return (
          <p style={{color: 'blue'}} onClick={() => setVal(val + 1)}>
            <div>{val}</div>
          </p>
        );
      }
      // No register call.
      // This is considered a new type.
      return Hello;
    });
    // render(() => HelloV1);
    // render(() => HelloV2);
  });

  it('can preserve state for compatible types', () => {
    if (__DEV__) {
      const HelloV1 = render(() => {
        function Hello() {
          const [val, setVal] = React.useState(0);
          return (
            <p style={{color: 'blue'}} onClick={() => setVal(val + 1)}>
              {val}
            </p>
          );
        }
        $RefreshReg$(Hello, 'Hello');
        return Hello;
      });

      // Bump the state before patching.
      const el = container.firstChild;
      expect(el.textContent).toBe('0');
      expect(el.style.color).toBe('blue');
      act(() => {
        el.dispatchEvent(new MouseEvent('click', {bubbles: true}));
      });
      expect(el.textContent).toBe('1');

      const Fun = () => {
        return <h1>h1</h1>;
      };
      // Perform a hot update.
      const HelloV2 = patch(() => {
        function Hello() {
          const [val, setVal] = React.useState(0);
          React.useEffect(() => {
            console.log('sdfsdf');
          }, [val]);
          return (
            <p style={{color: 'red'}} onClick={() => setVal(val + 1)}>
              <div>{val}</div>
              <Fun />
            </p>
          );
        }
        $RefreshReg$(Hello, 'Hello');
        return Hello;
      });

      // Assert the state was preserved but color changed.
      expect(container.firstChild).toBe(el);
      expect(el.textContent).toBe('1');
      expect(el.style.color).toBe('red');

      // Bump the state again.
      act(() => {
        el.dispatchEvent(new MouseEvent('click', {bubbles: true}));
      });
      expect(container.firstChild).toBe(el);
      expect(el.textContent).toBe('2');
      expect(el.style.color).toBe('red');

      // Perform top-down renders with both fresh and stale types.
      // Neither should change the state or color.
      // They should always resolve to the latest version.
      render(() => HelloV1);
      render(() => HelloV2);
      render(() => HelloV1);
      expect(container.firstChild).toBe(el);
      expect(el.textContent).toBe('2');
      expect(el.style.color).toBe('red');

      // Bump the state again.
      act(() => {
        el.dispatchEvent(new MouseEvent('click', {bubbles: true}));
      });
      expect(container.firstChild).toBe(el);
      expect(el.textContent).toBe('3');
      expect(el.style.color).toBe('red');

      // Finally, a render with incompatible type should reset it.
      render(() => {
        function Hello() {
          const [val, setVal] = React.useState(0);
          return (
            <p style={{color: 'blue'}} onClick={() => setVal(val + 1)}>
              {val}
            </p>
          );
        }
        // No register call.
        // This is considered a new type.
        return Hello;
      });
      expect(container.firstChild).not.toBe(el);
      const newEl = container.firstChild;
      expect(newEl.textContent).toBe('0');
      expect(newEl.style.color).toBe('blue');
    }
  });

  it('batches re-renders during a hot update', () => {
    if (__DEV__) {
      let helloRenders = 0;

      render(() => {
        function Hello({children}) {
          helloRenders++;
          return <div>X{children}X</div>;
        }
        $RefreshReg$(Hello, 'Hello');

        function App() {
          return (
            <Hello>
              <Hello>
                <Hello />
              </Hello>
              <Hello>
                <Hello />
              </Hello>
            </Hello>
          );
        }
        return App;
      });
      expect(helloRenders).toBe(5);
      expect(container.textContent).toBe('XXXXXXXXXX');
      helloRenders = 0;

      patch(() => {
        function Hello({children}) {
          helloRenders++;
          return <div>O{children}O</div>;
        }
        $RefreshReg$(Hello, 'Hello');
      });
      expect(helloRenders).toBe(5);
      expect(container.textContent).toBe('OOOOOOOOOO');
    }
  });
});
