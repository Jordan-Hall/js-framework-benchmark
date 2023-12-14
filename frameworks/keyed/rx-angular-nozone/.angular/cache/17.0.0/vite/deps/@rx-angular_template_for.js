import {
  BehaviorSubject,
  ChangeDetectorRef,
  Directive,
  ErrorHandler,
  Inject,
  Injectable,
  InjectionToken,
  Input,
  IterableDiffers,
  NgZone,
  Observable,
  Optional,
  ReplaySubject,
  Subject,
  Subscription,
  TemplateRef,
  ViewContainerRef,
  __spreadProps,
  __spreadValues,
  _global,
  catchError,
  combineLatest,
  concat,
  distinctUntilChanged,
  filter,
  from,
  fromEvent,
  ignoreElements,
  inject,
  isObservable,
  map,
  mapTo,
  of,
  setClassMetadata,
  share,
  shareReplay,
  startWith,
  switchAll,
  switchMap,
  take,
  takeUntil,
  tap,
  throwError,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵinject
} from "./chunk-BVJNOA5P.js";

// node_modules/@rx-angular/cdk/fesm2022/cdk-coercing.mjs
function coerceObservable(o) {
  return isObservable(o) ? o : of(o);
}
function coerceObservableWith() {
  return (o$) => map(coerceObservable)(o$);
}
function coerceDistinctWith(flattenOperator) {
  flattenOperator = flattenOperator || switchAll();
  return (o$) => o$.pipe(coerceObservableWith(), distinctUntilChanged(), flattenOperator, distinctUntilChanged());
}
function coerceAllFactory(subjectFactory, flattenOperator) {
  const observablesSubject = subjectFactory ? subjectFactory() : new Subject();
  flattenOperator = flattenOperator || switchAll();
  const values$ = observablesSubject.pipe(coerceDistinctWith(flattenOperator));
  return {
    next(observable) {
      observablesSubject.next(observable);
    },
    values$
  };
}

