/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

let didWarnAboutMessageChannel = false;
let enqueueTaskImpl = null;

// task 插入 宏任务队列 （event loop 任务队列）,下一次任务迭代的时候执行task
// nodejs 环境 使用: setImmediate
// web 环境使用 : MessageChannel
export default function enqueueTask(task: () => void) {
  if (enqueueTaskImpl === null) {
    try {
      // read require off the module object to get around the bundlers.
      // we don't want them to detect a require and bundle a Node polyfill.
      const requireString = ('require' + Math.random()).slice(0, 7);
      const nodeRequire = module && module[requireString];
      // assuming we're in node, let's try to get node's
      // version of setImmediate, bypassing fake timers if any.
      // setImmediate 宏任务（nodejs）
      enqueueTaskImpl = nodeRequire.call(module, 'timers').setImmediate;
    } catch (_err) {
      // we're in a browser
      // we can't use regular timers because they may still be faked
      // so we try MessageChannel+postMessage instead
      enqueueTaskImpl = function(callback: () => void) {
        if (__DEV__) {
          if (didWarnAboutMessageChannel === false) {
            didWarnAboutMessageChannel = true;
            if (typeof MessageChannel === 'undefined') {
              console.error(
                'This browser does not have a MessageChannel implementation, ' +
                  'so enqueuing tasks via await act(async () => ...) will fail. ' +
                  'Please file an issue at https://github.com/facebook/react/issues ' +
                  'if you encounter this warning.',
              );
            }
          }
        }
        // MessageChannel 宏任务（web）
        const channel = new MessageChannel();
        channel.port1.onmessage = callback;
        channel.port2.postMessage(undefined);
      };
    }
  }
  return enqueueTaskImpl(task);
}
