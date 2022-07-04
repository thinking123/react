/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {ReactNodeList} from 'shared/ReactTypes';
import type {
  FiberRoot,
  SuspenseHydrationCallbacks,
  TransitionTracingCallbacks,
} from './ReactInternalTypes';
import type {RootTag} from './ReactRootTags';
import type {Cache} from './ReactFiberCacheComponent.new';
import type {
  PendingSuspenseBoundaries,
  Transition,
} from './ReactFiberTracingMarkerComponent.new';

import {noTimeout, supportsHydration} from './ReactFiberHostConfig';
import {createHostRootFiber} from './ReactFiber.new';
import {
  NoLane,
  NoLanes,
  NoTimestamp,
  TotalLanes,
  createLaneMap,
} from './ReactFiberLane.new';
import {
  enableSuspenseCallback,
  enableCache,
  enableProfilerCommitHooks,
  enableProfilerTimer,
  enableUpdaterTracking,
  enableTransitionTracing,
} from 'shared/ReactFeatureFlags';
import {initializeUpdateQueue} from './ReactUpdateQueue.new';
import {LegacyRoot, ConcurrentRoot} from './ReactRootTags';
import {createCache, retainCache} from './ReactFiberCacheComponent.new';

export type RootState = {
  element: any,
  isDehydrated: boolean,
  cache: Cache,
  pendingSuspenseBoundaries: PendingSuspenseBoundaries | null,
  transitions: Set<Transition> | null,
};

function FiberRootNode(
  containerInfo,
  tag,
  hydrate,
  identifierPrefix,
  onRecoverableError,
) {
  this.tag = tag; // LegacyRoot
  this.containerInfo = containerInfo; // id="root" html
  this.pendingChildren = null;
  this.current = null; // current === Host Fiber , FiberNode
  this.pingCache = null;
  this.finishedWork = null;
  this.timeoutHandle = noTimeout;
  this.context = null;
  this.pendingContext = null;
  this.callbackNode = null;
  this.callbackPriority = NoLane;// NoLane === 0b000...(31)
  this.eventTimes = createLaneMap(NoLanes); // NoLanes === 0b000...(31)
  this.expirationTimes = createLaneMap(NoTimestamp); //NoTimestamp ===  -1

  this.pendingLanes = NoLanes;
  this.suspendedLanes = NoLanes;
  this.pingedLanes = NoLanes;
  this.expiredLanes = NoLanes;
  this.mutableReadLanes = NoLanes;
  this.finishedLanes = NoLanes;

  this.entangledLanes = NoLanes;
  this.entanglements = createLaneMap(NoLanes);

  this.identifierPrefix = identifierPrefix;
  this.onRecoverableError = onRecoverableError;

  if (enableCache) { // true
    this.pooledCache = null;
    this.pooledCacheLanes = NoLanes;
  }

  if (supportsHydration) { // true
    this.mutableSourceEagerHydrationData = null;
  }
  // 启用挂起回调
  if (enableSuspenseCallback) {  // true
    this.hydrationCallbacks = null;
  }
  // 启用转换跟踪
  if (enableTransitionTracing) {// false
    this.transitionCallbacks = null;
    const transitionLanesMap = (this.transitionLanes = []);
    for (let i = 0; i < TotalLanes; i++) { // TotalLanes === 31
      transitionLanesMap.push(null);
    }
  }
  // 启用探查器计时器
  if (enableProfilerTimer && enableProfilerCommitHooks) { // true
    this.effectDuration = 0;
    this.passiveEffectDuration = 0;
  }

  if (enableUpdaterTracking) { // true
    this.memoizedUpdaters = new Set();
    const pendingUpdatersLaneMap = (this.pendingUpdatersLaneMap = []);
    for (let i = 0; i < TotalLanes; i++) {
      pendingUpdatersLaneMap.push(new Set());
    }
  }

  if (__DEV__) {
    switch (tag) { // tag === LegacyRoot , hydrate === false , _debugRootType === render
      case ConcurrentRoot:
        this._debugRootType = hydrate ? 'hydrateRoot()' : 'createRoot()';
        break;
      case LegacyRoot:
        this._debugRootType = hydrate ? 'hydrate()' : 'render()';
        break;
    }
  }
}

export function createFiberRoot(
  containerInfo: any, // root container
  tag: RootTag,// LegacyRoot
  hydrate: boolean, // false
  initialChildren: ReactNodeList, // null
  hydrationCallbacks: null | SuspenseHydrationCallbacks, // null
  isStrictMode: boolean, // false
  concurrentUpdatesByDefaultOverride: null | boolean, // false
  // TODO: We have several of these arguments that are conceptually part of the
  // host config, but because they are passed in at runtime, we have to thread
  // them through the root constructor. Perhaps we should put them all into a
  // single type, like a DynamicHostConfig that is defined by the renderer.
  identifierPrefix: string, // ''
  onRecoverableError: null | ((error: mixed) => void), // () => {}
  transitionCallbacks: null | TransitionTracingCallbacks, // null
): FiberRoot { // 创建Fiber Root
  const root: FiberRoot = (new FiberRootNode(
    containerInfo,
    tag,
    hydrate,
    identifierPrefix,
    onRecoverableError,
  ): any);
  if (enableSuspenseCallback) { // true
    root.hydrationCallbacks = hydrationCallbacks;
  }

  if (enableTransitionTracing) { // false
    root.transitionCallbacks = transitionCallbacks;
  }

  // Cyclic construction. This cheats the type system right now because
  // stateNode is any. 创建Host Fiber ：FiberNode (type = HostRoot)
  const uninitializedFiber = createHostRootFiber( // 创建 FiberNode
    tag,
    isStrictMode,
    concurrentUpdatesByDefaultOverride,
  );//root.current -> HostRoot.stateNode -> root
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;

  if (enableCache) { // true
    const initialCache = createCache(); // {controller,data,refCount}
    retainCache(initialCache); // 保存 cache : refCount++

    // The pooledCache is a fresh cache instance that is used temporarily
    // for newly mounted boundaries during a render. In general, the
    // pooledCache is always cleared from the root at the end of a render:
    // it is either released when render commits, or moved to an Offscreen
    // component if rendering suspends. Because the lifetime of the pooled
    // cache is distinct from the main memoizedState.cache, it must be
    // retained separately.
    root.pooledCache = initialCache;
    retainCache(initialCache); // refCount++
    const initialState: RootState = {
      element: initialChildren, // null
      isDehydrated: hydrate, // false
      cache: initialCache,
      transitions: null,
      pendingSuspenseBoundaries: null,
    };
    // memoizedState(记忆状态)
    uninitializedFiber.memoizedState = initialState;
  } else {
    const initialState: RootState = {
      element: initialChildren,
      isDehydrated: hydrate,
      cache: (null: any), // not enabled yet
      transitions: null,
      pendingSuspenseBoundaries: null,
    };
    uninitializedFiber.memoizedState = initialState;
  }
  // 插入 updateQueue 到 uninitializedFiber
  /*
    uninitializedFiber.updateQueue = {
      baseState: fiber.memoizedState, // {element,isDehydrated,cache,transitions,...}
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: {
        pending: null,
        interleaved: null,
        lanes: NoLanes,
      },
      effects: null,
    }
  */
  initializeUpdateQueue(uninitializedFiber);

  return root;
}