// node_modules/@rx-angular/cdk/fesm2022/cdk-internals-scheduler.mjs
function push(heap, node) {
  const index = heap.length;
  heap.push(node);
  siftUp(heap, node, index);
}
function peek(heap) {
  const first = heap[0];
  return first === void 0 ? null : first;
}
function pop(heap) {
  const first = heap[0];
  if (first !== void 0) {
    const last = heap.pop();
    if (last !== first) {
      heap[0] = last;
      siftDown(heap, last, 0);
    }
    return first;
  } else {
    return null;
  }
}
function siftUp(heap, node, i) {
  let index = i;
  while (true) {
    const parentIndex = index - 1 >>> 1;
    const parent = heap[parentIndex];
    if (parent !== void 0 && compare(parent, node) > 0) {
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      return;
    }
  }
}
function siftDown(heap, node, i) {
  let index = i;
  const length = heap.length;
  while (index < length) {
    const leftIndex = (index + 1) * 2 - 1;
    const left = heap[leftIndex];
    const rightIndex = leftIndex + 1;
    const right = heap[rightIndex];
    if (left !== void 0 && compare(left, node) < 0) {
      if (right !== void 0 && compare(right, left) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (right !== void 0 && compare(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      return;
    }
  }
}
function compare(a, b) {
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}
var getCurrentTime;
var hasPerformanceNow = typeof _global.performance === "object" && typeof _global.performance.now === "function";
if (hasPerformanceNow) {
  const localPerformance = _global.performance;
  getCurrentTime = () => localPerformance.now();
} else {
  const localDate = Date;
  const initialTime = localDate.now();
  getCurrentTime = () => localDate.now() - initialTime;
}
var maxSigned31BitInt = 1073741823;
var IMMEDIATE_PRIORITY_TIMEOUT = -1;
var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
var NORMAL_PRIORITY_TIMEOUT = 5e3;
var LOW_PRIORITY_TIMEOUT = 1e4;
var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;
var taskQueue = [];
var timerQueue = [];
var taskIdCounter = 1;
var currentTask = null;
var currentPriorityLevel = 3;
var isPerformingWork = false;
var isHostCallbackScheduled = false;
var isHostTimeoutScheduled = false;
var setTimeout = _global.setTimeout;
var clearTimeout = _global.clearTimeout;
var setImmediate = _global.setImmediate;
var messageChannel = _global.MessageChannel;
var isInputPending = typeof _global.navigator !== "undefined" && _global.navigator.scheduling !== void 0 && _global.navigator.scheduling.isInputPending !== void 0 ? _global.navigator.scheduling.isInputPending.bind(_global.navigator.scheduling) : null;
var defaultZone = {
  run: (fn) => fn()
};
function advanceTimers(currentTime) {
  let timer = peek(timerQueue);
  while (timer !== null) {
    if (timer.callback === null) {
      pop(timerQueue);
    } else if (timer.startTime <= currentTime) {
      pop(timerQueue);
      timer.sortIndex = timer.expirationTime;
      push(taskQueue, timer);
    } else {
      return;
    }
    timer = peek(timerQueue);
  }
}
function handleTimeout(currentTime) {
  isHostTimeoutScheduled = false;
  advanceTimers(currentTime);
  if (!isHostCallbackScheduled) {
    if (peek(taskQueue) !== null) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    } else {
      const firstTimer = peek(timerQueue);
      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
    }
  }
}
function flushWork(hasTimeRemaining, initialTime) {
  isHostCallbackScheduled = false;
  if (isHostTimeoutScheduled) {
    isHostTimeoutScheduled = false;
    cancelHostTimeout();
  }
  isPerformingWork = true;
  const previousPriorityLevel = currentPriorityLevel;
  try {
    return workLoop(hasTimeRemaining, initialTime);
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
  }
}
function workLoop(hasTimeRemaining, initialTime, _currentTask) {
  let currentTime = initialTime;
  if (_currentTask) {
    currentTask = _currentTask;
  } else {
    advanceTimers(currentTime);
    currentTask = peek(taskQueue);
  }
  let zoneChanged = false;
  const hitDeadline = () => currentTask && currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost());
  if (!hitDeadline()) {
    const ngZone = currentTask.ngZone || defaultZone;
    ngZone.run(() => {
      while (currentTask !== null && !zoneChanged) {
        if (hitDeadline()) {
          break;
        }
        const callback = currentTask.callback;
        if (typeof callback === "function") {
          currentTask.callback = null;
          currentPriorityLevel = currentTask.priorityLevel;
          const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
          const continuationCallback = callback(didUserCallbackTimeout);
          currentTime = getCurrentTime();
          if (typeof continuationCallback === "function") {
            currentTask.callback = continuationCallback;
          } else {
            if (currentTask === peek(taskQueue)) {
              pop(taskQueue);
            }
          }
          advanceTimers(currentTime);
        } else {
          pop(taskQueue);
        }
        currentTask = peek(taskQueue);
        zoneChanged = currentTask?.ngZone != null && currentTask.ngZone !== ngZone;
      }
    });
  }
  currentTask = currentTask ?? peek(taskQueue);
  currentTime = getCurrentTime();
  if (zoneChanged || currentTask && !hitDeadline()) {
    return workLoop(hasTimeRemaining, currentTime, currentTask);
  }
  if (currentTask !== null) {
    return true;
  } else {
    const firstTimer = peek(timerQueue);
    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
    return false;
  }
}
function scheduleCallback(priorityLevel, callback, options) {
  const currentTime = getCurrentTime();
  let startTime;
  if (typeof options === "object" && options !== null) {
    const delay = options.delay;
    if (typeof delay === "number" && delay > 0) {
      startTime = currentTime + delay;
    } else {
      startTime = currentTime;
    }
  } else {
    startTime = currentTime;
  }
  let timeout;
  switch (priorityLevel) {
    case 1:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
      break;
    case 2:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;
    case 5:
      timeout = IDLE_PRIORITY_TIMEOUT;
      break;
    case 4:
      timeout = LOW_PRIORITY_TIMEOUT;
      break;
    case 3:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }
  const expirationTime = startTime + timeout;
  const newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
    ngZone: options?.ngZone || null
  };
  if (startTime > currentTime) {
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      if (isHostTimeoutScheduled) {
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }
  return newTask;
}
function cancelCallback(task) {
  task.callback = null;
}
var isMessageLoopRunning = false;
var scheduledHostCallback = null;
var taskTimeoutID = -1;
var yieldInterval = 16;
var needsPaint = false;
var queueStartTime = -1;
function shouldYieldToHost() {
  if (needsPaint) {
    return true;
  }
  const timeElapsed = getCurrentTime() - queueStartTime;
  if (timeElapsed < yieldInterval) {
    return false;
  }
  return true;
}
function forceFrameRate(fps) {
  if (fps < 0 || fps > 125) {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported");
    }
    return;
  }
  if (fps > 0) {
    yieldInterval = Math.floor(1e3 / fps);
  } else {
    yieldInterval = 5;
  }
  yieldInterval = Math.max(5, yieldInterval - 6);
}
var performWorkUntilDeadline = () => {
  if (scheduledHostCallback !== null) {
    const currentTime = getCurrentTime();
    queueStartTime = currentTime;
    const hasTimeRemaining = true;
    let hasMoreWork = true;
    try {
      hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
    } finally {
      if (hasMoreWork) {
        schedulePerformWorkUntilDeadline();
      } else {
        isMessageLoopRunning = false;
        scheduledHostCallback = null;
      }
    }
  } else {
    isMessageLoopRunning = false;
  }
  needsPaint = false;
};
var schedulePerformWorkUntilDeadline;
if (typeof setImmediate === "function") {
  schedulePerformWorkUntilDeadline = () => {
    setImmediate(performWorkUntilDeadline);
  };
} else if (typeof messageChannel !== "undefined") {
  const channel = new messageChannel();
  const port = channel.port2;
  channel.port1.onmessage = performWorkUntilDeadline;
  schedulePerformWorkUntilDeadline = () => {
    port.postMessage(null);
  };
} else {
  schedulePerformWorkUntilDeadline = () => {
    setTimeout(performWorkUntilDeadline, 0);
  };
}
function requestHostCallback(callback) {
  scheduledHostCallback = callback;
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}
function requestHostTimeout(callback, ms) {
  taskTimeoutID = setTimeout(() => {
    callback(getCurrentTime());
  }, ms);
}
function cancelHostTimeout() {
  clearTimeout(taskTimeoutID);
  taskTimeoutID = -1;
}

// node_modules/@rx-angular/cdk/fesm2022/rx-angular-cdk-coalescing.mjs
var coalescingManager = createCoalesceManager();
function hasKey(ctx, property) {
  return ctx[property] != null;
}
function createPropertiesWeakMap(getDefaults) {
  const propertyMap = /* @__PURE__ */ new WeakMap();
  return {
    getProps: getProperties,
    setProps: setProperties
  };
  function getProperties(ctx) {
    const defaults = getDefaults(ctx);
    const propertiesPresent = propertyMap.get(ctx);
    let properties;
    if (propertiesPresent !== void 0) {
      properties = propertiesPresent;
    } else {
      properties = {};
      Object.entries(defaults).forEach(([prop, value]) => {
        if (hasKey(ctx, prop)) {
          properties[prop] = ctx[prop];
        } else {
          properties[prop] = value;
        }
      });
      propertyMap.set(ctx, properties);
    }
    return properties;
  }
  function setProperties(ctx, props) {
    const properties = getProperties(ctx);
    Object.entries(props).forEach(([prop, value]) => {
      properties[prop] = value;
    });
    propertyMap.set(ctx, properties);
    return properties;
  }
}
var coalescingContextPropertiesMap = createPropertiesWeakMap((ctx) => ({
  numCoalescingSubscribers: 0
}));
function createCoalesceManager() {
  return {
    remove: removeWork,
    add: addWork,
    isCoalescing
  };
  function removeWork(scope) {
    const numCoalescingSubscribers = coalescingContextPropertiesMap.getProps(scope).numCoalescingSubscribers - 1;
    coalescingContextPropertiesMap.setProps(scope, {
      numCoalescingSubscribers: numCoalescingSubscribers >= 0 ? numCoalescingSubscribers : 0
    });
  }
  function addWork(scope) {
    const numCoalescingSubscribers = coalescingContextPropertiesMap.getProps(scope).numCoalescingSubscribers + 1;
    coalescingContextPropertiesMap.setProps(scope, {
      numCoalescingSubscribers
    });
  }
  function isCoalescing(scope) {
    return coalescingContextPropertiesMap.getProps(scope).numCoalescingSubscribers > 0;
  }
}
function coalesceWith(durationSelector, scope) {
  const _scope = scope || {};
  return (source) => {
    return new Observable((observer) => {
      const rootSubscription = new Subscription();
      rootSubscription.add(source.subscribe(createInnerObserver(observer, rootSubscription)));
      return rootSubscription;
    });
    function createInnerObserver(outerObserver, rootSubscription) {
      let actionSubscription;
      let latestValue;
      const tryEmitLatestValue = () => {
        if (actionSubscription) {
          coalescingManager.remove(_scope);
          if (!coalescingManager.isCoalescing(_scope)) {
            outerObserver.next(latestValue);
          }
        }
      };
      return {
        complete: () => {
          tryEmitLatestValue();
          outerObserver.complete();
        },
        error: (error) => outerObserver.error(error),
        next: (value) => {
          latestValue = value;
          if (!actionSubscription) {
            coalescingManager.add(_scope);
            actionSubscription = durationSelector.subscribe({
              error: (error) => outerObserver.error(error),
              next: () => {
                tryEmitLatestValue();
                actionSubscription?.unsubscribe();
                actionSubscription = void 0;
              },
              complete: () => {
                tryEmitLatestValue();
                actionSubscription = void 0;
              }
            });
            rootSubscription.add(new Subscription(() => {
              tryEmitLatestValue();
              actionSubscription?.unsubscribe();
              actionSubscription = void 0;
            }));
          }
        }
      };
    }
  };
}

// node_modules/@rx-angular/cdk/fesm2022/cdk-internals-core.mjs
function getZoneUnPatchedApi(targetOrName, name) {
  if (typeof targetOrName === "string") {
    name = targetOrName;
    targetOrName = _global;
  }
  return targetOrName["__zone_symbol__" + String(name)] || targetOrName[name];
}
var resolvedPromise = getZoneUnPatchedApi("Promise").resolve();
var resolvedPromise$ = from(resolvedPromise);

// node_modules/@rx-angular/cdk/fesm2022/cdk-render-strategies.mjs
forceFrameRate(60);
var immediateStrategy = {
  name: "immediate",
  work: (cdRef) => cdRef.detectChanges(),
  behavior: ({
    work,
    scope,
    ngZone
  }) => {
    return (o$) => o$.pipe(scheduleOnQueue(work, {
      ngZone,
      priority: 1,
      scope
    }));
  }
};
var userBlockingStrategy = {
  name: "userBlocking",
  work: (cdRef) => cdRef.detectChanges(),
  behavior: ({
    work,
    scope,
    ngZone
  }) => {
    return (o$) => o$.pipe(scheduleOnQueue(work, {
      ngZone,
      priority: 2,
      scope
    }));
  }
};
var normalStrategy = {
  name: "normal",
  work: (cdRef) => cdRef.detectChanges(),
  behavior: ({
    work,
    scope,
    ngZone
  }) => {
    return (o$) => o$.pipe(scheduleOnQueue(work, {
      ngZone,
      priority: 3,
      scope
    }));
  }
};
var lowStrategy = {
  name: "low",
  work: (cdRef) => cdRef.detectChanges(),
  behavior: ({
    work,
    scope,
    ngZone
  }) => {
    return (o$) => o$.pipe(scheduleOnQueue(work, {
      ngZone,
      priority: 4,
      scope
    }));
  }
};
var idleStrategy = {
  name: "idle",
  work: (cdRef) => cdRef.detectChanges(),
  behavior: ({
    work,
    scope,
    ngZone
  }) => {
    return (o$) => o$.pipe(scheduleOnQueue(work, {
      ngZone,
      priority: 5,
      scope
    }));
  }
};
function scheduleOnQueue(work, options) {
  const scope = options.scope || {};
  return (o$) => o$.pipe(filter(() => !coalescingManager.isCoalescing(scope)), switchMap((v) => new Observable((subscriber) => {
    coalescingManager.add(scope);
    const task = scheduleCallback(options.priority, () => {
      work();
      coalescingManager.remove(scope);
      subscriber.next(v);
    }, {
      delay: options.delay,
      ngZone: options.ngZone
    });
    return () => {
      coalescingManager.remove(scope);
      cancelCallback(task);
    };
  }).pipe(mapTo(v))));
}
var RX_CONCURRENT_STRATEGIES = {
  immediate: immediateStrategy,
  userBlocking: userBlockingStrategy,
  normal: normalStrategy,
  low: lowStrategy,
  idle: idleStrategy
};
var animationFrameTick = () => new Observable((subscriber) => {
  const id = getZoneUnPatchedApi("requestAnimationFrame")(() => {
    subscriber.next(0);
    subscriber.complete();
  });
  return () => {
    getZoneUnPatchedApi("cancelAnimationFrame")(id);
  };
});
var localCredentials = {
  name: "local",
  work: (cdRef, _, notification) => {
    cdRef.detectChanges();
  },
  behavior: ({
    work,
    scope,
    ngZone
  }) => (o$) => o$.pipe(coalesceWith(animationFrameTick(), scope), tap(() => ngZone ? ngZone.run(() => work()) : work()))
};
var noopCredentials = {
  name: "noop",
  work: () => void 0,
  behavior: () => (o$) => o$
};
var nativeCredentials = {
  name: "native",
  work: (cdRef) => cdRef.markForCheck(),
  behavior: ({
    work,
    ngZone
  }) => (o$) => o$.pipe(tap(() => ngZone && !NgZone.isInAngularZone() ? ngZone.run(() => work()) : work()))
};
var RX_NATIVE_STRATEGIES = {
  native: nativeCredentials,
  noop: noopCredentials,
  local: localCredentials
};
var RX_RENDER_STRATEGIES_CONFIG = new InjectionToken("rxa-render-strategies-config");
var RX_RENDER_STRATEGIES_DEFAULTS = {
  primaryStrategy: "normal",
  customStrategies: __spreadValues(__spreadValues({}, RX_NATIVE_STRATEGIES), RX_CONCURRENT_STRATEGIES),
  patchZone: true,
  parent: true
};
function mergeDefaultConfig(cfg) {
  const custom = cfg ? cfg : {
    customStrategies: {}
  };
  return __spreadProps(__spreadValues(__spreadValues({}, RX_RENDER_STRATEGIES_DEFAULTS), custom), {
    customStrategies: __spreadValues(__spreadValues({}, custom.customStrategies), RX_RENDER_STRATEGIES_DEFAULTS.customStrategies)
  });
}
function onStrategy(value, strategy, workFactory, options = {}) {
  return new Observable((subscriber) => {
    subscriber.next(value);
  }).pipe(strategy.behavior({
    work: () => workFactory(value, strategy.work, options),
    scope: options.scope || {},
    ngZone: options.ngZone
  }), catchError((error) => throwError(() => [error, value])), map(() => value), take(1));
}
var RxStrategyProvider = class _RxStrategyProvider {
  _strategies$ = new BehaviorSubject(void 0);
  _primaryStrategy$ = new BehaviorSubject(void 0);
  _cfg;
  /**
   * @description
   * Returns current `RxAngularConfig` used in the service.
   * Config includes:
   * - strategy that currently in use - `primaryStrategy`
   * - array of custom user defined strategies - `customStrategies`
   * - setting that is responsible for running in our outside of the zone.js - `patchZone`
   */
  get config() {
    return this._cfg;
  }
  /**
   * @description
   * Returns object that contains key-value pairs of strategy names and their credentials (settings) that are available in the service.
   */
  get strategies() {
    return this._strategies$.getValue();
  }
  /**
   * @description
   * Returns an array of strategy names available in the service.
   */
  get strategyNames() {
    return Object.values(this.strategies).map((s) => s.name);
  }
  /**
   * @description
   * Returns current strategy of the service.
   */
  get primaryStrategy() {
    return this._primaryStrategy$.getValue().name;
  }
  /**
   * @description
   * Set's the strategy that will be used by the service.
   */
  set primaryStrategy(strategyName) {
    this._primaryStrategy$.next(this.strategies[strategyName]);
  }
  /**
   * @description
   * Current strategy of the service as an observable.
   */
  primaryStrategy$ = this._primaryStrategy$.asObservable();
  /**
   * @description
   * Returns observable of an object that contains key-value pairs of strategy names and their credentials (settings) that are available in the service.
   */
  strategies$ = this._strategies$.asObservable();
  /**
   * @description
   * Returns an observable of an array of strategy names available in the service.
   */
  strategyNames$ = this.strategies$.pipe(map((strategies) => Object.values(strategies).map((s) => s.name)), shareReplay({
    bufferSize: 1,
    refCount: true
  }));
  /**
   * @internal
   */
  constructor(cfg) {
    this._cfg = mergeDefaultConfig(cfg);
    this._strategies$.next(this._cfg.customStrategies);
    this.primaryStrategy = this.config.primaryStrategy;
  }
  /**
   * @description
   * Allows to schedule a work inside rxjs `pipe`. Accepts the work and configuration options object.
   * - work is any function that should be executed
   * - (optional) options includes strategy, patchZone and scope
   *
   * Scope is by default a subscription but you can also pass `this` and then the scope will be current component.
   * Scope setup is useful if your work is some of the methods of `ChangeDetectorRef`. Only one change detection will be triggered if you have multiple schedules of change detection methods and scope is set to `this`.
   *
   * @example
   * myObservable$.pipe(
   *    this.strategyProvider.scheduleWith(() => myWork(), {strategy: 'idle', patchZone: false})
   * ).subscribe();
   *
   * @return MonoTypeOperatorFunction<R>
   */
  scheduleWith(work, options) {
    const strategy = this.strategies[options?.strategy || this.primaryStrategy];
    const scope = options?.scope || {};
    const _work = getWork(work, options?.patchZone);
    const ngZone = options?.patchZone || void 0;
    return (o$) => o$.pipe(switchMap((v) => onStrategy(v, strategy, (_v) => {
      _work(_v);
    }, {
      scope,
      ngZone
    })));
  }
  /**
   * @description
   * Allows to schedule a work as an observable. Accepts the work and configuration options object.
   * - work is any function that should be executed
   * - (optional) options includes strategy, patchZone and scope
   *
   * Scope is by default a subscription but you can also pass `this` and then the scope will be current component.
   * Scope setup is especially useful if you provide work that will trigger a change detection.
   *
   * @example
   * this.strategyProvider.schedule(() => myWork(), {strategy: 'idle', patchZone: false}).subscribe();
   *
   * @return Observable<R>
   */
  schedule(work, options) {
    const strategy = this.strategies[options?.strategy || this.primaryStrategy];
    const scope = options?.scope || {};
    const _work = getWork(work, options?.patchZone);
    const ngZone = options?.patchZone || void 0;
    let returnVal;
    return onStrategy(null, strategy, () => {
      returnVal = _work();
    }, {
      scope,
      ngZone
    }).pipe(map(() => returnVal));
  }
  /**
   * @description
   * Allows to schedule a change detection cycle. Accepts the ChangeDetectorRef and configuration options object.
   * Options include:
   * - afterCD which is the work that should be executed after change detection cycle.
   * - abortCtrl is an AbortController that you can use to cancel the scheduled cycle.
   *
   * @example
   * this.strategyProvider.scheduleCd(this.changeDetectorRef, {afterCD: myWork()});
   *
   * @return AbortController
   */
  scheduleCD(cdRef, options) {
    const strategy = this.strategies[options?.strategy || this.primaryStrategy];
    const scope = options?.scope || cdRef;
    const abC = options?.abortCtrl || new AbortController();
    const ngZone = options?.patchZone || void 0;
    const work = getWork(() => {
      strategy.work(cdRef, scope);
      if (options?.afterCD) {
        options.afterCD();
      }
    }, options.patchZone);
    onStrategy(null, strategy, () => {
      work();
    }, {
      scope,
      ngZone
    }).pipe(takeUntil(fromEvent(abC.signal, "abort"))).subscribe();
    return abC;
  }
  /** @nocollapse */
  static ɵfac = function RxStrategyProvider_Factory(t) {
    return new (t || _RxStrategyProvider)(ɵɵinject(RX_RENDER_STRATEGIES_CONFIG, 8));
  };
  /** @nocollapse */
  static ɵprov = ɵɵdefineInjectable({
    token: _RxStrategyProvider,
    factory: _RxStrategyProvider.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(RxStrategyProvider, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [RX_RENDER_STRATEGIES_CONFIG]
    }]
  }], null);
})();
function getWork(work, patchZone) {
  let _work = work;
  if (patchZone) {
    _work = (args) => patchZone.run(() => work(args));
  }
  return _work;
}
function strategyHandling(defaultStrategyName, strategies) {
  const hotFlattened = coerceAllFactory(() => new ReplaySubject(1), switchAll());
  return {
    strategy$: hotFlattened.values$.pipe(startWith(defaultStrategyName), nameToStrategyCredentials(strategies, defaultStrategyName), share()),
    next(name) {
      hotFlattened.next(name);
    }
  };
}
function nameToStrategyCredentials(strategies, defaultStrategyName) {
  return (o$) => o$.pipe(map((name) => name && Object.keys(strategies).includes(name) ? strategies[name] : strategies[defaultStrategyName]));
}

// node_modules/@rx-angular/cdk/fesm2022/cdk-template.mjs
function createEmbeddedView(viewContainerRef, templateRef, context, index = 0) {
  const view = viewContainerRef.createEmbeddedView(templateRef, context, index);
  view.detectChanges();
  return view;
}
function notifyAllParentsIfNeeded(injectingViewCdRef, strategy, notifyNeeded, ngZone) {
  return (o$) => o$.pipe(switchMap((v) => {
    const notifyParent = notifyNeeded();
    if (!notifyParent) {
      return of(v);
    }
    return concat(of(v), onStrategy(injectingViewCdRef, strategy, (_v, work, options) => {
      work(injectingViewCdRef, options.scope);
    }, {
      scope: injectingViewCdRef.context || injectingViewCdRef,
      ngZone
    }).pipe(ignoreElements()));
  }));
}
var RxBaseTemplateNames;
(function(RxBaseTemplateNames2) {
  RxBaseTemplateNames2["error"] = "errorTpl";
  RxBaseTemplateNames2["complete"] = "completeTpl";
  RxBaseTemplateNames2["suspense"] = "suspenseTpl";
})(RxBaseTemplateNames || (RxBaseTemplateNames = {}));
function isRxRenderError(e) {
  return e != null && Array.isArray(e) && e.length === 2 && e[0] instanceof Error;
}
function createErrorHandler(_handler) {
  const _handleError = _handler ? (e) => _handler.handleError(e) : console.error;
  return {
    handleError: (error) => {
      if (isRxRenderError(error)) {
        _handleError(error[0]);
        console.error("additionalErrorContext", error[1]);
      } else {
        _handleError(error);
      }
    }
  };
}
function getTemplateHandler(templateSettings) {
  const { viewContainerRef, initialTemplateRef, createViewContext, updateViewContext } = templateSettings;
  return {
    updateUnchangedContext,
    insertView,
    moveView,
    removeView,
    getListChanges,
    updateView
  };
  function updateUnchangedContext(item, index, count) {
    const view = viewContainerRef.get(index);
    updateViewContext(item, view, {
      count,
      index
    });
    view.detectChanges();
  }
  function moveView(oldIndex, item, index, count) {
    const oldView = viewContainerRef.get(oldIndex);
    const view = viewContainerRef.move(oldView, index);
    updateViewContext(item, view, {
      count,
      index
    });
    view.detectChanges();
  }
  function updateView(item, index, count) {
    const view = viewContainerRef.get(index);
    updateViewContext(item, view, {
      count,
      index
    });
    view.detectChanges();
  }
  function removeView(index) {
    return viewContainerRef.remove(index);
  }
  function insertView(item, index, count) {
    createEmbeddedView(viewContainerRef, initialTemplateRef, createViewContext(item, {
      count,
      index
    }), index);
  }
}
function getListChanges(changes, items) {
  const changedIdxs = /* @__PURE__ */ new Set();
  const changesArr = [];
  let notifyParent = false;
  changes.forEachOperation((record, adjustedPreviousIndex, currentIndex) => {
    const item = record.item;
    if (record.previousIndex == null) {
      changesArr.push(getInsertChange(item, currentIndex === null ? void 0 : currentIndex));
      changedIdxs.add(item);
      notifyParent = true;
    } else if (currentIndex == null) {
      changesArr.push(getRemoveChange(item, adjustedPreviousIndex === null ? void 0 : adjustedPreviousIndex));
      notifyParent = true;
    } else if (adjustedPreviousIndex !== null) {
      changesArr.push(getMoveChange(item, currentIndex, adjustedPreviousIndex));
      changedIdxs.add(item);
      notifyParent = true;
    }
  });
  changes.forEachIdentityChange((record) => {
    const item = record.item;
    if (!changedIdxs.has(item)) {
      changesArr.push(getUpdateChange(item, record.currentIndex));
      changedIdxs.add(item);
    }
  });
  items.forEach((item, index) => {
    if (!changedIdxs.has(item)) {
      changesArr.push(getUnchangedChange(item, index));
    }
  });
  return [changesArr, notifyParent];
  function getMoveChange(item, currentIndex, adjustedPreviousIndex) {
    return [
      2,
      [item, currentIndex, adjustedPreviousIndex]
    ];
  }
  function getUpdateChange(item, currentIndex) {
    return [3, [item, currentIndex]];
  }
  function getUnchangedChange(item, index) {
    return [4, [item, index]];
  }
  function getInsertChange(item, currentIndex) {
    return [
      0,
      [item, currentIndex === null ? void 0 : currentIndex]
    ];
  }
  function getRemoveChange(item, adjustedPreviousIndex) {
    return [
      1,
      [
        item,
        adjustedPreviousIndex === null ? void 0 : adjustedPreviousIndex
      ]
    ];
  }
}
function createListTemplateManager(config) {
  const { templateSettings, renderSettings, trackBy, iterableDiffers } = config;
  const { defaultStrategyName, strategies, cdRef: injectingViewCdRef, patchZone, parent } = renderSettings;
  const errorHandler = createErrorHandler(renderSettings.errorHandler);
  const ngZone = patchZone ? patchZone : void 0;
  const strategyHandling$ = strategyHandling(defaultStrategyName, strategies);
  let _differ;
  function getDiffer(values) {
    if (_differ) {
      return _differ;
    }
    return values ? _differ = iterableDiffers.find(values).create(trackBy) : null;
  }
  const listViewHandler = getTemplateHandler(__spreadProps(__spreadValues({}, templateSettings), {
    initialTemplateRef: templateSettings.templateRef
  }));
  const viewContainerRef = templateSettings.viewContainerRef;
  let notifyParent = false;
  let changesArr;
  let partiallyFinished = false;
  return {
    nextStrategy(nextConfig) {
      strategyHandling$.next(nextConfig);
    },
    render(values$) {
      return values$.pipe(render());
    }
  };
  function handleError() {
    return (o$) => o$.pipe(catchError((err) => {
      partiallyFinished = false;
      errorHandler.handleError(err);
      return of(null);
    }));
  }
  function render() {
    return (o$) => combineLatest([
      o$,
      strategyHandling$.strategy$.pipe(distinctUntilChanged())
    ]).pipe(
      map(([iterable, strategy]) => {
        const differ = getDiffer(iterable);
        let changes;
        if (differ) {
          if (partiallyFinished) {
            const currentIterable = [];
            for (let i = 0, ilen = viewContainerRef.length; i < ilen; i++) {
              const viewRef = viewContainerRef.get(i);
              currentIterable[i] = viewRef.context.$implicit;
            }
            differ.diff(currentIterable);
          }
          changes = differ.diff(iterable);
        }
        return {
          changes,
          iterable,
          strategy
        };
      }),
      // Cancel old renders
      switchMap(({ changes, iterable, strategy }) => {
        if (!changes) {
          return of([]);
        }
        const values = iterable || [];
        const items = Array.isArray(values) ? values : Array.from(iterable);
        const listChanges = listViewHandler.getListChanges(changes, items);
        changesArr = listChanges[0];
        const insertedOrRemoved = listChanges[1];
        const applyChanges$ = getObservablesFromChangesArray(changesArr, strategy, items.length);
        partiallyFinished = true;
        notifyParent = insertedOrRemoved && parent;
        return combineLatest(applyChanges$.length > 0 ? applyChanges$ : [of(null)]).pipe(tap(() => partiallyFinished = false), notifyAllParentsIfNeeded(injectingViewCdRef, strategy, () => notifyParent, ngZone), handleError(), map(() => iterable));
      }),
      handleError()
    );
  }
  function getObservablesFromChangesArray(changes, strategy, count) {
    return changes.length > 0 ? changes.map((change) => {
      const payload = change[1];
      return onStrategy(change[0], strategy, (type) => {
        switch (type) {
          case 0:
            listViewHandler.insertView(payload[0], payload[1], count);
            break;
          case 2:
            listViewHandler.moveView(payload[2], payload[0], payload[1], count);
            break;
          case 1:
            listViewHandler.removeView(payload[1]);
            break;
          case 3:
            listViewHandler.updateView(payload[0], payload[1], count);
            break;
          case 4:
            listViewHandler.updateUnchangedContext(payload[0], payload[1], count);
            break;
        }
      }, { ngZone });
    }) : [of(null)];
  }
}
var computeFirst = ({ count, index }) => index === 0;
var computeLast = ({ count, index }) => index === count - 1;
var computeEven = ({ count, index }) => index % 2 === 0;
var RxDefaultListViewContext = class {
  _item = new ReplaySubject(1);
  item$ = this._item.asObservable();
  _$implicit;
  _$complete;
  _$error;
  _$suspense;
  _context$ = new BehaviorSubject({
    index: -1,
    count: -1
  });
  set $implicit($implicit) {
    this._$implicit = $implicit;
    this._item.next($implicit);
  }
  get $implicit() {
    return this._$implicit;
  }
  get $complete() {
    return this._$complete;
  }
  get $error() {
    return this._$error;
  }
  get $suspense() {
    return this._$suspense;
  }
  get index() {
    return this._context$.getValue().index;
  }
  get count() {
    return this._context$.getValue().count;
  }
  get first() {
    return computeFirst(this._context$.getValue());
  }
  get last() {
    return computeLast(this._context$.getValue());
  }
  get even() {
    return computeEven(this._context$.getValue());
  }
  get odd() {
    return !this.even;
  }
  get index$() {
    return this._context$.pipe(map((c) => c.index), distinctUntilChanged());
  }
  get count$() {
    return this._context$.pipe(map((s) => s.count), distinctUntilChanged());
  }
  get first$() {
    return this._context$.pipe(map(computeFirst), distinctUntilChanged());
  }
  get last$() {
    return this._context$.pipe(map(computeLast), distinctUntilChanged());
  }
  get even$() {
    return this._context$.pipe(map(computeEven), distinctUntilChanged());
  }
  get odd$() {
    return this.even$.pipe(map((even) => !even));
  }
  constructor(item, customProps) {
    this.$implicit = item;
    if (customProps) {
      this.updateContext(customProps);
    }
  }
  updateContext(newProps) {
    this._context$.next(__spreadValues(__spreadValues({}, this._context$.getValue()), newProps));
  }
  select = (props) => {
    return this.item$.pipe(map((r) => props.reduce((acc, key) => acc?.[key], r)));
  };
};

// node_modules/@rx-angular/template/fesm2022/template-for.mjs
var RxForViewContext = class extends RxDefaultListViewContext {
  rxForOf;
  constructor(item, rxForOf, customProps) {
    super(item, customProps);
    this.rxForOf = rxForOf;
  }
};
var RxFor = class _RxFor {
  /** @internal */
  iterableDiffers = inject(IterableDiffers);
  /** @internal */
  cdRef = inject(ChangeDetectorRef);
  /** @internal */
  ngZone = inject(NgZone);
  /** @internal */
  templateRef = inject(TemplateRef);
  /** @internal */
  viewContainerRef = inject(ViewContainerRef);
  /** @internal */
  strategyProvider = inject(RxStrategyProvider);
  /** @internal */
  errorHandler = inject(ErrorHandler);
  /** @internal */
  staticValue;
  /** @internal */
  renderStatic = false;
  /**
   * @description
   * The iterable input
   *
   * @example
   * <ng-container *rxFor="heroes$; let hero">
   *   <app-hero [hero]="hero"></app-hero>
   * </ng-container>
   *
   * @param { Observable<(U & NgIterable<T>) | undefined | null>
   *       | (U & NgIterable<T>)
   *       | null
   *       | undefined } potentialObservable
   */
  set rxForOf(potentialObservable) {
    if (!isObservable(potentialObservable)) {
      this.staticValue = potentialObservable;
      this.renderStatic = true;
    } else {
      this.staticValue = void 0;
      this.renderStatic = false;
      this.observables$.next(potentialObservable);
    }
  }
  /**
   * @internal
   * A reference to the template that is created for each item in the iterable.
   * @see [template reference variable](guide/template-reference-variables)
   * (inspired by @angular/common `ng_for_of.ts`)
   */
  _template;
  set rxForTemplate(value) {
    this._template = value;
  }
  /**
   * @description
   *
   * You can change the used `RenderStrategy` by using the `strategy` input of the `*rxFor`. It accepts
   * an `Observable<RxStrategyNames>` or [`RxStrategyNames`](https://github.com/rx-angular/rx-angular/blob/b0630f69017cc1871d093e976006066d5f2005b9/libs/cdk/render-strategies/src/lib/model.ts#L52).
   *
   * The default value for strategy is
   * [`normal`](https://www.rx-angular.io/docs/template/cdk/render-strategies/strategies/concurrent-strategies).
   *
   * Read more about this in the
   * [official docs](https://www.rx-angular.io/docs/template/api/rx-for-directive#use-render-strategies-strategy).
   *
   * @example
   *
   * \@Component({
   *   selector: 'app-root',
   *   template: `
   *     <ng-container *rxFor="let hero of heroes$; strategy: strategy">
   *       <app-hero [hero]="hero"></app-hero>
   *     </ng-container>
   *
   *     <ng-container *rxFor="let hero of heroes$; strategy: strategy$">
   *       <app-hero [hero]="hero"></app-hero>
   *     </ng-container>
   *   `
   * })
   * export class AppComponent {
   *   strategy = 'low';
   *   strategy$ = of('immediate');
   * }
   *
   * @param {string | Observable<string> | undefined} strategyName
   * @see {@link strategies}
   */
  set rxForStrategy(strategyName) {
    this.strategyInput$.next(strategyName);
  }
  /**
   * @description
   *
   * When local rendering strategies are used, we need to treat view and content queries in a
   * special way.
   * To make `*rxFor` in such situations, a certain mechanism is implemented to
   * execute change detection on the parent (`parent`).
   *
   * This is required if your components state is dependent on its view or content children:
   *
   * - `@ViewChild`
   * - `@ViewChildren`
   * - `@ContentChild`
   * - `@ContentChildren`
   *
   * Read more about this in the
   * [official docs](https://www.rx-angular.io/docs/template/api/rx-for-directive#local-strategies-and-view-content-queries-parent).
   *
   * @example
   * \@Component({
   *   selector: 'app-root',
   *   template: `
   *    <app-list-component>
   *      <app-list-item
   *        *rxFor="
   *          let item of items$;
   *          trackBy: trackItem;
   *          parent: true;
   *        "
   *      >
   *        <div>{{ item.name }}</div>
   *      </app-list-item>
   *    </app-list-component>
   *   `
   * })
   * export class AppComponent {
   *   items$ = itemService.getItems();
   * }
   *
   * @param {boolean} renderParent
   */
  renderParent = this.strategyProvider.config.parent;
  /**
   * @description
   *
   * A flag to control whether *rxFor templates are created within `NgZone` or not.
   * The default value is `true, `*rxFor` will create it's `EmbeddedViews` inside `NgZone`.
   *
   * Event listeners normally trigger zone. Especially high frequently events cause performance issues.
   *
   * Read more about this in the
   * [official docs](https://www.rx-angular.io/docs/template/api/rx-for-directive#working-with-event-listeners-patchzone).
   *
   * @example
   * \@Component({
   *   selector: 'app-root',
   *   template: `
   *    <app-list-component>
   *      <app-list-item
   *        *rxFor="
   *          let item of items$;
   *          trackBy: trackItem;
   *          patchZone: false;
   *        "
   *      >
   *        <div>{{ item.name }}</div>
   *      </app-list-item>
   *    </app-list-component>
   *   `
   * })
   * export class AppComponent {
   *   items$ = itemService.getItems();
   * }
   *
   * @param {boolean} patchZone
   */
  patchZone = this.strategyProvider.config.patchZone;
  /**
   * @description
   * A function or key that defines how to track changes for items in the iterable.
   *
   * When items are added, moved, or removed in the iterable,
   * the directive must re-render the appropriate DOM nodes.
   * To minimize churn in the DOM, only nodes that have changed
   * are re-rendered.
   *
   * By default, rxFor assumes that the object instance identifies the node in the iterable (equality check `===`).
   * When a function or key is supplied, rxFor uses the result to identify the item node.
   *
   * @example
   * \@Component({
   *   selector: 'app-root',
   *   template: `
   *    <app-list-component>
   *      <app-list-item
   *        *rxFor="
   *          let item of items$;
   *          trackBy: 'id';
   *        "
   *      >
   *        <div>{{ item.name }}</div>
   *      </app-list-item>
   *    </app-list-component>
   *   `
   * })
   * export class AppComponent {
   *   items$ = itemService.getItems();
   * }
   *
   * // OR
   *
   * \@Component({
   *   selector: 'app-root',
   *   template: `
   *    <app-list-component>
   *      <app-list-item
   *        *rxFor="
   *          let item of items$;
   *          trackBy: trackItem;
   *        "
   *      >
   *        <div>{{ item.name }}</div>
   *      </app-list-item>
   *    </app-list-component>
   *   `
   * })
   * export class AppComponent {
   *   items$ = itemService.getItems();
   *   trackItem = (idx, item) => item.id;
   * }
   *
   * @param trackByFnOrKey
   */
  set trackBy(trackByFnOrKey) {
    if ((typeof ngDevMode === "undefined" || ngDevMode) && trackByFnOrKey != null && typeof trackByFnOrKey !== "string" && typeof trackByFnOrKey !== "function") {
      console.warn(`trackBy must be a function, but received ${JSON.stringify(trackByFnOrKey)}.`);
    }
    if (trackByFnOrKey == null) {
      this._trackBy = null;
    } else {
      this._trackBy = typeof trackByFnOrKey !== "function" ? (i, a) => a[trackByFnOrKey] : trackByFnOrKey;
    }
  }
  /**
   * @description
   * A `Subject` which emits whenever *rxFor finished rendering a set changes to the view.
   * This enables developers to perform actions when a list has finished rendering.
   * The `renderCallback` is useful in situations where you rely on specific DOM properties like the `height` a
   * table after all items got rendered.
   * It is also possible to use the renderCallback in order to determine if a view should be visible or not. This
   * way developers can hide a list as long as it has not finished rendering.
   *
   * The result of the `renderCallback` will contain the currently rendered set of items in the iterable.
   *
   * @example
   * \Component({
   *   selector: 'app-root',
   *   template: `
   *   <app-list-component>
   *     <app-list-item
   *       *rxFor="
   *         let item of items$;
   *         trackBy: trackItem;
   *         renderCallback: itemsRendered;
   *       ">
   *       <div>{{ item.name }}</div>
   *     </app-list-item>
   *   </app-list-component>
   * `
   * })
   * export class AppComponent {
   *   items$: Observable<Item[]> = itemService.getItems();
   *   trackItem = (idx, item) => item.id;
   *   // this emits whenever rxFor finished rendering changes
   *   itemsRendered = new Subject<Item[]>();
   *
   *   constructor(elementRef: ElementRef<HTMLElement>) {
   *     itemsRendered.subscribe(() => {
   *       // items are rendered, we can now scroll
   *       elementRef.scrollTo({bottom: 0});
   *     })
   *   }
   * }
   *
   * @param {Subject<U>} renderCallback
   */
  set renderCallback(renderCallback) {
    this._renderCallback = renderCallback;
  }
  get template() {
    return this._template || this.templateRef;
  }
  /** @internal */
  strategyInput$ = new ReplaySubject(1);
  /** @internal */
  observables$ = new ReplaySubject(1);
  /** @internal */
  _renderCallback;
  /** @internal */
  values$ = this.observables$.pipe(coerceObservableWith(), switchAll(), shareReplay({
    refCount: true,
    bufferSize: 1
  }));
  /** @internal */
  values = null;
  /** @internal */
  strategy$ = this.strategyInput$.pipe(coerceDistinctWith());
  /** @internal */
  listManager;
  /** @internal */
  _subscription = new Subscription();
  /** @internal */
  _trackBy;
  /** @internal */
  _distinctBy = (a, b) => a === b;
  /** @internal */
  ngOnInit() {
    this._subscription.add(this.values$.subscribe((v) => this.values = v));
    this.listManager = createListTemplateManager({
      iterableDiffers: this.iterableDiffers,
      renderSettings: {
        cdRef: this.cdRef,
        strategies: this.strategyProvider.strategies,
        defaultStrategyName: this.strategyProvider.primaryStrategy,
        parent: !!this.renderParent,
        patchZone: this.patchZone ? this.ngZone : false,
        errorHandler: this.errorHandler
      },
      templateSettings: {
        viewContainerRef: this.viewContainerRef,
        templateRef: this.template,
        createViewContext: this.createViewContext.bind(this),
        updateViewContext: this.updateViewContext.bind(this)
      },
      trackBy: this._trackBy
    });
    this.listManager.nextStrategy(this.strategy$);
    this._subscription.add(this.listManager.render(this.values$).subscribe((v) => this._renderCallback?.next(v)));
  }
  /** @internal */
  createViewContext(item, computedContext) {
    return new RxForViewContext(item, this.values, computedContext);
  }
  /** @internal */
  updateViewContext(item, view, computedContext) {
    view.context.updateContext(computedContext);
    view.context.rxForOf = this.values;
    view.context.$implicit = item;
  }
  /** @internal */
  ngDoCheck() {
    if (this.renderStatic) {
      this.observables$.next(this.staticValue);
    }
  }
  /** @internal */
  ngOnDestroy() {
    this._subscription.unsubscribe();
    this.viewContainerRef.clear();
  }
  /** @internal */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  static ngTemplateContextGuard(dir, ctx) {
    return true;
  }
  /** @nocollapse */
  static ɵfac = function RxFor_Factory(t) {
    return new (t || _RxFor)();
  };
  /** @nocollapse */
  static ɵdir = ɵɵdefineDirective({
    type: _RxFor,
    selectors: [["", "rxFor", "", "rxForOf", ""]],
    inputs: {
      rxForOf: "rxForOf",
      rxForTemplate: "rxForTemplate",
      rxForStrategy: "rxForStrategy",
      renderParent: ["rxForParent", "renderParent"],
      patchZone: ["rxForPatchZone", "patchZone"],
      trackBy: ["rxForTrackBy", "trackBy"],
      renderCallback: ["rxForRenderCallback", "renderCallback"]
    },
    standalone: true
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(RxFor, [{
    type: Directive,
    args: [{
      selector: "[rxFor][rxForOf]",
      standalone: true
    }]
  }], null, {
    rxForOf: [{
      type: Input
    }],
    rxForTemplate: [{
      type: Input
    }],
    rxForStrategy: [{
      type: Input
    }],
    renderParent: [{
      type: Input,
      args: ["rxForParent"]
    }],
    patchZone: [{
      type: Input,
      args: ["rxForPatchZone"]
    }],
    trackBy: [{
      type: Input,
      args: ["rxForTrackBy"]
    }],
    renderCallback: [{
      type: Input,
      args: ["rxForRenderCallback"]
    }]
  });
})();
export {
  RxFor,
  RxForViewContext
};
//# sourceMappingURL=@rx-angular_template_for.js.map
