define('bundle', ['exports'], (function (exports) { 'use strict';

    // TODO @cleanup merge with unwrapArray
    function toArray(objOrArray) {
      if (objOrArray == null) {
        return [];
      }
      return Array.isArray(objOrArray) ? objOrArray : [objOrArray];
    }
    function unwrapElementPlain(element) {
      if (element == null || element === false) {
        return undefined;
      }
      return element;
    }
    function unwrapElementWithFunc(element) {
      while (isFunction(element)) {
        element = element();
      }
      return unwrapElementPlain(element);
    }
    function unwrapArray(elements, unwrapFunc = unwrapElementPlain) {
      if (elements == null || elements === false) {
        return [];
      }
      if (!Array.isArray(elements)) {
        // Convert to an array
        if (elements[Symbol.iterator] && !isString(elements)) {
          elements = Array.from(elements);
        } else {
          elements = [elements];
        }
      }
      let result = [];
      for (const rawElement of elements) {
        if (rawElement == null) {
          continue;
        }
        const element = Array.isArray(rawElement) ? rawElement : unwrapFunc(rawElement); // First unwrap the element
        if (element == null) {
          continue;
        }
        if (Array.isArray(element)) {
          const subelements = unwrapArray(element, unwrapFunc);
          for (const subelement of subelements) {
            result.push(subelement);
          }
        } else {
          result.push(element);
        }
      }
      let sameAsInput = result.length === elements.length;
      for (let index = 0; sameAsInput && index < result.length; index += 1) {
        if (result[index] !== elements[index]) {
          sameAsInput = false;
        }
      }
      return sameAsInput ? elements : result;
    }
    function areSetsEqual(a, b) {
      if (a.size !== b.size) {
        return false;
      }
      for (const element of a) {
        if (!b.has(element)) {
          return false;
        }
      }
      return true;
    }
    function isLocalUrl(url, host = self.location.host, origin = self.location.origin) {
      // Empty url is considered local
      if (!url) {
        return true;
      }
      // Protocol-relative url is local if the host matches
      if (url.startsWith("//")) {
        return url.startsWith("//" + host);
      }
      // Absolute url is local if the origin matches
      let r = new RegExp("^(?:[a-z]+:)?//", "i");
      if (r.test(url)) {
        return url.startsWith(origin);
      }
      // Root-relative and document-relative urls are always local
      return true;
    }
    // Trims a local url to root-relative or document-relative url.
    // If the url is protocol-relative, removes the starting "//"+host, transforming it in a root-relative url.
    // If the url is absolute, removes the origin, transforming it in a root-relative url.
    // If the url is root-relative or document-relative, leaves it as is.
    function trimLocalUrl(url, host = self.location.host, origin = self.location.origin) {
      if (!isLocalUrl(url, host, origin)) {
        throw new Error("Trying to trim non-local url!");
      }
      if (!url) {
        return url;
      }
      if (url.startsWith("//" + host)) {
        return url.slice(("//" + host).length);
      }
      if (url.startsWith(origin)) {
        return url.slice(origin.length);
      }
      return url;
    }
    // Split the passed in array into arrays with at most maxChunkSize elements
    function splitInChunks(array, maxChunkSize) {
      let chunks = [];
      while (array.length > 0) {
        chunks.push(array.splice(0, maxChunkSize));
      }
      return chunks;
    }
    function defaultComparator(a, b) {
      if (a == null && b == null) {
        return 0;
      }
      if (b == null) {
        return 1;
      }
      if (a == null) {
        return -1;
      }
      // TODO: might want to use valueof here
      if (isNumber(a) && isNumber(b)) {
        return a - b;
      }
      let aStr = a.toString();
      let bStr = b.toString();
      if (aStr === bStr) {
        return 0;
      }
      return aStr < bStr ? -1 : 1;
    }
    function slugify(string) {
      string = string.trim();
      string = string.replace(/[^a-zA-Z0-9-\s]/g, ""); // remove anything non-latin alphanumeric
      string = string.replace(/\s+/g, "-"); // replace whitespace with dashes
      string = string.replace(/-{2,}/g, "-"); // remove consecutive dashes
      string = string.toLowerCase();
      return string;
    }
    // If the first argument is a number, it's returned concatenated with the suffix, otherwise it's returned unchanged
    function suffixNumber(value, suffix) {
      return isNumber(value) ? value + suffix : value;
    }
    function capitalize(text) {
      return text && text.charAt(0).toUpperCase() + text.slice(1);
    }
    function setObjectPrototype(obj, Class) {
      obj.__proto__ = Class.prototype;
      return obj;
    }
    function isNotNull(obj) {
      return obj != null;
    }
    function isNotNullOrFalse(obj) {
      return obj !== null && obj !== false;
    }
    function isFunction(obj) {
      return typeof obj === "function";
    }
    function isNumber(obj) {
      return typeof obj === "number" || obj instanceof Number;
    }
    function isString(obj) {
      return typeof obj === "string" || obj instanceof String;
    }
    function isNumericString(str, acceptPadding = false) {
      if (!isString(str)) {
        return false;
      }
      if (!acceptPadding && str.trim() !== str) {
        return false;
      }
      // Both of these are needed to cover all cases
      return !isNaN(str) && !isNaN(parseFloat(str));
    }
    function isPlainObject(obj) {
      if (!obj || typeof obj !== "object") {
        return false;
      }
      if (obj.constructor && obj.constructor != Object) {
        return false;
      }
      return true;
    }
    function FILTER_NULLS(key, value) {
      return value != null;
    }
    function FILTER_NULLS_AND_EMPTY_STR(key, value) {
      return value != null && value !== "";
    }
    function cleanObject(obj, options = {}) {
      const {
        skipEmptyString = true,
        filterFunc = null,
        emptyAsNull = false
      } = options;
      const cleanedObject = {};
      const filterFunction = filterFunc || (skipEmptyString ? FILTER_NULLS_AND_EMPTY_STR : FILTER_NULLS);
      for (const [key, value] of Object.entries(obj)) {
        if (filterFunction(key, value)) {
          cleanedObject[key] = value;
        }
      }
      if (emptyAsNull && Object.keys(cleanedObject).length === 0) {
        return null;
      }
      return cleanedObject;
    }
    function deepCopy(...sources) {
      let target = sources[0] || {};
      // Handle case when target is a string or something (possible in deep copy)
      if (typeof target !== "object" && typeof target !== "function") {
        target = {};
      }
      for (let i = 1; i < sources.length; i += 1) {
        let obj = sources[i];
        if (obj == null) {
          continue;
        }
        // Extend the base object
        for (let [key, value] of Object.entries(obj)) {
          // Recurse if we're merging plain objects or arrays
          if (value && isPlainObject(value) || Array.isArray(value)) {
            let clone;
            let src = target[key];
            if (Array.isArray(value)) {
              clone = src && Array.isArray(src) ? src : [];
            } else {
              clone = src && isPlainObject(src) ? src : {};
            }
            target[key] = deepCopy(clone, value);
          } else {
            // TODO: if value has .clone() method, use that?
            target[key] = value;
          }
        }
      }
      return target;
    }
    function dashCase(str) {
      let rez = "";
      for (let i = 0; i < str.length; i++) {
        if ("A" <= str[i] && str[i] <= "Z") {
          if (i > 0) {
            rez += "-";
          }
          rez += str[i].toLowerCase();
        } else {
          rez += str[i];
        }
      }
      return rez == str ? str : rez;
    }
    // TODO: have a Cookie helper file
    function getCookie(name) {
      let cookies = (document.cookie || "").split(";");
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + "=")) {
          return cookie.substring(name.length + 1);
        }
      }
      return "";
    }
    function uniqueId(obj) {
      if (!uniqueId.objectWeakMap) {
        uniqueId.objectWeakMap = new WeakMap();
        uniqueId.constructorWeakMap = new WeakMap();
        uniqueId.totalObjectCount = 0;
      }
      let objectWeakMap = uniqueId.objectWeakMap;
      let constructorWeakMap = uniqueId.constructorWeakMap;
      if (!objectWeakMap.has(obj)) {
        const objConstructor = obj.constructor || obj.__proto__ || Object;
        // Increment the object count
        const objIndex = (constructorWeakMap.get(objConstructor) || 0) + 1;
        constructorWeakMap.set(objConstructor, objIndex);
        const objUniqueId = objIndex + "-" + ++uniqueId.totalObjectCount;
        objectWeakMap.set(obj, objUniqueId);
      }
      return objectWeakMap.get(obj);
    }
    // args[0] is a string where the "%[number]" block will be replaced by the args[number]
    function evaluateSprintf(...args) {
      let str = args[0];
      for (let index = 1; index < args.length; index += 1) {
        str = str.replaceAll("%" + index, args[index]);
      }
      return str;
    }
    // TODO: should be done with String.padLeft
    function padNumber(num, minLength) {
      let strNum = String(num);
      while (strNum.length < minLength) {
        strNum = "0" + strNum;
      }
      return strNum;
    }
    // Returns the english ordinal suffix of a number
    function getOrdinalSuffix(num) {
      let suffixes = ["th", "st", "nd", "rd"];
      let lastDigit = num % 10;
      let isTeen = Math.floor(num / 10) % 10 === 1;
      return !isTeen && suffixes[lastDigit] || suffixes[0];
    }
    function suffixWithOrdinal(num) {
      return num + getOrdinalSuffix(num);
    }
    // Erase the first instance of the value from the given array. In-place, returns the array
    function eraseFirst(array, value) {
      const index = array.indexOf(value);
      if (index >= 0) {
        array.splice(index, 1);
      }
      return array;
    }
    const UNICODE_BOM_CHARACTER = 0xFEFF;
    const NOOP_FUNCTION = () => undefined;
    function isFirefox() {
      return (navigator.userAgent.indexOf("Firefox") !== -1 || navigator.userAgent.indexOf("FxiOS") !== -1) && navigator.userAgent.indexOf("Chrome") === -1;
    }
    function isSafari() {
      let firefox = isFirefox();
      let safari = navigator.userAgent.indexOf("Safari") > -1;
      let chrome = navigator.userAgent.indexOf("Chrome") > -1;
      if (chrome || firefox) {
        safari = false;
      }
      return safari;
    }
    // Used so that a value or a function can be used anywhere
    // If the value is a function, it will call it at most maxIter (default 32) times
    function resolveFuncValue(value, options = {}) {
      const {
        maxIter = 32,
        args = null,
        allowUnresolved = false
      } = options;
      let currentValue = value;
      let iterations = maxIter;
      while (iterations > 0 && isFunction(currentValue)) {
        currentValue = currentValue(...(args || []));
        iterations -= 1;
      }
      if (!allowUnresolved && iterations === 0) {
        console.error("Failed to resolve value to a non-function");
      }
      return currentValue;
    }

    function implementsRemoveHandle(job) {
      return "remove" in job && isFunction(job.remove);
    }
    function implementsCleanupHandle(job) {
      return "cleanup" in job && isFunction(job.cleanup);
    }
    class DispatcherHandle {
      constructor(dispatcher, callback) {
        this.dispatcher = void 0;
        this.callback = void 0;
        this.dispatcher = dispatcher;
        this.callback = callback;
      }
      remove() {
        if (!this.dispatcher) {
          console.warn("Removing a dispatcher twice");
          return;
        }
        this.dispatcher.removeListener(this.callback);
        this.dispatcher = undefined;
        this.callback = undefined;
      }
      cleanup() {
        this.remove();
      }
    }
    class Dispatcher {
      constructor(options = {}) {
        this.options = void 0;
        this.listeners = void 0;
        this.options = options;
        this.listeners = [];
      }
      callbackExists(callback) {
        for (let i = 0; i < this.listeners.length; i += 1) {
          if (this.listeners[i] === callback) {
            return true;
          }
        }
        return false;
      }
      addListener(callback) {
        if (!(typeof callback === "function")) {
          console.error("The listener needs to be a function: ", callback);
          return;
        }
        if (this.callbackExists(callback)) {
          console.error("Can't re-register for the same callback: ", this, " ", callback);
          return;
        }
        this.listeners.push(callback);
        return new DispatcherHandle(this, callback);
      }
      addListenerOnce(callback) {
        let handler = this.addListener(function (...args) {
          callback(...args);
          handler.remove();
        });
        return handler;
      }
      async awaitOnce() {
        return new Promise(resolve => {
          this.addListenerOnce((...args) => {
            // @ts-ignore
            resolve(...args);
          });
        });
      }
      removeListener(callback) {
        for (let i = 0; i < this.listeners.length; i += 1) {
          if (this.listeners[i] === callback) {
            // Erase and return
            return this.listeners.splice(i, 1)[0];
          }
        }
      }
      removeAllListeners() {
        this.listeners = [];
      }
      dispatch(...args) {
        for (let i = 0; i < this.listeners.length;) {
          let listener = this.listeners[i];
          listener(...args);
          // In case the current listener deleted itself, keep the loop counter the same
          // If it deleted listeners that were executed before it, that's just wrong and there are no guaranteed about
          if (listener === this.listeners[i]) {
            i++;
          }
        }
      }
    }
    const DispatchersSymbol = Symbol("Dispatchers");
    const CleanupJobsSymbol = Symbol("CleanupJobs");
    class Dispatchable {
      get dispatchers() {
        return this[DispatchersSymbol] || (this[DispatchersSymbol] = new Map());
      }
      get cleanupJobs() {
        return this[CleanupJobsSymbol] || (this[CleanupJobsSymbol] = new CleanupJobs());
      }
      getDispatcher(name, addIfMissing = true) {
        let dispatcher = this.dispatchers.get(name);
        if (!dispatcher && addIfMissing) {
          dispatcher = new Dispatcher();
          this.dispatchers.set(name, dispatcher);
        }
        return dispatcher;
      }
      dispatch(name, ...args) {
        let dispatcher = this.getDispatcher(name, false);
        if (dispatcher) {
          dispatcher.dispatch(...args);
        }
      }
      addListenerGeneric(methodName, name, callback) {
        if (Array.isArray(name)) {
          return new CleanupJobs(name.map(x => this[methodName](x, callback)));
        }
        return this.getDispatcher(name)?.[methodName](callback);
      }
      addListener(name, callback) {
        return this.addListenerGeneric("addListener", name, callback);
      }
      addListenerOnce(name, callback) {
        return this.addListenerGeneric("addListenerOnce", name, callback);
      }
      removeListener(name, callback) {
        const dispatcher = this.getDispatcher(name, false);
        dispatcher?.removeListener(callback);
      }
      removeAllListeners(name) {
        const dispatcher = this.getDispatcher(name, false);
        dispatcher?.removeAllListeners();
      }
      cleanup() {
        this.runCleanupJobs();
        delete this[DispatchersSymbol];
      }
      // These function don't really belong here, but they don't really hurt here and I don't want a long proto chain
      // Add anything that needs to be called on cleanup here (dispatchers, etc)
      addCleanupJob(cleanupJob) {
        this.cleanupJobs.add(cleanupJob);
        return cleanupJob;
      }
      runCleanupJobs() {
        this.cleanupJobs?.cleanup();
      }
      detachListener(dispatcherHandle) {
        if (this[CleanupJobsSymbol]) {
          this[CleanupJobsSymbol].remove(dispatcherHandle);
        } else {
          dispatcherHandle.remove();
        }
      }
      attachTimeout(callback, timeout) {
        // TODO when the timeout executes, it doesn't get cleared from the cleanup jobs and would leak
        const timeoutId = setTimeout(callback, timeout);
        this.addCleanupJob(() => clearTimeout(timeoutId));
        return timeoutId;
      }
      attachInterval(callback, timeout) {
        const intervalId = setInterval(callback, timeout);
        this.addCleanupJob(() => clearInterval(intervalId));
        return intervalId;
      }
      attachAnimationFrame(callback) {
        const animationId = requestAnimationFrame(callback);
        this.addCleanupJob(() => cancelAnimationFrame(animationId));
        return animationId;
      }
      // TODO @Mihai when can this return an undefined? Shouldn't be possible
      addChangeListener(callback) {
        return this.addListener("change", callback);
      }
      dispatchChange(...args) {
        this.dispatch("change", ...args, this);
      }
    }
    // Creates a method that calls the method methodName on obj, and adds the result as a cleanup task
    function getAttachCleanupJobMethod(methodName) {
      let addMethodName = "add" + methodName;
      let removeMethodName = "remove" + methodName;
      return function (obj, ...args) {
        let handler = obj[addMethodName](...args);
        // TODO: This should be changed. It is bad to receive 2 different types of handlers.
        if (!handler) {
          handler = () => {
            obj[removeMethodName](...args);
          };
        }
        this.addCleanupJob(handler);
        return handler;
      };
    }
    // TODO maybe this can be handle better through a Proxy?
    // Not sure if these should be added like this, but meh
    Dispatchable.prototype.attachListener = getAttachCleanupJobMethod("Listener");
    Dispatchable.prototype.attachEventListener = getAttachCleanupJobMethod("EventListener");
    Dispatchable.prototype.attachCreateListener = getAttachCleanupJobMethod("CreateListener");
    Dispatchable.prototype.attachDeleteListener = getAttachCleanupJobMethod("DeleteListener");
    Dispatchable.prototype.attachChangeListener = getAttachCleanupJobMethod("ChangeListener");
    Dispatchable.prototype.attachListenerOnce = getAttachCleanupJobMethod("ListenerOnce");
    Dispatcher.Global = new Dispatchable();
    class OncePerTickRunner {
      constructor(callback) {
        this.callback = void 0;
        this.throttle = void 0;
        this.callback = callback;
        this.throttle = new WeakMap();
      }
      maybeEnqueue(obj, ...args) {
        const existingArgs = this.throttle.get(obj);
        this.throttle.set(obj, args);
        if (existingArgs) {
          // We just updated the args
          return false;
        }
        queueMicrotask(() => {
          const existingArgs = this.throttle.get(obj);
          if (!existingArgs) {
            // We have been canceled
            return;
          }
          this.clear(obj);
          this.callback(obj, ...existingArgs);
        });
        return true;
      }
      clear(obj) {
        this.throttle.delete(obj);
      }
    }
    class CleanupJobs {
      constructor(jobs = []) {
        this.jobs = void 0;
        this.jobs = jobs;
      }
      add(job) {
        this.jobs.push(job);
      }
      cleanup() {
        for (let job of this.jobs) {
          if (!job) {
            continue;
          }
          if (implementsCleanupHandle(job)) {
            job.cleanup();
          } else if (implementsRemoveHandle(job)) {
            job.remove();
          } else {
            job();
          }
        }
        this.jobs = [];
      }
      remove(job) {
        if (job) {
          const index = this.jobs.indexOf(job);
          if (index >= 0) {
            this.jobs.splice(index, 1);
          }
          job.remove();
        } else {
          this.cleanup();
        }
      }
    }
    // Class that can be used to pass around ownership of a resource.
    // It informs the previous owner of the change (once) and dispatches the new element for all listeners
    // TODO: a better name
    class SingleActiveElementDispatcher extends Dispatcher {
      constructor(...args) {
        super(...args);
        this._active = void 0;
      }
      setActive(element, addChangeListener, forceDispatch) {
        if (!forceDispatch && element === this._active) {
          return;
        }
        this._active = element;
        this.dispatch(element);
        if (addChangeListener) {
          this.addListenerOnce(newElement => {
            if (newElement != element) {
              addChangeListener(newElement);
            }
          });
        }
      }
      getActive() {
        return this._active;
      }
    }

    let State$1 = class State extends Dispatchable {
      constructor(...args) {
        super(...args);
        this.stores = new Map();
      }
      getStore(objectType) {
        const objectName = isString(objectType) ? objectType?.toLowerCase() : objectType?.objectType;
        return this.stores.get(objectName);
      }
      getStoreForEvent(event) {
        const objectType = event.objectType;
        return this.getStore(objectType);
      }
      addStore(store) {
        const objectType = store.objectType;
        if (!this.stores.has(objectType)) {
          this.stores.set(objectType, store);
        } else {
          throw new Error("GlobalState: Adding a store for an existing object type: " + store.objectType);
        }
      }
      applyEvent(event) {
        if (event == null) {
          return;
        }
        if (Array.isArray(event)) {
          for (const individualEvent of event) {
            this.applyEvent(individualEvent);
          }
          return;
        }
        if (event.state) {
          this.importState(event.state);
          // We can have events that only have a state
          if (!this.getStoreForEvent(event)) {
            return;
          }
        }
        const store = this.getStoreForEvent(event);
        if (store) {
          store.applyEvent(event);
        } else {
          console.log("GlobalState: Missing store for event: ", event);
        }
      }
      get(objectType, id) {
        const store = this.getStore(objectType);
        if (store) {
          return store.get(id);
        } else {
          console.error("GlobalState: Can't find store ", objectType);
          return null;
        }
      }
      // Import the store for objectType and remove it from stateMap
      importStateFromTempMap(objectType, stateMap) {
        const storeState = stateMap.get(objectType);
        stateMap.delete(objectType);
        if (storeState == null) {
          // Probably a dependency that isn't in the state
          return;
        }
        const store = this.getStore(objectType);
        if (!store) {
          console.error("Failed to import state, can't find store ", objectType);
          return;
        }
        for (const dependency of store.dependencies) {
          this.importStateFromTempMap(dependency.toLowerCase(), stateMap);
        }
        store.importState(storeState);
      }
      // Imports the state information from a plain object
      importState(state) {
        if (Array.isArray(state)) {
          for (const obj of state) {
            this.importState(obj);
          }
          return;
        }
        if (state.state || state.events) {
          // Must be a recursive object
          // TODO Technically not correct since we need to respect disableState/Event import for the request itself
          this.load(state);
          return;
        }
        // Import everything in a map and then do an implicit topological sort by dependencies
        const stateMap = new Map();
        for (const [objectType, objects] of Object.entries(state)) {
          stateMap.set(objectType.toLowerCase(), objects);
        }
        while (stateMap.size > 0) {
          const allKeys = stateMap.keys();
          const objectType = allKeys.next().value;
          this.importStateFromTempMap(objectType, stateMap);
        }
      }
      // Loads both the state and the events
      load({
        state,
        events
      }, disableStateImport, disableEventsImport) {
        if (state && !disableStateImport) {
          this.importState(state);
        }
        if (events && !disableEventsImport) {
          this.applyEvent(events);
        }
      }
      clear() {
        for (const store of this.stores.values()) {
          store.clear && store.clear();
        }
      }
      toJSON() {
        const state = {};
        for (const store of this.stores.values()) {
          state[store.objectType] = store.toJSON();
        }
        return state;
      }
    };
    // When creating a store without an explicit state, this value should be assumed
    const GlobalState = new State$1();

    // TODO @Mihai this should become the new Store
    // A symbol to dispatch state events by type, since Dispatchable owns generic dispatchers
    const EventDispatcherSymbol = Symbol("EventDispatcher");
    class StoreObject extends Dispatchable {
      constructor(obj, event) {
        super();
        Object.assign(this, obj);
      }
      getOwnStore() {
        return this.constructor;
      }
      getStore(storeName) {
        const ownStore = this.getOwnStore();
        if (storeName) {
          return ownStore.getState().getStore(storeName);
        }
        return ownStore;
      }
      // By default, applying an event just shallow copies the fields from event.data
      applyEvent(event) {
        Object.assign(this, event.data);
      }
      applyEventAndDispatch(event) {
        this.applyEvent(event);
        this.dispatchChange(event);
      }
      addDeleteListener(callback) {
        return this.addListener("delete", callback);
      }
      // Add a listener on updates from events with this specific type.
      // Can accept an array as eventType
      addEventListener(eventType, callback) {
        if (Array.isArray(eventType)) {
          const handlers = eventType.map(e => this.addEventListener(e, callback));
          return new CleanupJobs(handlers);
        }
        // Ensure the private event dispatcher exists
        if (!this[EventDispatcherSymbol]) {
          this[EventDispatcherSymbol] = new Dispatchable();
          this.addChangeListener(event => {
            this[EventDispatcherSymbol].dispatch(event.type, event, this);
          });
        }
        return this[EventDispatcherSymbol].addListener(eventType, callback);
      }
      toJSON() {
        const obj = {};
        for (const key in this) {
          if (this.hasOwnProperty(key)) {
            obj[key] = this[key];
          }
        }
        return obj;
      }
      // Static store logic

      static makeFieldLoader(fieldDescriptor) {
        fieldDescriptor.cacheField = false;
        fieldDescriptor.rawField = fieldDescriptor.rawField || (key => key + "Id");
        return (value, obj) => {
          //const store = obj.getStore(this.objectType);
          return this.get(value);
        };
      }
      static loadRaw(responseOrState) {
        const state = responseOrState?.state || responseOrState || {};
        // Since the backend might have a different lettering case, need a more complex search here
        for (const [key, value] of Object.entries(state)) {
          if (String(key).toLowerCase() === this.objectType) {
            return toArray(value);
          }
        }
        return [];
      }
      // For a response/state raw object, return the objects that we have in store
      static load(responseOrState) {
        const rawObjects = this.loadRaw(responseOrState);
        return rawObjects.map(obj => this.get(obj.id)).filter(isNotNull);
      }
      static loadObject(responseOrState) {
        return this.load(responseOrState)?.[0];
      }
      static getState() {
        return this.state;
      }
      static get(id) {
        if (id == null) {
          return;
        }
        return this.objects.get(String(id));
      }
      static addObject(id, obj) {
        this.objects.set(String(id), obj);
      }
      static clear() {
        this.objects.clear();
        this.dispatchChange();
      }
      static getObjectIdForEvent(event) {
        const id = event.objectId || event.data?.id;
        return String(id);
      }
      static getObjectForEvent(event) {
        let objectId = this.getObjectIdForEvent(event);
        return this.get(objectId);
      }
      static values() {
        return this.objects.values();
      }
      static all() {
        const values = Array.from(this.values());
        return this.comparator ? values.sort(this.comparator) : values;
      }
      static find(callback) {
        return this.all().find(callback);
      }
      static filter(callback) {
        return this.all().filter(callback);
      }
      // TODO Stores should have configurable indexes from FK ids, for quick filtering
      static filterBy(filter) {
        const entries = Object.entries(filter); // Some minimal caching
        return this.filter(obj => {
          for (const [key, value] of entries) {
            const objectValue = obj[key];
            // Can match by array (any value) or otherwise exact match
            if (Array.isArray(value)) {
              if (!value.includes(objectValue)) {
                return false;
              }
            } else {
              if (objectValue != value) {
                return false;
              }
            }
          }
          return true;
        });
      }
      static findBy(filter) {
        // TODO - need a better implementation with rapid termination
        return this.filterBy(filter)[0];
      }
      static toJSON() {
        return this.all().map(entry => entry.toJSON());
      }
      static applyCreateOrUpdateEvent(event, sendDispatch = true) {
        let obj = this.getObjectForEvent(event);
        if (obj) {
          obj.applyEventAndDispatch(event);
        } else {
          obj = new this(event.data, event);
          this.addObject(this.getObjectIdForEvent(event), obj);
          if (sendDispatch) {
            this.dispatch("create", obj, event);
          }
        }
        if (sendDispatch) {
          this.dispatchChange(obj, event);
        }
        return obj;
      }
      static applyDeleteEvent(event) {
        const obj = this.getObjectForEvent(event);
        if (obj) {
          this.objects.delete(this.getObjectIdForEvent(event));
          obj.dispatch("delete", event, obj);
          this.dispatch("delete", obj, event);
          this.dispatch("change", obj, event);
        }
        return obj;
      }
      static applyEvent(event) {
        event.data = event.data || {};
        if (event.type === "create" || event.type === "createOrUpdate") {
          return this.applyCreateOrUpdateEvent(event);
        }
        if (event.type === "delete") {
          return this.applyDeleteEvent(event);
        }
        // We're in the general case
        const obj = this.getObjectForEvent(event);
        if (!obj) {
          console.error("Missing object of type ", this.objectType, " ", event.objectId);
          return null;
        }
        obj.applyEventAndDispatch(event);
        this.dispatchChange(obj, event); // TODO this is not a store event, but how can we still register for all of these?
        return obj;
      }
      static importState(objects = []) {
        for (const obj of objects) {
          this.create(obj);
        }
      }
      static makeEventFromObject(obj, eventExtra = null) {
        return {
          isFake: true,
          type: "create",
          objectType: this.objectType,
          objectId: obj.id,
          data: obj,
          ...eventExtra
        };
      }
      // Create a fake creation event, to insert the raw object
      static create(obj, eventExtra = null, dispatchEvent = true) {
        if (!obj) {
          return;
        }
        const event = this.makeEventFromObject(obj, eventExtra);
        return this.applyCreateOrUpdateEvent(event, dispatchEvent);
      }
      // Add a listener on all object creation events
      // If fakeExisting, will also pass existing objects to your callback
      static addCreateListener(callback, fakeExisting) {
        if (fakeExisting) {
          for (const obj of this.objects.values()) {
            const event = this.makeEventFromObject(obj);
            callback(obj, event);
          }
        }
        return this.addListener("create", callback);
      }
      // Add a listener for any object deletions
      static addDeleteListener(callback) {
        return this.addListener("delete", callback);
      }
    }
    StoreObject.objectType = void 0;
    StoreObject.state = GlobalState;
    StoreObject.dependencies = [];
    StoreObject.objects = new Map();
    StoreObject.comparator = void 0;
    function globalStore(constructor) {
      // Register the store with GlobalState immediately
      GlobalState.addStore(constructor);
      return constructor;
    }
    function BaseStore(objectType, options = {}, BaseClass) {
      const state = options.state || GlobalState;
      BaseClass = BaseClass || StoreObject;
      const dependencies = [...(options.dependencies || []), ...(BaseClass.dependencies || [])];
      class Store extends BaseClass {}
      // Copy Dispatchable instance properties and methods to the Store class
      Store.objectType = objectType.toLowerCase();
      Store.state = state;
      Store.dependencies = dependencies.map(d => isString(d) ? d : d.objectType);
      Store.objects = new Map();
      const dispatchableInstance = new Dispatchable();
      Object.assign(Store, dispatchableInstance);
      // Copy Dispatchable prototype methods and getters/setters to Store
      const dispatchableProto = Dispatchable.prototype;
      Object.getOwnPropertyNames(dispatchableProto).forEach(name => {
        if (name === "constructor") {
          return;
        }
        const descriptor = Object.getOwnPropertyDescriptor(dispatchableProto, name);
        if (descriptor) {
          Object.defineProperty(Store, name, descriptor);
        }
      });
      return Store;
    }

    class SingletonStore extends StoreObject {
      constructor(objectType, options = {}) {
        super({});
        this.objectType = void 0;
        this.state = void 0;
        this.dependencies = void 0;
        this.objectType = objectType.toLowerCase();
        this.state = options.state;
        this.dependencies = options.dependencies;
      }
      get() {
        return this;
      }
      all() {
        return [this];
      }
      toJSON() {
        return JSON.stringify([this]);
      }
      applyEvent(event) {
        Object.assign(this, event.data);
        this.dispatchChange(event);
      }
      importState(obj) {
        Object.assign(this, obj);
        this.dispatchChange(obj);
      }
    }

    var _class$2H;
    let Language = globalStore(_class$2H = class Language extends BaseStore("Language") {
      constructor(...args) {
        super(...args);
        this.translationMap = new Map();
      }
      toString() {
        let name = this.name;
        if (this.localName && this.localName != this.name) {
          name += " (" + this.localName + ")";
        }
        return name;
      }
      buildTranslation(callback) {
        this.getStore().dispatch("buildTranslationMap", this);
        callback(this.translationMap);
      }
      static getLanguageForCode(isoCode) {
        for (const language of this.all()) {
          if (language.isoCode === isoCode) {
            return language;
          }
        }
      }
      static setLocale(language) {
        if (this.Locale == language) {
          return;
        }
        this.Locale = language;
        this.dispatch("localeChange", language);
      }
      static getLocale() {
        return this.Locale;
      }
    }) || _class$2H;

    const defaultToPixelsAttributes = new Set(["border-radius", "border-bottom-left-radius", "border-bottom-right-radius", "border-top-left-radius", "border-top-right-radius", "border-bottom-width", "border-left-width", "border-right-width", "border-top-width", "border-width", "bottom", "font-size", "font-stretch", "height", "layer-grid-char", "layer-grid-char-spacing", "layer-grid-line", "left", "letter-spacing", "line-height", "margin", "margin-bottom", "margin-left", "margin-right", "margin-top", "marker-offset", "max-height", "max-width", "min-height", "min-width", "outline-width", "padding", "padding-bottom", "padding-left", "padding-right", "padding-top", "right", "size", "top", "width", "word-spacing", "gap"]);

    // Used to map from option key to a DOM attribute name.
    // Can recursively fall back to a base mapping, to allow extending of a parent class
    class DOMAttributesMap {
      constructor(fallbackMapping, allowedAttributesArray = [], allowedPrefixes = []) {
        this.allowedAttributesMap = new Map();
        this.reverseNameMap = new Map();
        this.fallbackMapping = void 0;
        this.allowedPrefixes = void 0;
        this.fallbackMapping = fallbackMapping;
        for (let attribute of allowedAttributesArray) {
          if (!Array.isArray(attribute)) {
            attribute = [attribute];
          }
          this.setAttribute(attribute[0], attribute[1]);
        }
        this.allowedPrefixes = allowedPrefixes;
      }
      setAttribute(key, value) {
        value = value || {};
        value.domName = value.domName || key;
        this.allowedAttributesMap.set(key, value);
        this.reverseNameMap.set(value.domName, key);
      }
      get(key) {
        for (const prefix of this.allowedPrefixes) {
          if (key.startsWith(prefix)) {
            return {
              domName: key
            };
          }
        }
        let value = this.allowedAttributesMap.get(key);
        if (!value && this.fallbackMapping) {
          value = this.fallbackMapping.get(key);
        }
        return value;
      }
      has(key) {
        return this.allowedAttributesMap.has(key) || this.fallbackMapping && this.fallbackMapping.has(key);
      }
      getKeyFromDOMName(key) {
        let value = this.reverseNameMap.get(key);
        if (!value && this.fallbackMapping) {
          value = this.fallbackMapping.getKeyFromDOMName(key);
        }
        return value;
      }
    }

    // A class that can be used to work with a className field as with a Set, while having a toString() usable in the DOM
    // It's used when a UI object has a className attribute, that a string, but we still want it to be modified if we call addClass and removeClass
    // In that case, the string gets converted to a ClassNameSet
    class ClassNameSet extends Set {
      // Can't use classic super in constructor since Set is build-in type and will throw an error
      // TODO: see if could still be made to have this as constructor
      static create(className) {
        const value = new Set(String(className || "").split(" "));
        return setObjectPrototype(value, this);
      }
      toString() {
        return Array.from(this).join(" ");
      }
    }
    class NodeAttributes {
      // Type hint for style property when it exists (not automatically created)

      constructor(obj) {
        Object.assign(this, obj);
        // className and style should be deep copied to be modifiable, the others shallow copied
        if (this.className instanceof ClassNameSet) {
          this.className = ClassNameSet.create(String(this.className));
        }
        if (isPlainObject(this.style)) {
          // Make a copy, since we might modify it later
          this.style = {
            ...this.style
          };
        }
      }

      // Change the attribute & apply it, regardless if it exists in the attribute map (in that case it's whitelisted)
      // TODO: should this use the domName or the reverseName? Still needs work
      setAttribute(key, value, node, attributesMap = this.constructor.defaultAttributesMap) {
        // TODO: might want to find a better way than whitelistAttributes field to do this
        if (!attributesMap.has(key)) {
          this.whitelistedAttributes = this.whitelistedAttributes || {}; // TODO: reconsider the whitelisted attributes
          this.whitelistedAttributes[key] = true;
        }
        this[key] = value;
        if (node) {
          this.applyAttribute(key, node, attributesMap);
        }
      }
      applyStyleToNode(key, value, node) {
        if (typeof value === "function") {
          value = value();
        }
        if (isNumber(value) && value != 0 && defaultToPixelsAttributes.has(dashCase(key))) {
          value = value + "px";
        }
        if (node && node.style[key] !== value) {
          node.style[key] = value;
        }
      }

      // Should the style property have been passed in as a string, save it to the variable that will be applied before the string object.
      ensureNoStringStyle() {
        if (isString(this.style)) {
          this.styleString = this.style; // Keep in a temp value
          delete this.style;
        }
      }
      setStyle(key, value, node) {
        value = resolveFuncValue(value);
        if (!isString(key)) {
          // If the key is not a string, it should be a plain object
          for (const styleKey of Object.keys(key)) {
            this.setStyle(styleKey, key[styleKey], node);
          }
          return;
        }
        if (value === undefined) {
          this.removeStyle(key, node);
          return;
        }
        this.ensureNoStringStyle();
        this.style = this.style || {};
        this.style[key] = value;
        this.applyStyleToNode(key, value, node);
      }
      removeStyle(key, node) {
        if (this.style) {
          delete this.style[key];
        }
        if (node?.style[key]) {
          delete node.style[key];
        }
      }
      static getClassArray(classes) {
        if (!classes) {
          return [];
        }
        if (Array.isArray(classes)) {
          return classes.map(x => String(x).trim());
        } else {
          return String(classes).trim().split(" ");
        }
      }
      getClassNameSet() {
        if (!(this.className instanceof ClassNameSet)) {
          this.className = ClassNameSet.create(this.className || "");
        }
        return this.className;
      }
      addClass(classes, node) {
        classes = this.constructor.getClassArray(classes);
        for (const cls of classes) {
          this.getClassNameSet().add(cls);
          if (node) {
            node.classList.add(cls);
          }
        }
      }
      removeClass(classes, node) {
        classes = this.constructor.getClassArray(classes);
        for (const cls of classes) {
          this.getClassNameSet().delete(cls);
          if (node) {
            node.classList.remove(cls);
          }
        }
      }
      hasClass(className) {
        return this.getClassNameSet().has(isString(className) ? className : className.className);
      }

      // Apply the attribute only if it's in the attributesMap
      applyAttribute(key, node, attributesMap) {
        let attributeOptions = attributesMap.get(key);
        if (!attributeOptions) {
          if (this.whitelistedAttributes && key in this.whitelistedAttributes) {
            attributeOptions = {
              domName: key
            };
          } else {
            return;
          }
        }
        let value = this[key];
        if (typeof value === "function") {
          value = value();
        }
        if (attributeOptions.noValue) {
          if (value) {
            value = "";
          } else {
            value = undefined;
          }
        }
        if (typeof value !== "undefined") {
          node.setAttribute(attributeOptions.domName, value);
        } else {
          node.removeAttribute(attributeOptions.domName);
        }
      }
      applyClassName(node) {
        if (this.className) {
          const className = String(this.className);
          if (node.className !== className) {
            node.className = className;
          }
        } else {
          if (node.className) {
            node.removeAttribute("class");
          }
        }
      }
      apply(node, attributesMap) {
        const addedAttributes = {};
        this.whitelistedAttributes || {};

        // First update existing node attributes and delete old ones
        // TODO: optimize to not run this if the node was freshly created
        const nodeAttributes = node.attributes;
        for (let i = nodeAttributes.length - 1; i >= 0; i--) {
          const attr = nodeAttributes[i];
          const attributeName = attr.name;
          if (attributeName === "style" || attributeName === "class") {
            // TODO: maybe should do work here?
            continue;
          }
          const key = attributesMap.getKeyFromDOMName(attributeName);
          if (key && this.hasOwnProperty(key)) {
            let value = this[key];
            const attributeOptions = attributesMap.get(key);
            if (attributeOptions?.noValue) {
              if (value) {
                value = "";
              } else {
                value = undefined;
              }
            }
            if (value != null) {
              node.setAttribute(attributeName, value);
              addedAttributes[key] = true;
            } else {
              node.removeAttribute(attributeName);
            }
          } else {
            node.removeAttribute(attributeName);
          }
        }
        // Add new attributes
        for (const key in this) {
          if (addedAttributes[key]) {
            continue;
          }
          this.applyAttribute(key, node, attributesMap);
        }
        this.applyClassName(node);
        node.removeAttribute("style");
        this.ensureNoStringStyle();
        if (this.styleString) {
          // @ts-ignore
          node.style = this.styleString;
        }
        if (this.style) {
          for (const key of Object.keys(this.style)) {
            this.applyStyleToNode(key, this.style[key], node);
          }
        }
      }
    }

    // Default node attributes, should be as few of these as possible
    NodeAttributes.defaultAttributesMap = void 0;
    NodeAttributes.defaultEventsMap = void 0;
    NodeAttributes.defaultAttributesMap = new DOMAttributesMap(null, [["id"], ["action"], ["checked", {
      noValue: true
    }], ["colspan"], ["default"], ["disabled", {
      noValue: true
    }], ["fixed"], ["forAttr", {
      domName: "for"
    }],
    // TODO: have a consistent nomenclature for there!
    ["hidden"], ["href"], ["rel"], ["minHeight"], ["minWidth"], ["role"], ["target"], ["domTitle", {
      domName: "title"
    }],
    // TODO titleAttr?
    ["type"], ["placeholder"], ["src"], ["alt"], ["height"], ["width"], ["tabIndex"], ["data"]
    //["value"], // Value is intentionally disabled
    ], ["data-", "aria-"]);
    NodeAttributes.defaultEventsMap = new DOMAttributesMap(null, [["click"], ["mouseenter"], ["mouseleave"], ["doubleClick", {
      domName: "dblclick"
    }]]);

    class CallModifier {
      wrap(func) {
        throw new Error("Implement wrap method");
      }
      call(func) {
        return this.wrap(func)();
      }
      toFunction() {
        return func => this.wrap(func);
      }
    }

    /*
    CallThrottler acts both as a throttler and a debouncer, allowing you to combine both types of functionality.
    Available options:
        - debounce (ms): delays the function call by x ms, each call extending the delay
        - throttle (ms): keeps calls from happening with at most x ms between them. If debounce is also set, will make sure to
        fire a debounced even if over x ms have passed. If equal to CallTimer.ON_ANIMATION_FRAME, means that we want to use
        requestAnimationFrame instead of setTimeout, to execute before next frame redraw()
        - dropThrottled (boolean, default false): any throttled function call is not delayed, but dropped
     */
    class CallThrottler extends CallModifier {
      constructor(options = {}) {
        super();
        this.lastCallTime = 0;
        this.pendingCall = null;
        this.pendingCallArgs = [];
        this.pendingCallExpectedTime = 0;
        this.numCalls = 0;
        this.totalCallDuration = 0;
        this.debounce = void 0;
        this.throttle = void 0;
        this.dropThrottled = void 0;
        Object.assign(this, options);
      }
      isThrottleOnAnimationFrame() {
        return this.throttle === this.constructor.ON_ANIMATION_FRAME;
      }
      clearPendingCall() {
        this.pendingCall = null;
        this.pendingCallArgs = [];
        this.pendingCallExpectedTime = 0;
      }
      cancel() {
        this.pendingCall && this.pendingCall.cancel();
        this.clearPendingCall();
      }
      flush() {
        this.pendingCall && this.pendingCall.flush();
        this.clearPendingCall();
      }

      // API compatibility with cleanup jobs
      cleanup() {
        this.cancel();
      }
      computeExecutionDelay(timeNow) {
        let executionDelay = null;
        if (this.throttle != null && typeof this.throttle === 'number') {
          executionDelay = Math.max(this.lastCallTime + this.throttle - timeNow, 0);
        }
        if (this.debounce != null) {
          executionDelay = Math.min(executionDelay != null ? executionDelay : this.debounce, this.debounce);
        }
        return executionDelay;
      }
      replacePendingCall(wrappedFunc, funcCall, funcCallArgs) {
        this.cancel();
        if (this.isThrottleOnAnimationFrame()) {
          const cancelHandler = requestAnimationFrame(funcCall);
          wrappedFunc.cancel = () => cancelAnimationFrame(cancelHandler);
          return;
        }
        const timeNow = Date.now();
        const executionDelay = this.computeExecutionDelay(timeNow);
        if (this.dropThrottled) {
          return executionDelay === 0 && funcCall();
        }
        const cancelHandler = setTimeout(funcCall, executionDelay || 0);
        wrappedFunc.cancel = () => clearTimeout(cancelHandler);
        this.pendingCall = wrappedFunc;
        this.pendingCallArgs = funcCallArgs;
        this.pendingCallExpectedTime = timeNow + executionDelay;
      }
      updatePendingCall(args) {
        this.pendingCallArgs = args;
        if (!this.isThrottleOnAnimationFrame()) {
          const timeNow = Date.now();
          this.pendingCallExpectedTime = timeNow + this.computeExecutionDelay(timeNow);
        }
      }
      wrap(func) {
        const funcCall = () => {
          const timeNow = Date.now();
          // The expected time when the function should be executed next might have been changed
          // Check if that's the case, while allowing a 1ms error for time measurement
          if (!this.isThrottleOnAnimationFrame() && timeNow + 1 < this.pendingCallExpectedTime) {
            this.replacePendingCall(wrappedFunc, funcCall, this.pendingCallArgs);
          } else {
            this.lastCallTime = timeNow;
            this.clearPendingCall();
            func(...this.pendingCallArgs);
          }
        };
        const wrappedFunc = (...args) => {
          // Check if it's our function, and update the arguments and next execution time only
          if (this.pendingCall && func === this.pendingCall.originalFunc) {
            // We only need to update the arguments, and maybe mark that we want to executed later than scheduled
            // It's an optimization to not invoke too many setTimeout/clearTimeout pairs
            return this.updatePendingCall(args);
          }
          return this.replacePendingCall(wrappedFunc, funcCall, args);
        };
        wrappedFunc.originalFunc = func;
        wrappedFunc.cancel = NOOP_FUNCTION;
        wrappedFunc.flush = () => {
          if (wrappedFunc === this.pendingCall) {
            this.cancel();
            wrappedFunc();
          }
        };
        return wrappedFunc;
      }
    }

    // export function benchmarkThrottle(options={}) {
    //     const startTime = performance.now();
    //     const calls = options.calls || 100000;
    //
    //     const throttler = new CallThrottler({throttle: options.throttle || 300, debounce: options.debounce || 100});
    //
    //     const func = options.func || NOOP_FUNCTION;
    //
    //     const wrappedFunc = throttler.wrap(func);
    //
    //     for (let i = 0; i < calls; i += 1) {
    //         wrappedFunc();
    //     }
    //     console.warn("Throttle benchmark:", performance.now() - startTime, "for", calls, "calls");
    // }
    CallThrottler.ON_ANIMATION_FRAME = Symbol();
    CallThrottler.AUTOMATIC = Symbol();

    class ThemeType {
      constructor(type, value, options) {
        this.type = void 0;
        this.value = void 0;
        this.options = void 0;
        options = options || {};
        if (isString(options)) {
          options = {
            comment: options
          };
        }
        this.type = type;
        this.value = value;
        this.options = options;
      }
    }

    // TODO this should also have a validator here for instance
    function MakeThemeType(type) {
      return (value, options = {}) => new ThemeType(type, value, options);
    }
    const FloatType = MakeThemeType("Float");

    var _Theme;
    class Theme extends Dispatchable {
      constructor(baseTheme, name, props) {
        super();
        this.classSet = new Set();
        this.styleSheetInstances = new Map();
        // map from StyleSheet class to instance
        this.updateThrottled = new CallThrottler({
          throttle: 50
        }).wrap(() => this.updateStyleSheets());
        // TODO @cleanup CallThrottler syntax is really ugly
        this.name = void 0;
        this.baseTheme = void 0;
        this.properties = void 0;
        this.propTypes = void 0;
        this.props = void 0;
        this.styleSheetSymbol = void 0;
        this.name = name;
        this.baseTheme = baseTheme;
        this.properties = {
          theme: this,
          ...props
        };
        this.propTypes = {};
        this.props = new Proxy(this.properties, {
          get: (properties, key, receiver) => {
            const rawValue = this.getProperty(key);
            const value = resolveFuncValue(rawValue, {
              args: [this.props]
            });
            if (globalThis.STEM_DEBUG && value === undefined) {
              console.warn("Failed to find theme prop", key);
            }
            return value;
          },
          set: (properties, key, value) => {
            this.setProperties({
              [key]: value
            });
            // TODO this should also update all themes that inherit from us
            return true;
          }
        });
        this.styleSheetSymbol = Symbol(this.name + "StyleSheet");
        window.addEventListener("resize", () => this.updateThrottled());
      }

      // Create a new Theme, based on the current one
      fork(name, extraProps) {
        return new Theme(this, name, extraProps);
      }
      register(cls, styleSheet) {
        cls.theme = this;
        cls[this.styleSheetSymbol] = styleSheet;
        this.classSet.add(cls);
      }
      getStyleSheet(cls) {
        return cls[this.styleSheetSymbol] || this.baseTheme?.getStyleSheet(cls);
      }
      getProperty(key) {
        if (this.properties.hasOwnProperty(key)) {
          // Return nulls as well
          return this.properties[key];
        }
        return this.baseTheme?.getProperty(key);
      }
      setProperties(properties, update = true) {
        for (const [key, value] of Object.entries(properties)) {
          if (value instanceof ThemeType) {
            this.properties[key] = value.value;
            this.propTypes[key] = value;
          } else {
            this.properties[key] = value;
          }
        }
        if (update) {
          this.updateThrottled();
        }
      }
      getAllStyleSheets() {
        const styleSheetSet = new Set(this.styleSheetInstances.values());
        for (const cls of this.classSet.values()) {
          styleSheetSet.add(this.getStyleSheet(cls));
        }
        return Array.from(styleSheetSet).map(styleSheet => styleSheet.getInstance(this));
      }
      getStyleSheetInstance(Cls) {
        let instance = this.styleSheetInstances.get(Cls);
        if (!instance) {
          instance = new Cls({
            theme: this
          });
          this.styleSheetInstances.set(Cls, instance);
        }
        return instance;
      }
      updateStyleSheets() {
        this.dispatch("beforeUpdateStyleSheets");
        for (const styleSheet of this.getAllStyleSheets()) {
          styleSheet.update();
        }
        this.dispatch("afterUpdateStyleSheets");
      }

      // TODO @branch styleSheet should have a type
      static register(cls, styleSheet) {
        return this.Global.register(cls, styleSheet);
      }
      static setProperties(properties) {
        this.Global.setProperties(properties);
      }
      static get props() {
        return this.Global.props;
      }
    }

    // TODO @types move this to Style.ts, makes more sense to be there
    // There's a fucking Typescript proposal from 10 years ago that developers are bullshitting against: https://github.com/Microsoft/TypeScript/issues/4881
    // It needs to be implemented before the new type is properly recognized
    _Theme = Theme;
    Theme.Global = new _Theme(null, "Global");
    function registerStyle(styleClass, theme = Theme.Global) {
      return function (target) {
        theme.register(target, styleClass);
        return target;
      };
    }

    // Type definitions

    const RenderStack = []; //keeps track of objects that are redrawing, to know where to assign refs automatically
    const redrawPerTickRunner = new OncePerTickRunner((obj, event) => obj.node && obj.redraw(event));

    // TODO Maybe get rid of the UI namespace

    const UI$1 = {};
    function cleanChildren(children) {
      return unwrapArray(children, unwrapElementWithFunc);
    }
    class BaseUIElement extends Dispatchable {
      canOverwrite(existingChild) {
        return this.constructor === existingChild.constructor && this.getNodeType() === existingChild.getNodeType();
      }
      applyRef() {
        if (this.options?.ref) {
          const obj = this.options.ref.parent;
          const name = this.options.ref.name ?? this.options.ref.key; // TODO: should be key
          obj[name] = this;
        }

        // We do this here since this is done on every redraw, and we just needed a way to hook into all redraw
        this.cancelEnqueuedRedraw();
      }
      removeRef() {
        if (this.options?.ref) {
          const obj = this.options.ref.parent;
          const name = this.options.ref.name;
          if (obj[name] === this) {
            obj[name] = undefined;
          }
        }
      }

      // Calls a queueMicrotask(() => this.redraw()), but only if one isn't already enqueued
      // The enqueued task will be canceled if a redraw is manually called in the meantime
      enqueueRedraw(event) {
        redrawPerTickRunner.maybeEnqueue(this, event);
      }
      cancelEnqueuedRedraw() {
        redrawPerTickRunner.clear(this);
      }

      // Lifecycle methods, called when the element was first inserted in the DOM, and before it's removed
      onMount() {}
      onUnmount() {}
      destroyNode() {
        this.dispatch("unmount", this);
        this.onUnmount();
        this.cleanup();
        this.removeRef();
        this.node?.remove();
        delete this.node; // Clear for gc
      }
    }
    class TextUIElement extends BaseUIElement {
      // @ts-ignore

      constructor(value = "") {
        super();
        this.value = void 0;
        if (value?.hasOwnProperty("value") && isPlainObject(value)) {
          this.value = value.value;
          this.options = value;
        } else {
          this.value = value ?? "";
        }
      }
      mount(parent, nextSibling) {
        this.parent = parent;
        if (!this.node) {
          this.createNode();
          this.applyRef();
        } else {
          this.redraw();
        }
        parent.node.insertBefore(this.node, nextSibling);
        this.onMount();
      }
      getNodeType() {
        return Node.TEXT_NODE;
      }
      copyState(element) {
        this.value = element.value;
        this.options = element.options;
      }
      createNode() {
        this.node = document.createTextNode(this.getValue());
        applyDebugFlags(this);
        return this.node;
      }
      setValue(value) {
        this.value = value != null ? value : "";
        if (this.node) {
          this.redraw();
        }
      }
      getValue() {
        return String(this.value);
      }
      toString() {
        return this.getValue();
      }
      redraw() {
        if (this.node) {
          let newValue = this.getValue();
          // TODO: check if this is best for performance
          if (this.node.nodeValue !== newValue) {
            this.node.nodeValue = newValue;
          }
        }
        this.applyRef();
      }
    }
    UI$1.TextElement = TextUIElement;
    class UIElement extends BaseUIElement {
      constructor(options = {}) {
        super();
        this.children = [];
        this.children = []; // These are the rendered children
        this.options = options; // TODO: this is a hack, to not break all the code that references this.options in setOptions
        this.setOptions(options); // TODO maybe this actually needs to be removed, since on a copy we don't want the default options of the other object
      }
      getDefaultOptions(options) {
        return undefined;
      }

      // Return our options without the UI specific fields, so they can be passed along
      getCleanedOptions() {
        const options = {
          ...this.options
        };
        delete options.ref;
        delete options.children;
        delete options.key;
        delete options.nodeType;
        return options;
      }
      getPreservedOptions() {
        return undefined;
      }
      setOptions(options) {
        const defaultOptions = this.getDefaultOptions(options);
        if (defaultOptions) {
          options = Object.assign(defaultOptions, options);
        }
        this.options = options;
      }

      // TODO: should probably add a second arg, doRedraw=true - same for setOptions
      updateOptions(options) {
        this.setOptions(Object.assign(this.options, options));
        // TODO: if the old options and the new options are deep equal, we can skip this redraw, right?
        this.redraw();
      }
      setChildren(...args) {
        this.updateOptions({
          children: cleanChildren(args)
        });
      }

      // Used when we want to reuse the current element, with the options from the passed in argument
      // Is only called when element.canOverwrite(this) is true
      copyState(element) {
        let options = element.options;
        let preservedOptions = this.getPreservedOptions();
        if (preservedOptions) {
          options = {
            ...options,
            ...preservedOptions
          };
        }
        this.setOptions(options || {});
        this.addListenersFromOptions();
      }
      getNodeType() {
        return this.options?.nodeType || "div";
      }
      static create(parentNode, options) {
        const uiElement = new this(options);
        uiElement.mount(parentNode, null);
        uiElement.dispatch("mount", uiElement);
        return uiElement;
      }

      // TODO: should be renamed to renderContent
      getGivenChildren() {
        return this.options?.children || [];
      }
      render() {
        return this.options?.children;
      }
      createNode() {
        this.node = document.createElement(this.getNodeType());
        applyDebugFlags(this);
        return this.node;
      }

      // Abstract, gets called when removing DOM node associated with the
      cleanup() {
        this.runCleanupJobs();
        for (const child of this.children) {
          child.destroyNode();
        }
        this.clearNode();
        super.cleanup();
      }
      overwriteChild(existingChild, newChild) {
        existingChild.copyState(newChild);
        return existingChild;
      }
      getElementKeyMap(elements) {
        if (!Array.isArray(elements)) {
          return null;
        }
        const childrenKeyMap = new Map();
        for (let i = 0; i < elements.length; i += 1) {
          const childKey = elements[i].options && elements[i].options.key || "autokey" + i;
          childrenKeyMap.set(childKey, elements[i]);
        }
        return childrenKeyMap;
      }
      getChildrenToRender() {
        return this.render();
      }

      // TODO @types type this
      getExtraContext() {
        const theme = this.options?.theme;
        if (theme) {
          return {
            theme
          };
        }
        return null; // cleanObject({theme}, {emptyAsNull: true});
      }
      updateContext(context = this.parent?.context) {
        const extraContext = this.getExtraContext();
        this.context = extraContext ? {
          ...context,
          ...extraContext
        } : context;
      }

      // TODO @types these children are clean
      getChildrenForRedraw() {
        RenderStack.push(this);
        const children = cleanChildren(this.getChildrenToRender());
        RenderStack.pop();
        return children;
      }
      redraw() {
        if (!this.node) {
          console.error("Element not yet mounted. Redraw aborted!", this);
          return false;
        }
        this.updateContext();
        let newChildren = this.getChildrenForRedraw();
        if (newChildren === this.children) {
          for (const child of newChildren) {
            child.redraw();
          }
          this.applyNodeAttributes();
          this.applyRef();
          return true;
        }
        const domNode = this.node;
        const childrenKeyMap = this.getElementKeyMap(this.children);
        for (let i = 0; i < newChildren.length; i++) {
          let newChild = newChildren[i];
          let prevChildNode = i > 0 ? newChildren[i - 1].node : null;
          let currentChildNode = prevChildNode ? prevChildNode.nextSibling : domNode.firstChild;

          // Not a UIElement, to be converted to a TextElement probably
          if (!newChild.getNodeType) {
            if (newChild.toUI) {
              newChild = newChild.toUI(this); // TODO move this inside the unwrap logic
            } else {
              newChild = new UI$1.TextElement(String(newChild));
            }
            newChildren[i] = newChild;
          }
          const newChildKey = newChild.options?.key || "autokey" + i;
          const existingChild = childrenKeyMap?.get(newChildKey);
          if (existingChild && newChildren[i].canOverwrite(existingChild)) {
            // We're replacing an existing child element, it might be the very same object
            if (existingChild !== newChildren[i]) {
              newChildren[i] = this.overwriteChild(existingChild, newChildren[i]);
            }
            newChildren[i].redraw();
            if (newChildren[i].node !== currentChildNode) {
              domNode.insertBefore(newChildren[i].node, currentChildNode);
            }
          } else {
            // Getting here means we are not replacing anything, should just render
            newChild.mount(this, currentChildNode);
          }
        }
        if (this.children.length) {
          // Remove children that don't need to be here
          let newChildrenSet = new Set(newChildren);
          for (const currentChild of this.children) {
            if (!newChildrenSet.has(currentChild)) {
              currentChild.destroyNode();
            }
          }
        }
        this.children = newChildren;

        // TODO this end logic is duplicated
        this.applyNodeAttributes();
        this.applyRef();
        return true;
      }

      // TODO This is actually slightly wrong, since we need to reuse the attr object we previously created
      getOptionsAsNodeAttributes() {
        return setObjectPrototype(this.options || {}, NodeAttributes);
      }
      instantiateNodeAttributes() {
        return new NodeAttributes(this.options);
      }
      getNodeAttributes() {
        const attr = this.instantiateNodeAttributes();
        // Add the default class "container" from our style sheet (if there is one)
        const containerClassName = this.styleSheet?.container;
        if (containerClassName) {
          attr.addClass(containerClassName);
        }
        return attr;
      }
      extraNodeAttributes(attr) {}
      applyNodeAttributes() {
        const attr = this.getNodeAttributes();
        this.extraNodeAttributes(attr);
        attr.apply(this.node, this.constructor.domAttributesMap);
      }
      setAttribute(key, value) {
        this.getOptionsAsNodeAttributes().setAttribute(key, value, this.node, this.constructor.domAttributesMap);
      }
      setStyle(key, value) {
        if (typeof key === "object") {
          for (const [styleKey, styleValue] of Array.from(Object.entries(key))) {
            this.setStyle(styleKey, styleValue);
          }
          return;
        }
        this.getOptionsAsNodeAttributes().setStyle(key, value, this.node);
      }
      removeStyle(key) {
        this.getOptionsAsNodeAttributes().removeStyle(key, this.node);
      }
      addClass(className) {
        this.getOptionsAsNodeAttributes().addClass(className, this.node);
      }
      removeClass(className) {
        this.getOptionsAsNodeAttributes().removeClass(className, this.node);
      }
      hasClass(className) {
        return this.getOptionsAsNodeAttributes().hasClass(className);
      }
      toggleClass(className) {
        if (!this.hasClass(className)) {
          this.addClass(className);
        } else {
          this.removeClass(className);
        }
      }
      getTheme() {
        return this.options?.theme || this.context?.theme || Theme.Global;
      }
      get styleSheet() {
        let {
          styleSheet
        } = this.options || {};
        const theme = this.getTheme();
        if (!styleSheet) {
          styleSheet = theme.getStyleSheet(this.constructor);
        }
        return styleSheet?.getInstance(theme);
      }
      get themeProps() {
        return this.options?.styleSheet?.themeProps || this.getTheme().props;
      }
      addListenersFromOptions() {
        for (const key in this.options) {
          if (typeof key === "string" && key.startsWith("on") && key.length > 2) {
            const eventType = key.substring(2);
            const addListenerMethodName = "add" + eventType + "Listener";
            const handlerMethodName = "on" + eventType + "AutoHandler";

            // We create a wrapper handler, to not worry about updates changing the callback.
            // The handlerMethod might have been previously added
            // by a previous call to this function or manually by the user
            if (this[handlerMethodName]) {
              // Don't double add
              continue;
            }
            const haveListenerMethod = typeof this[addListenerMethodName] === "function";
            const nodeEvent = this.constructor.nodeEventsMap.getKeyFromDOMName(eventType.toLowerCase());
            if (haveListenerMethod || nodeEvent) {
              this[handlerMethodName] = (...args) => {
                if (isFunction(this.options[key])) {
                  this.options[key](...args, this);
                }
              };

              // Actually add the listener
              if (haveListenerMethod) {
                this[addListenerMethodName](this[handlerMethodName]);
              } else {
                this.addNodeListener(eventType.toLowerCase(), this[handlerMethodName]);
              }
            }
          }
        }
      }
      refLink(name) {
        return {
          parent: this,
          name: name
        };
      }
      refLinkArray(arrayName, index) {
        if (!this[arrayName]) {
          this[arrayName] = [];
        }
        return {
          parent: this[arrayName],
          name: index
        };
      }
      bindToNode(node, doRedraw) {
        this.node = node;
        if (doRedraw) {
          this.clearNode();
          this.redraw();
        }
        return this;
      }
      mount(parentNode, nextSiblingNode) {
        const parent = parentNode instanceof HTMLElement ? new UIElement().bindToNode(parentNode) : parentNode;
        this.parent = parent;
        if (this.node) {
          parent.insertChildNodeBefore(this, nextSiblingNode);
          this.dispatch("changeParent", this.parent);
          return;
        }
        this.createNode();
        this.redraw();
        parent.insertChildNodeBefore(this, nextSiblingNode || null);
        this.addListenersFromOptions();
        this.onMount();
      }

      // You need to overwrite the next child manipulation routines if this.options.children !== this.children
      appendChild(child) {
        // TODO: the next check should be done with a decorator
        if (this.children !== this.options?.children) {
          throw "Can't properly handle appendChild, you need to implement it for " + this.constructor;
        }
        this.options.children = this.options.children || [];
        this.options.children.push(child);
        child.mount(this, null);
        return child;
      }
      insertChild(child, position) {
        if (this.children !== this.options?.children) {
          throw "Can't properly handle insertChild, you need to implement it for " + this.constructor;
        }
        position = position || 0;
        this.options.children = this.options.children || [];
        this.options.children.splice(position, 0, child);
        const nextChildNode = position + 1 < this.options.children.length ? this.children[position + 1].node : null;
        child.mount(this, nextChildNode);
        return child;
      }
      eraseChild(child, destroy = true) {
        if (!this.options?.children) return null;
        let index = this.options.children.indexOf(child);
        if (index < 0) {
          // child not found
          return null;
        }
        return this.eraseChildAtIndex(index, destroy);
      }
      eraseChildAtIndex(index, destroy = true) {
        if (!this.options?.children || index < 0 || index >= this.options.children.length) {
          console.error("Erasing child at invalid index ", index, this.options.children?.length || 0);
          return null;
        }
        if (this.children !== this.options.children) {
          throw "Can't properly handle eraseChild, you need to implement it for " + this.constructor;
        }
        let erasedChild = this.options.children.splice(index, 1)[0];
        if (destroy) {
          erasedChild.destroyNode();
        } else {
          this.node.removeChild(erasedChild.node);
        }
        return erasedChild;
      }
      show() {
        this.removeClass("hidden");
      }
      hide() {
        this.addClass("hidden");
      }
      insertChildNodeBefore(childElement, nextSiblingNode) {
        this.node.insertBefore(childElement.node, nextSiblingNode);
      }

      // TODO: should be renamed emptyNode()
      clearNode() {
        while (this.node?.lastChild) {
          this.node.removeChild(this.node.lastChild);
        }
      }
      isInDocument() {
        return document.body.contains(this.node);
      }

      // TODO: this method also doesn't belong here
      getWidthOrHeight(parameter) {
        let node = this.node;
        if (!node) {
          return 0;
        }
        let value = parseFloat(parameter === "width" ? String(node.offsetWidth) : String(node.offsetHeight));
        return value || 0;
      }
      getHeight() {
        return this.getWidthOrHeight("height");
      }
      getWidth() {
        return this.getWidthOrHeight("width");
      }
      setHeight(value) {
        this.setStyle("height", suffixNumber(value, "px"));
        this.dispatch("resize");
      }
      setWidth(value) {
        this.setStyle("width", suffixNumber(value, "px"));
        this.dispatch("resize");
      }
      addNodeListener(name, callback, ...args) {
        this.node.addEventListener(name, callback, ...args);
        const handler = {
          remove: () => {
            this.removeNodeListener(name, callback);
          }
        };
        this.addCleanupJob(handler);
        return handler;
      }
      removeNodeListener(name, callback) {
        this.node?.removeEventListener(name, callback);
      }

      // TODO: methods can be automatically generated by addNodeListener(UI.Element, "dblclick", "DoubleClick") for instance
      addClickListener(callback) {
        return this.addNodeListener("click", callback);
      }
      removeClickListener(callback) {
        this.removeNodeListener("click", callback);
      }
      addPressStartListener(callback) {
        return new CleanupJobs([this.addNodeListener("mousedown", callback), this.addNodeListener("touchstart", callback)]);
      }
      removePressStartListener(callback) {
        this.removeNodeListener("mousedown", callback);
        this.removeNodeListener("touchstart", callback);
      }
      addPressStopListener(callback) {
        return new CleanupJobs([this.addNodeListener("mouseup", callback), this.addNodeListener("touchend", callback)]);
      }
      removePressStopListener(callback) {
        this.removeNodeListener("mouseup", callback);
        this.removeNodeListener("touchend", callback);
      }
      addDoubleClickListener(callback) {
        return this.addNodeListener("dblclick", callback);
      }
      removeDoubleClickListener(callback) {
        this.removeNodeListener("dblclick", callback);
      }
    }
    UIElement.domAttributesMap = NodeAttributes.defaultAttributesMap;
    UIElement.nodeEventsMap = NodeAttributes.defaultEventsMap;
    UIElement.theme = void 0;
    const SVG_TAGS = new Set(["svg", "g", "defs", "radialGradient", "stop", "ellipse", "clipPath", "ellipse", "path", "text"]); // TODO @types full set

    function isSVGTag(tag) {
      return SVG_TAGS.has(tag);
    }
    UI$1.createElement = function (tag, options, ...children) {
      if (!tag) {
        console.error("Create element needs a valid object tag, did you mistype a class name?");
        return null;
      }
      options = options || {};
      options.children = cleanChildren(children);
      if (options.ref) {
        if (typeof options.ref === "string") {
          if (RenderStack.length > 0) {
            options.ref = {
              parent: RenderStack[RenderStack.length - 1],
              name: options.ref
            };
          } else {
            throw Error("Failed to automatically link ref, there needs to be an element in the rendering stack");
          }
        }
        if (options.key) {
          console.error("Warning! UI Element cannot have both a key and a ref fieldname. Key will be overriden.\n" + "Are you using the options from another object? Shame!", options);
        }
        options.key = "_ref" + options.ref.name;
      }
      if (options.hasOwnProperty("class")) {
        console.error("Invalid UI Element attribute: class. Did you mean className?");
      }
      if (isString(tag)) {
        options.nodeType = tag; // TODO @types just shutting down the types
        if (isSVGTag(tag)) {
          return new UI$1.SVGElement(options);
        }
        return new UIElement(options);
      }
      return new tag(options);
    };
    UI$1.Element = UIElement;
    UI$1.str = value => new TextUIElement(value);

    // Keep a map for every base class, and for each base class keep a map for each nodeType, to cache classes
    const primitiveMap = new WeakMap();
    UI$1.Primitive = (nodeType, BaseClass = UIElement) => {
      let baseClassPrimitiveMap = primitiveMap.get(BaseClass);
      if (!baseClassPrimitiveMap) {
        baseClassPrimitiveMap = new Map();
        primitiveMap.set(BaseClass, baseClassPrimitiveMap);
      }
      let resultClass = baseClassPrimitiveMap.get(nodeType);
      if (resultClass) {
        return resultClass;
      }
      // @ts-ignore
      resultClass = class Primitive extends BaseClass {
        getNodeType() {
          return nodeType;
        }
        createNode() {
          this.node = document.createElement(nodeType);
          applyDebugFlags(this);
          return this.node;
        }
      };
      baseClassPrimitiveMap.set(nodeType, resultClass);
      return resultClass;
    };
    function applyDebugFlags(element) {
      if (globalThis.STEM_DEBUG && element.node) {
        element.node.stemElement = element;
      }
    }

    // Type definitions for translation functionality

    // TODO @types use the proper LanguageStoreClass and other proper types

    // This is the object that will be used to translate text
    let translationMap = null;

    // Keep a set of all UI Element that need to be updated when the language changes
    // Can't use a weak set here unfortunately because we need iteration
    // That's why we must make sure to remove all nodes from the set when destroying them
    const TranslationElements = new Set();
    class TranslationTextElement extends TextUIElement {
      // Typescript is idiotic in overriding fields

      constructor(value) {
        if (arguments.length === 1) {
          super(value);
        } else {
          super("");
          this.setValue(...arguments);
        }
      }
      setValue(value) {
        if (arguments.length > 1) {
          this.value = Array.from(arguments);
        } else {
          this.value = value;
        }
        if (this.node) {
          this.redraw();
        }
      }
      evaluate(strings, ...values) {
        if (!Array.isArray(strings)) {
          strings = translationMap?.get(strings) || strings;
          return evaluateSprintf(strings, ...values);
          // This means strings is a string with the sprintf pattern
        } else {
          // Using template literals https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals
          if (arguments.length !== strings.length) {
            console.error("Invalid arguments to evaluate ", Array.from(arguments));
          }
          let result = strings[0];
          for (let i = 1; i < arguments.length; i++) {
            result += arguments[i];
            result += strings[i];
          }
          return result;
        }
      }
      getValue() {
        let {
          value
        } = this;
        if (Array.isArray(value)) {
          value = this.evaluate(...value);
        } else {
          value = (translationMap && translationMap.get(value)) ?? value;
        }
        return value;
      }
      toString() {
        return this.getValue();
      }
      redraw() {
        if (!this.node) {
          this.node = this.createNode();
        }
        super.redraw();
      }
      onMount() {
        TranslationElements.add(this);
      }
      onUnmount() {
        TranslationElements.delete(this);
      }
    }

    // This method is a shorthand notation to create a new translatable text element
    // TODO: should also support being used as a string template
    UI$1.T = str => {
      return new TranslationTextElement(str);
    };

    // TODO @mciucu this should be wrapped in a way that previous requests that arrive later don't get processed
    // TODO: should this be done with promises?
    // Function to be called with a translation map
    // The translationMap object needs to implement .get(value) to return the translation for value
    function setTranslationMap(_translationMap) {
      if (translationMap === _translationMap) {
        return;
      }
      translationMap = _translationMap;
      for (let textElement of TranslationElements.values()) {
        textElement.redraw();
      }
    }
    let languageStore = null;

    // This function should be called to set the language store to watch for changes
    // The languageStore argumenent needs to implement .getLocale(), addListener("localChange", (language) =>{})
    // The language objects need to implement .buildTranslation(callback), where callback should be called with a translationMap
    function setLanguageStore(_languageStore) {
      languageStore = _languageStore;
      let currentLocale = languageStore.getLocale();
      // If there's a default language already set, build the translation table for it
      if (currentLocale) {
        currentLocale.buildTranslation(setTranslationMap);
      }

      // Add a listener for whenever the language changes
      languageStore.addListener("localeChange", language => {
        language.buildTranslation(setTranslationMap);
      });
    }

    // TODO @types move this from there

    if (!document.startViewTransition) {
      document.startViewTransition = callback => callback();
    }

    var _class$2G, _class2$1k;
    let TranslationKey = globalStore(_class$2G = class TranslationKey extends BaseStore("TranslationKey") {}) || _class$2G;
    let TranslationEntry = globalStore(_class2$1k = class TranslationEntry extends BaseStore("TranslationEntry") {
      getLanguage() {
        return Language.get(this.languageId);
      }
      getTranslationKey() {
        return TranslationKey.get(this.translationKeyId);
      }
    }) || _class2$1k;
    Language.addListener("buildTranslationMap", language => {
      for (const translationEntry of TranslationEntry.all()) {
        if (translationEntry.languageId === language.id) {
          const translationKey = translationEntry.getTranslationKey();
          if (translationKey) {
            language.translationMap.set(translationKey.value, translationEntry.value);
          }
        }
      }
    });

    // TODO @Mihai this was written originally in 2016, pretty old and crappy
    class WebsocketStreamHandler extends Dispatcher {
      constructor(websocketSubscriber, streamName, options = {}) {
        super();
        this.websocketSubscriber = void 0;
        this.streamName = void 0;
        this.bytesReceived = void 0;
        this.isIndexed = void 0;
        this.lastMessageIndex = void 0;
        this.messageBuffer = void 0;
        this.missedPackets = void 0;
        this.status = void 0;
        this.subscribeTryCount = void 0;
        this.resendSubscribeTimeout = void 0;
        this.websocketSubscriber = websocketSubscriber;
        this.streamName = streamName;
        this.options = options;
        this.bytesReceived = 0;
        this.isIndexed = false;
        this.lastMessageIndex = -1;
        this.messageBuffer = new Map();
        this.missedPackets = 0;
        this.subscribeTryCount = 0;
        this.resetStatus();
      }
      sendSubscribe() {
        const websocketSubscriber = this.websocketSubscriber;
        this.clearResubscribeTimeout();
        this.status = WebsocketStreamHandler.SUBSCRIBING;
        if (this.isIndexed) {
          websocketSubscriber.sendResubscribe(this.streamName, this.getLastIndex());
        } else {
          websocketSubscriber.sendSubscribe(this.streamName);
        }
        this.subscribeTryCount++;
        const timeoutDuration = websocketSubscriber.calcRetryTimeout(this.subscribeTryCount);
        this.resendSubscribeTimeout = setTimeout(() => {
          console.log("WebsocketSubscriber: stream subscribe timeout for #" + this.streamName + " reached! Trying to resubscribe again!");
          this.sendSubscribe();
        }, timeoutDuration);
      }
      clearResubscribeTimeout() {
        if (this.resendSubscribeTimeout) {
          clearTimeout(this.resendSubscribeTimeout);
          this.resendSubscribeTimeout = undefined;
        }
      }
      setStatusSubscribed() {
        this.clearResubscribeTimeout();
        this.status = WebsocketStreamHandler.SUBSCRIBED;
      }
      resetStatus() {
        this.clearResubscribeTimeout();
        this.status = WebsocketStreamHandler.NONE;
        this.subscribeTryCount = 0;
      }
      processPacket(packet) {
        this.bytesReceived += packet.length;
        let payloadType, payload;
        if (packet[0] === "{") {
          payloadType = "v";
          payload = packet;
        } else {
          let firstSpace = packet.indexOf(" ");
          if (firstSpace > 0) {
            payloadType = packet.substring(0, firstSpace).trim();
            payload = packet.substring(firstSpace + 1).trim();
          } else {
            console.error("WebsocketStreamHandler: Could not process stream packet: " + packet);
            return;
          }
        }
        if (payloadType === "i") {
          this.processIndexedPacket(payload);
        } else if (payloadType === "v") {
          this.processVanillaPacket(payload);
        } else {
          console.error("WebsocketStreamHandler: invalid packet type " + payloadType);
        }
      }
      processIndexedMessage(index, message) {
        this.isIndexed = true;
        if (this.lastMessageIndex === -1) {
          this.lastMessageIndex = index;
          this.processVanillaPacket(message);
        } else if (this.lastMessageIndex + 1 === index) {
          this.lastMessageIndex = index;
          this.processVanillaPacket(message);
          ++index;
          while (this.messageBuffer.has(index)) {
            message = this.messageBuffer.get(index);
            this.messageBuffer.delete(index);
            this.lastMessageIndex = index;
            this.processVanillaPacket(message);
            ++index;
          }
        } else {
          this.messageBuffer.set(index, message);
        }
      }
      processMissedPacket(packet) {
        this.processIndexedMessage(parseInt(packet), WebsocketStreamHandler.MISSING_MESSAGE);
      }
      processVanillaPacket(packet) {
        if (packet == WebsocketStreamHandler.MISSING_MESSAGE) {
          this.missedPackets++;
        }
        if (!this.options.rawMessage) {
          try {
            packet = JSON.parse(packet);
          } catch (exception) {
            if (!this.options.parseMayFail) {
              console.error("WebsocketStreamHandler: Failed to parse ", packet, " on stream ", this.streamName, " Exception:", exception.message);
              return;
            }
          }
        }
        this.dispatch(packet);
      }
      processIndexedPacket(packet) {
        let firstSpace = packet.indexOf(" ");
        let message, index;
        if (firstSpace > 0) {
          index = parseInt(packet.substring(0, firstSpace).trim());
          message = packet.substring(firstSpace + 1).trim();
        } else {
          console.error("WebsocketStreamHandler: Could not process indexed stream packet: " + packet);
          return;
        }
        this.processIndexedMessage(index, message);
      }
      haveIndex() {
        return this.isIndexed;
      }
      getLastIndex() {
        return this.lastMessageIndex;
      }
    }
    WebsocketStreamHandler.NONE = Symbol();
    WebsocketStreamHandler.SUBSCRIBING = Symbol();
    WebsocketStreamHandler.SUBSCRIBED = Symbol();
    WebsocketStreamHandler.UNSUBSCRIBED = Symbol();
    WebsocketStreamHandler.MISSING_MESSAGE = "INVALID_MESSAGE_MISSING_FROM_ROLLING_WINDOW";

    const DEFAULT_HEARTBEAT_MESSAGE = "-heartbeat-city-";

    var _WebsocketSubscriber;
    function splitPayload(str) {
      const delimitedIndex = str.indexOf(" ");
      if (delimitedIndex <= 0) {
        return [str, null];
      }
      return [str.substring(0, delimitedIndex), str.substring(delimitedIndex + 1).trim()];
    }

    // TODO cleanup & simplify
    class WebsocketSubscriber extends Dispatchable {
      constructor(urls) {
        super();
        this.streamHandlers = new Map();
        this.attemptedConnect = false;
        this.connectionStatus = WebsocketSubscriber.ConnectionStatus.NONE;
        this.websocket = null;
        this.failedReconnectAttempts = 0;
        this.numConnectionAttempts = 0;
        this.retryDefaultTimeout = 3000;
        this.retryMaxTimeout = 30000;
        this.heartbeatMessage = DEFAULT_HEARTBEAT_MESSAGE;
        this.urls = void 0;
        this.reconnectTimeout = void 0;
        this.previousFailedReconnectAttempts = void 0;
        this.urls = toArray(urls);
        //TODO: should probably try to connect right now?
      }
      setConnectionStatus(connectionStatus) {
        this.connectionStatus = connectionStatus;
        this.dispatch("connectionStatus", connectionStatus);
      }
      getNextUrl() {
        const currentURLIndex = this.numConnectionAttempts++ % this.urls.length;
        return this.urls[currentURLIndex];
      }
      connect() {
        const url = this.getNextUrl();
        this.setConnectionStatus(WebsocketSubscriber.ConnectionStatus.CONNECTING);
        try {
          console.log("WebsocketSubscriber: Connecting to " + url + " ...");
          this.websocket = new WebSocket(url);
          this.websocket.onopen = () => this.onWebsocketOpen();
          this.websocket.onmessage = event => this.onWebsocketMessage(event);
          this.websocket.onerror = event => this.onWebsocketError(event);
          this.websocket.onclose = event => this.onWebsocketClose(event);
        } catch (e) {
          this.tryReconnect();
          console.error("WebsocketSubscriber: Failed to connect to ", url, "\nError: ", e.message);
        }
      }
      calcRetryTimeout(numFailedAttempts) {
        return Math.min(this.retryDefaultTimeout * numFailedAttempts, this.retryMaxTimeout);
      }
      tryReconnect() {
        const reconnectWait = this.calcRetryTimeout(this.failedReconnectAttempts);
        this.failedReconnectAttempts++;
        if (!this.reconnectTimeout) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = undefined;
            console.log("WebsocketSubscriber: Trying to reconnect websocket connection");
            this.connect();
          }, reconnectWait);
        }
      }
      subscribe(streamName) {
        // TODO: make sure to not explicitly support streams with spaces in the name
        console.log("WebsocketSubscriber: Subscribing to stream ", streamName);
        if (!this.attemptedConnect) {
          this.connect();
          this.attemptedConnect = true;
        }
        if (this.streamHandlers.has(streamName)) {
          console.warn("WebsocketSubscriber: Already subscribed to stream ", streamName);
          return this.streamHandlers.get(streamName);
        }
        let streamHandler = new WebsocketStreamHandler(this, streamName);
        this.streamHandlers.set(streamName, streamHandler);

        // Check if the websocket connection is open, to see if we can send the subscription now
        if (this.isOpen()) {
          this.sendSubscribe(streamName);
        }
        return streamHandler;
      }
      isOpen() {
        return this.websocket?.readyState === 1;
      }
      sendSubscribe(streamName) {
        if (this.isOpen()) {
          this.send("s " + streamName);
        }
      }
      sendResubscribe(streamName, index) {
        if (this.isOpen()) {
          this.send("r " + index + " " + streamName);
        }
      }
      resubscribe() {
        // Iterate over all streams and resubscribe to them
        for (let streamHandler of this.streamHandlers.values()) {
          streamHandler.sendSubscribe();
        }
      }
      onStreamSubscribe(streamName) {
        const streamHandler = this.getStreamHandler(streamName);
        if (!streamHandler) {
          console.error("WebsocketSubscriber: received subscribe success response for unrequested stream ", streamName);
          return;
        }
        console.log("WebsocketSubscriber: Successfully subscribed to stream", streamName);
        streamHandler.setStatusSubscribed();
      }
      onWebsocketOpen() {
        this.previousFailedReconnectAttempts = this.failedReconnectAttempts;
        this.failedReconnectAttempts = 0;
        console.log("WebsocketSubscriber: Websocket connection established!");
        this.reset();
        this.setConnectionStatus(WebsocketSubscriber.ConnectionStatus.CONNECTED);
        this.resubscribe();
      }
      handleMessageWithoutListeners(streamName, message) {
        console.error("No handler for websocket stream", streamName);
      }
      handleServerError(payload) {
        console.error("Websocket error:", payload);
        const [errorType, details] = splitPayload(payload);
        if (errorType === "invalidSubscription") {
          // Stop trying to resubscribe to a stream that's been rejected by the server
          const streamHandler = this.getStreamHandler(details);
          if (streamHandler) {
            // TODO: set permission denied explicitly?
            streamHandler.clearResubscribeTimeout();
          }
        }
      }
      handleStreamMessage(payload) {
        const [streamName, message] = splitPayload(payload);
        if (message == null) {
          console.error("Could not process stream packet", payload);
          return;
        }
        const streamHandler = this.streamHandlers.get(streamName);
        if (!streamHandler) {
          this.handleMessageWithoutListeners(streamName, message);
          return;
        }
        streamHandler.processPacket(message);
      }
      handleServerClose(payload) {
        this.failedReconnectAttempts = this.previousFailedReconnectAttempts || 0;
        console.error("WebsocketSubscriber: server fatal error close: ", payload);
        this.onWebsocketError(payload);
      }
      onWebsocketMessage(event) {
        const {
          data
        } = event;
        if (data === this.heartbeatMessage) {
          // TODO: keep track of the last heartbeat timestamp
          return;
        }
        const [type, payload] = splitPayload(data);
        if (type === "e" || type === "error") {
          // error
          this.handleServerError(payload);
        } else if (type === "s") {
          // subscribed
          this.onStreamSubscribe(payload);
        } else if (type === "m") {
          // stream message
          this.handleStreamMessage(payload);
        } else if (type === "c") {
          // command
          this.dispatch("serverCommand", payload);
        } else if (type == "close") {
          this.handleServerClose(payload);
        } else {
          console.error("WebsocketSubscriber: Can't process " + event.data);
        }
      }
      reset() {
        this.setConnectionStatus(WebsocketSubscriber.ConnectionStatus.DISCONNECTED);
        for (const streamHandler of this.streamHandlers.values()) {
          streamHandler.resetStatus();
        }
      }
      onWebsocketError(event) {
        console.error("WebsocketSubscriber: Websocket connection is broken!");
        this.reset();
        this.tryReconnect();
      }
      onWebsocketClose(event) {
        console.log("WebsocketSubscriber: Connection closed!");
        this.reset();
        this.tryReconnect();
      }
      send(message) {
        // TODO: if the websocket is not open, enqueue WebsocketSubscriber message to be sent on open or just fail?
        this.websocket.send(message);
      }
      getStreamHandler(streamName) {
        const streamHandler = this.streamHandlers.get(streamName);
        if (!streamHandler) {
          return null;
        }
        return streamHandler;
      }

      // this should be pretty much the only external function
      addStreamListener(streamName, callback) {
        let streamHandler = this.getStreamHandler(streamName);
        if (!streamHandler) {
          streamHandler = this.subscribe(streamName);
        }
        if (streamHandler.callbackExists(callback)) {
          return;
        }
        streamHandler.addListener(callback);
      }
      removeStreamListener(streamName, callback) {
        const streamHandler = this.streamHandlers.get(streamName);
        if (streamHandler) {
          streamHandler.removeListener(callback);
        }
      }
      static addListener(streamName, callback) {
        return this.Global.addStreamListener(streamName, callback);
      }
    }
    _WebsocketSubscriber = WebsocketSubscriber;
    WebsocketSubscriber.ConnectionStatus = {
      NONE: 0,
      CONNECTING: 1,
      CONNECTED: 2,
      DISCONNECTED: 3
    };
    // TODO sync globally cleaner
    WebsocketSubscriber.Global = self.WEBSOCKET_URL ? new _WebsocketSubscriber(self.WEBSOCKET_URL) : null;

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */

    function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
      function accept(f) {
        if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
        return f;
      }
      var kind = contextIn.kind,
        key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
      var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
      var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
      var _,
        done = false;
      for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) {
          if (done) throw new TypeError("Cannot add initializers after decoration has completed");
          extraInitializers.push(accept(f || null));
        };
        var result = (0, decorators[i])(kind === "accessor" ? {
          get: descriptor.get,
          set: descriptor.set
        } : descriptor[key], context);
        if (kind === "accessor") {
          if (result === void 0) continue;
          if (result === null || typeof result !== "object") throw new TypeError("Object expected");
          if (_ = accept(result.get)) descriptor.get = _;
          if (_ = accept(result.set)) descriptor.set = _;
          if (_ = accept(result.init)) initializers.unshift(_);
        } else if (_ = accept(result)) {
          if (kind === "field") initializers.unshift(_);else descriptor[key] = _;
        }
      }
      if (target) Object.defineProperty(target, contextIn.name, descriptor);
      done = true;
    }
    function __runInitializers(thisArg, initializers, value) {
      var useValue = arguments.length > 2;
      for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
      }
      return useValue ? value : void 0;
    }
    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
      var e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    // Tries to be a more flexible implementation of fetch()
    // Still work in progress
    // Parse the headers from an xhr object, to return a native Headers object
    function parseHeaders(xhr) {
      const rawHeader = xhr.getAllResponseHeaders() || "";
      const rawHeaderLines = rawHeader.split(/\r?\n/);
      const headers = new Headers();
      for (let line of rawHeaderLines) {
        const parts = line.split(":");
        const key = parts.shift().trim();
        if (key) {
          let value = parts.join(":").trim();
          headers.append(key, value);
        }
      }
      return headers;
    }
    // Creates a new URLSearchParams object from a plain object
    // Fields that are arrays are spread
    function getURLSearchParams(data, arrayKeySuffix = "[]") {
      if (!isPlainObject(data)) {
        return data;
      }
      const urlSearchParams = new URLSearchParams();
      for (const key of Object.keys(data)) {
        const value = data[key];
        if (Array.isArray(value)) {
          for (let instance of value) {
            urlSearchParams.append(key + arrayKeySuffix, instance);
          }
        } else {
          urlSearchParams.set(key, value);
        }
      }
      return urlSearchParams;
    }
    // Appends search parameters from an object to a given URL or Request, and returns the new URL
    function composeURL(url, urlSearchParams) {
      let urlString;
      if (typeof url === 'object' && 'url' in url) {
        urlString = url.url;
      } else {
        urlString = url;
      }
      // TODO: also extract the preexisting arguments in the url
      if (urlSearchParams) {
        urlString += "?" + urlSearchParams;
      }
      return urlString;
    }
    class XHRPromise {
      constructor(request, options = {}) {
        this.options = void 0;
        this.request = void 0;
        this.xhr = void 0;
        this.promise = void 0;
        this.promiseResolve = void 0;
        this.promiseReject = void 0;
        this._chained = void 0;
        request = new Request(request, options);
        let xhr = new XMLHttpRequest();
        this.options = options;
        this.request = request;
        this.xhr = xhr;
        this.promise = new Promise((resolve, reject) => {
          this.promiseResolve = resolve;
          this.promiseReject = reject;
          xhr.onload = () => {
            let headers = this.getResponseHeaders();
            let body = xhr.response || xhr.responseText;
            let responseInit = {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: headers,
              url: xhr.responseURL || headers.get("X-Request-URL")
            };
            let response = new Response(body, responseInit);
            // In case dataType is "arrayBuffer", "blob", "formData", "json", "text"
            // Response has methods to return these as promises
            if (typeof response[options.dataType] === "function") {
              const responsePromise = response[options.dataType]();
              // TODO: should whitelist dataType to json, blob
              responsePromise.then(data => {
                this.resolve(data);
              }, err => {
                this.reject(err);
              });
            } else {
              this.resolve(response);
            }
          };
          // TODO: also dispatch all arguments here on errors
          xhr.onerror = () => {
            this.reject(new TypeError("Network error"));
          };
          // TODO: need to have an options to pass setting to xhr (like timeout value)
          xhr.ontimeout = () => {
            this.reject(new TypeError("Network timeout"));
          };
          xhr.open(request.method, request.url, true);
          const {
            onUploadProgress,
            onDownloadProgress
          } = this.options;
          if (onUploadProgress) {
            xhr.upload.onprogress = onUploadProgress;
          }
          if (onDownloadProgress) {
            xhr.onprogress = onDownloadProgress;
          }
          if (request.credentials === "include") {
            xhr.withCredentials = true;
          }
          // TODO: come back to this
          xhr.responseType = "blob";
          let isApplicationTypeJson = false;
          request.headers.forEach((value, name) => {
            if (options.body instanceof FormData && name.toLowerCase() === "content-type") {
              return;
            }
            // check if the request in JSON object based on headers
            if (value === "application/json" && name.toLowerCase() === "content-type") {
              isApplicationTypeJson = true;
            }
            xhr.setRequestHeader(name, value);
          });
          // TODO: there's no need to send anything on a GET or HEAD
          if (options.body instanceof FormData) {
            this.send(options.body);
          } else if (isApplicationTypeJson) {
            // if the request has a JSON body, convert object body to JSON and sent it.
            this.send(JSON.stringify(options.body));
          } else {
            request.blob().then(blob => {
              // The blob can be a FormData when we're polyfilling the Request class
              const body = blob instanceof FormData || blob.size ? blob : null;
              this.send(body);
            });
          }
        });
      }
      getResponseHeaders() {
        return parseHeaders(this.xhr);
      }
      send(body) {
        this.getXHR().send(body);
      }
      getPostprocessors() {
        return this.options.postprocessors || fetch.defaultPostprocessors;
      }
      getErrorPostprocessors() {
        return this.options.errorPostprocessors || fetch.defaultErrorPostprocessors;
      }
      resolve(payload) {
        for (const postprocessor of this.getPostprocessors()) {
          try {
            payload = postprocessor(payload, this) || payload;
          } catch (exception) {
            this.reject(exception);
            return;
          }
        }
        if (this.options.onSuccess) {
          this.options.onSuccess(...arguments);
        } else {
          this.promiseResolve(...arguments);
        }
        if (this.options.onComplete) {
          this.options.onComplete();
        }
      }
      reject(error) {
        for (const postprocessor of this.getErrorPostprocessors()) {
          error = postprocessor(error) || error;
        }
        if (this.options.onError) {
          this.options.onError(error);
        } else {
          if (this._chained) {
            this.promiseReject(error);
          } else {
            if (this.options.errorHandler) {
              this.options.errorHandler(error);
            } else {
              console.error("Unhandled fetch error", error);
            }
          }
        }
        if (this.options.onComplete) {
          this.options.onComplete();
        }
      }
      // TODO: next 2 functions should throw an exception if you have onSuccess/onError
      then(onResolve, onReject) {
        this._chained = true;
        onReject = onReject || this.options.errorHandler;
        return this.getPromise().then(onResolve, onReject);
      }
      catch(onReject) {
        this._chained = true;
        return this.getPromise().catch(onReject);
      }
      getXHR() {
        return this.xhr;
      }
      getPromise() {
        return this.promise;
      }
      getRequest() {
        return this.request;
      }
      abort() {
        this.getXHR().abort();
      }
      addXHRListener(name, callback, ...args) {
        this.getXHR().addEventListener(name, callback, ...args);
      }
      addProgressListener(callback, ...args) {
        this.addXHRListener("progress", callback, ...args);
      }
    }
    // TODO: this offers only partial compatibility with $.ajax, remove
    function jQueryCompatibilityPreprocessor(options) {
      if (options.type) {
        options.method = options.type.toUpperCase();
      }
      const headers = options.headers;
      headers.set("X-Requested-With", "XMLHttpRequest");
      if (options.contentType) {
        headers.set("Content-Type", options.contentType);
      }
      if (isPlainObject(options.data)) {
        let method = options.method.toUpperCase();
        if (method === "GET" || method === "HEAD") {
          options.urlParams = options.urlParams || options.data;
          // TODO @types at the end we shouldn't need this anymore
          if (options.cache === false) {
            options.urlParams = getURLSearchParams(options.urlParams, options.arraySearchParamSuffix);
            options.urlParams.set("_", Date.now());
          }
        } else {
          let formData = new FormData();
          for (const key of Object.keys(options.data)) {
            const value = options.data[key];
            if (Array.isArray(value)) {
              for (const arrayValue of value) {
                formData.append(key + "[]", arrayValue);
              }
            } else {
              formData.append(key, value);
            }
          }
          options.body = formData;
        }
      } else {
        options.body = options.body || options.data;
      }
      return options;
    }
    // Can either be called with
    // - 1 argument: (Request)
    // - 2 arguments: (url/Request, options)
    function fetch(input, ...args) {
      // In case we're being passed in a single plain object (not Request), assume it has a url field
      if (isPlainObject(input)) {
        return fetch(input.url, input, ...args);
      }
      let options = Object.assign({}, ...args);
      // Ensure that there's a .headers field for preprocessors
      options.headers = new Headers(options.headers || {});
      const preprocessors = options.preprocessors || fetch.defaultPreprocessors || [];
      for (const preprocessor of preprocessors) {
        options = preprocessor(options, input) || options;
      }
      options.onSuccess = options.onSuccess || options.success;
      options.onError = options.onError || options.error;
      options.onComplete = options.onComplete || options.complete;
      if (typeof options.cache === "boolean") {
        options.cache = options.cache ? "force-cache" : "reload";
        // TODO: cache still isn't fully done
      }
      options.method = options.method || "GET";
      // If there are any url search parameters, update the url from the urlParams or urlSearchParams fields
      // These fields can be plain objects (jQuery style) or can be URLSearchParams objects
      const urlParams = options.urlParams || options.urlSearchParams;
      if (urlParams) {
        // Change the URL of the request to add a query
        const urlSearchParams = getURLSearchParams(urlParams, options.arraySearchParamSuffix);
        if (input instanceof Request) {
          input = new Request(composeURL(input.url, urlSearchParams), input);
        } else {
          input = new Request(composeURL(input, urlSearchParams), {});
        }
      }
      // TODO @types is this that safe?
      return new XHRPromise(input, options);
    }
    fetch.defaultPreprocessors = [];
    fetch.defaultPostprocessors = [];
    fetch.defaultErrorPostprocessors = [];
    fetch.polyfill = true;

    class AjaxHandler {
      constructor(ajaxHandler, errorHandler = null) {
        this.parentHandler = void 0;
        this.preprocessors = void 0;
        this.postprocessors = void 0;
        this.errorPostprocessors = void 0;
        this.errorHandler = void 0;
        if (this.constructor._baseAjax === null) {
          this.constructor._baseAjax = this;
        } else if (arguments.length === 0) {
          ajaxHandler = this.constructor._baseAjax;
        }
        this.parentHandler = ajaxHandler;
        this.preprocessors = ajaxHandler ? [] : Array.from(fetch.defaultPreprocessors);
        this.postprocessors = ajaxHandler ? [] : Array.from(fetch.defaultPostprocessors);
        this.errorPostprocessors = ajaxHandler ? [] : Array.from(fetch.defaultErrorPostprocessors);
        this.errorHandler = errorHandler;
      }
      fetch(request, ...args) {
        if (!request) {
          console.error("Missing request for fetch");
          return;
        }
        const baseOptions = {
          preprocessors: this.getPreprocessors(),
          postprocessors: this.getPostprocessors(),
          errorPostprocessors: this.getErrorPostprocessors(),
          errorHandler: this.getErrorHandler()
        };
        // Request may be a plain object or a url, not going to duplicate code from fetch
        for (const key of Object.keys(baseOptions)) {
          if (typeof request === 'object' && request[key]) {
            delete baseOptions[key];
          }
        }
        return fetch(request, baseOptions, ...args);
      }
      request(request, ...args) {
        return this.fetch(request, ...args);
      }
      // Feel free to modify the post and get methods for your needs
      get(url, ...args) {
        return this.fetch(url, ...args, {
          method: "GET"
        });
      }
      getJSON(url, data, ...args) {
        return this.get(url, {
          dataType: "json",
          data: data
        }, ...args);
      }
      post(url, ...args) {
        return this.fetch(url, ...args, {
          method: "POST"
        });
      }
      postJSON(url, data, ...args) {
        return this.post(url, {
          dataType: "json",
          data: data
        }, ...args);
      }
      addPreprocessor(preprocessor) {
        this.preprocessors.push(preprocessor);
      }
      getPreprocessors() {
        const inherited = this.parentHandler?.getPreprocessors() || [];
        return [...this.preprocessors, ...inherited];
      }
      addPostprocessor(postprocessor) {
        this.postprocessors.push(postprocessor);
      }
      getPostprocessors() {
        const inherited = this.parentHandler?.getPostprocessors() || [];
        return [...inherited, ...this.postprocessors];
      }
      addErrorPostprocessor(postprocessor) {
        this.errorPostprocessors.push(postprocessor);
      }
      getErrorPostprocessors() {
        const inherited = this.parentHandler?.getErrorPostprocessors() || [];
        return [...inherited, ...this.errorPostprocessors];
      }
      getErrorHandler() {
        return this.errorHandler || this.parentHandler?.getErrorHandler();
      }
    }
    AjaxHandler._baseAjax = null;
    class FixedURLAjaxHandler {
      constructor(url, ajaxHandler = Ajax, errorHandler = null) {
        this.url = void 0;
        this.ajax = void 0;
        this.ajax = new AjaxHandler(ajaxHandler, errorHandler);
        this.url = url;
      }
      get(...args) {
        return this.ajax.get(this.url, ...args);
      }
      getJSON(data, ...args) {
        return this.ajax.getJSON(this.url, data, ...args);
      }
      post(...args) {
        return this.ajax.post(this.url, ...args);
      }
      postJSON(data, ...args) {
        return this.ajax.postJSON(this.url, data, ...args);
      }
    }
    const Ajax = new AjaxHandler();

    const FetchStoreMixin = (objectType, storeOptions = {}, BaseClass) => {
      var _AjaxFetchStore;
      return (// @ts-ignore
        _AjaxFetchStore = class AjaxFetchStore extends BaseStore(objectType, storeOptions, BaseClass) {
          static async fetch(id, fetchOptions = {}) {
            return new Promise((resolve, reject) => {
              this.fetchSync(id, resolve, reject, fetchOptions);
            });
          }
          // TODO Deprecate this and move to only fetch
          static fetchSync(id, successCallback, errorCallback, fetchOptions = {}) {
            if (!fetchOptions.force) {
              let obj = this.get(id);
              if (obj) {
                successCallback(obj);
                return;
              }
            }
            this.fetchJobs.push({
              id: id,
              success: successCallback,
              error: errorCallback,
              ...fetchOptions
            });
            if (!this.fetchTimeout) {
              this.fetchTimeout = setTimeout(() => {
                this.executeAjaxFetch();
              }, this.fetchTimeoutDuration);
            }
          }
          static getFetchRequestData(entries) {
            return {
              ids: entries.map(entry => entry[0])
            };
          }
          static getFetchRequestObject(entries) {
            const requestData = this.getFetchRequestData(entries);
            const fetchJobs = unwrapArray(entries.map(entry => entry[1]));
            return {
              url: this.fetchURL,
              type: this.fetchType,
              dataType: "json",
              data: requestData,
              cache: "no-cache",
              success: data => {
                GlobalState.load(data);
                for (let fetchJob of fetchJobs) {
                  let obj = this.get(fetchJob.id);
                  if (obj) {
                    fetchJob.success(obj);
                  } else {
                    console.error("Failed to fetch object ", fetchJob.id, " of type ", this.objectType);
                    if (fetchJob.error) {
                      fetchJob.error();
                    }
                  }
                }
              },
              error: error => {
                console.error("Failed to fetch objects of type ", this.objectType, ":\n", error);
                for (let fetchJob of fetchJobs) {
                  if (fetchJob.error) {
                    fetchJob.error(error);
                  }
                }
              }
            };
          }
          //returns an array of ajax requests that have to be executed
          static getFetchRequests(fetchJobs) {
            const idFetchJobs = new Map();
            for (const fetchJob of fetchJobs) {
              let objectId = fetchJob.id;
              if (!idFetchJobs.has(objectId)) {
                idFetchJobs.set(objectId, []);
              }
              idFetchJobs.get(objectId).push(fetchJob);
            }
            const maxChunkSize = this.maxFetchObjectCount;
            const fetchChunks = splitInChunks(Array.from(idFetchJobs.entries()), maxChunkSize);
            return fetchChunks.map(chunkEntries => this.getFetchRequestObject(chunkEntries));
          }
          static executeAjaxFetch() {
            const fetchJobs = this.fetchJobs;
            this.fetchJobs = [];
            const requests = this.getFetchRequests(fetchJobs);
            for (const requestObject of requests) {
              Ajax.fetch(requestObject);
            }
            clearTimeout(this.fetchTimeout);
            this.fetchTimeout = undefined;
          }
        }, _AjaxFetchStore.fetchJobs = [], _AjaxFetchStore.fetchTimeout = void 0, _AjaxFetchStore.fetchTimeoutDuration = storeOptions.fetchTimeoutDuration || 50, _AjaxFetchStore.fetchURL = storeOptions.fetchURL || "", _AjaxFetchStore.fetchType = storeOptions.fetchType || "GET", _AjaxFetchStore.maxFetchObjectCount = storeOptions.maxFetchObjectCount || 256, _AjaxFetchStore
      );
    };

    let Country = (_Class => {
      let _classDecorators = [globalStore];
      let _classDescriptor;
      let _classExtraInitializers = [];
      let _classThis;
      let _classSuper = BaseStore("Country");
      var _Country = (_Class = class Country extends _classSuper {
        toString() {
          return this.name;
        }
        getIsoCode() {
          return this.isoCode;
        }
        getEmojiName() {
          return "flag_" + this.getIsoCode().toLowerCase();
        }
        getUnicodeEmoji() {
          return this.isoCode.toUpperCase().split("").map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join("");
        }
        static allWithNone(noneName = "None") {
          return [NO_COUNTRY_PLACEHOLDER(noneName), this.all()];
        }
        static getCountriesFromIds(countriesIds, allCountries = true) {
          const countries = [];
          for (const countryId of countriesIds) {
            countries.push(this.get(countryId));
          }
          const result = countries.filter(isNotNull).sort(_Country.comparator);
          if (allCountries) {
            result.unshift(ALL_COUNTRIES_PLACEHOLDER);
          }
          return result;
        }
      }, _classThis = _Class, (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = {
          value: _classThis
        }, _classDecorators, {
          kind: "class",
          name: _classThis.name,
          metadata: _metadata
        }, null, _classExtraInitializers);
        _Country = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata
        });
      })(), _Class.comparator = (a, b) => a.name > b.name ? 1 : -1, __runInitializers(_classThis, _classExtraInitializers), _Class);
      return _Country = _classThis;
    })();
    const ALL_COUNTRIES_PLACEHOLDER = new Country({
      id: 0,
      name: "All Countries",
      isCode: "-"
    });
    const NO_COUNTRY_PLACEHOLDER = noneName => new Country({
      id: -1,
      name: noneName,
      isoCode: "-"
    });

    let User = (_Class => {
      let _classDecorators = [globalStore];
      let _classDescriptor;
      let _classExtraInitializers = [];
      let _classThis;
      let _classSuper = BaseStore("user");
      (_Class = class User extends _classSuper {
        constructor(...args) {
          super(...args);
          this.taskSummaries = new Map();
          this.timeouts = new Map();
        }
        getName() {
          return this.name;
        }
        getCustomSetting(key, defaultValue) {
          const keyChain = key.split(":");
          let currentDict = this.customSettings;
          for (const keyPart of keyChain) {
            if (keyPart in currentDict) {
              currentDict = currentDict[keyPart];
            } else {
              return defaultValue;
            }
          }
          return currentDict;
        }
        getParsedCustomSetting(key, defaultValue) {
          return JSON.parse(this.getCustomSetting(key, defaultValue));
        }
        setCustomSetting(key, value) {
          const keyChain = key.split(":");
          const lastKey = keyChain.pop();
          if (!this.customSettings) {
            this.customSettings = {};
          }
          let currentDict = this.customSettings;
          for (const keyPart of keyChain) {
            if (!(keyPart in currentDict)) {
              currentDict[keyPart] = {};
            }
            currentDict = currentDict[keyPart];
          }
          currentDict[lastKey] = value;
          const event = {
            key: key,
            rawValue: value,
            origin: "set"
          };
          try {
            event.value = JSON.parse(value);
          } catch (e) {
            event.value = value;
          }
          this.dispatch("updateCustomSetting", event);
        }
        saveCustomSetting(key, value) {
          if (this.id != USER.id) {
            console.error("Invalid user");
            return;
          }
          this.dispatch("updateCustomSetting", {
            key: key,
            value: value,
            origin: "save"
          });
          const request = {
            customSettingsKey: key,
            customSettingsValue: value
          };
          if (this.timeouts.has(key)) {
            clearTimeout(this.timeouts.get(key));
          }
          this.timeouts.set(key, setTimeout(() => {
            Ajax.postJSON("/accounts/profile_changed/", request).then();
          }, 100));
        }
        applyEvent(event) {
          if (event.type === "setCustomSetting") {
            console.log("Updated custom settings: ", event);
            this.setCustomSetting(event["data"].key, event["data"].value);
          } else {
            super.applyEvent(event);
          }
        }
        getCodeFontSize() {
          return this.getParsedCustomSetting("workspace:codeFontSize", 14);
        }
        getFileFontSize() {
          return this.getParsedCustomSetting("workspace:fileFontSize", 14);
        }
        getTabSize() {
          return this.getParsedCustomSetting("workspace:tabSize", 4);
        }
        getShowLineNumber() {
          return this.getParsedCustomSetting("workspace:showLineNumber", true);
        }
        getShowPrintMargin() {
          return this.getParsedCustomSetting("workspace:showPrintMargin", false);
        }
        getPrintMarginSize() {
          return this.getParsedCustomSetting("workspace:printMarginSize", 80);
        }
        getBasicAutocompletionStatus() {
          return this.getParsedCustomSetting("workspace:enableBasicAutocompletion", true);
        }
        getLiveAutocompletionStatus() {
          return this.getParsedCustomSetting("workspace:enableLiveAutocompletion", true);
        }
        getSnippetsStatus() {
          return this.getParsedCustomSetting("workspace:enableSnippets", false);
        }
        getShowTagsInArchive(archiveId) {
          return this.getParsedCustomSetting("archive:showTags-" + archiveId, false);
        }
        static getCurrentUser() {
          return USER;
        }
      }, _classThis = _Class, (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = {
          value: _classThis
        }, _classDecorators, {
          kind: "class",
          name: _classThis.name,
          metadata: _metadata
        }, null, _classExtraInitializers);
        _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata
        });
        __runInitializers(_classThis, _classExtraInitializers);
      })(), _Class);
      return _classThis;
    })();
    let PublicUser = (_Class2 => {
      let _classDecorators = [globalStore];
      let _classDescriptor;
      let _classExtraInitializers = [];
      let _classThis;
      let _classSuper = FetchStoreMixin("PublicUser", {
        fetchTimeoutDuration: 20,
        maxFetchObjectCount: 512,
        fetchURL: "/accounts/public_user_profiles/"
      });
      (_Class2 = class PublicUser extends _classSuper {
        getDisplayHandle() {
          let name;
          if (this.displayName) {
            name = this.name || this.username;
          } else {
            name = this.username || this.name;
          }
          return name || "user-" + this.id;
        }
        getProfileUrl() {
          if (this.username) {
            return "/user/" + this.username;
          } else {
            return "/userid/" + this.id;
          }
        }
        getRating() {
          return this.rating;
        }
        getCountry() {
          return Country.get(this.countryId);
        }
        static getCountries() {
          const countryIds = new Set();
          const users = this.all();
          for (const user of users) {
            if (user && user.countryId && !countryIds.has(user.countryId)) {
              countryIds.add(user.countryId);
            }
          }
          return Country.getCountriesFromIds(countryIds);
        }
      }, _classThis = _Class2, (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = {
          value: _classThis
        }, _classDecorators, {
          kind: "class",
          name: _classThis.name,
          metadata: _metadata
        }, null, _classExtraInitializers);
        _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata
        });
        __runInitializers(_classThis, _classExtraInitializers);
      })(), _Class2);
      return _classThis;
    })();
    window.USER = Object.assign({
      id: 0,
      customSettings: {}
    }, window.USER || {});
    window.USER = User.create(window.USER);
    let UserNotification = (_Class3 => {
      let _classDecorators = [globalStore];
      let _classDescriptor;
      let _classExtraInitializers = [];
      let _classThis;
      let _classSuper = BaseStore("UserNotification", {
        dependencies: ["user"]
      });
      (_Class3 = class UserNotification extends _classSuper {
        getUser() {
          return User.get(this.userId);
        }
        isRead() {
          const user = this.getUser();
          return user ? Number(this.id) <= (user.lastReadNotificationId || 0) : false;
        }
      }, _classThis = _Class3, (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = {
          value: _classThis
        }, _classDecorators, {
          kind: "class",
          name: _classThis.name,
          metadata: _metadata
        }, null, _classExtraInitializers);
        _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata
        });
        __runInitializers(_classThis, _classExtraInitializers);
      })(), _Class3);
      return _classThis;
    })();

    var _class$2F, _Tag;
    let Tag = globalStore(_class$2F = (_Tag = class Tag extends BaseStore("Tag") {
      toString() {
        let result = this.name;
        const parent = this.getParent();
        if (parent) {
          result = parent + " - " + result;
        }
        return result;
      }
      getParent() {
        return Tag.get(this.parentId);
      }
      getDepth() {
        let depth = -1;
        let tag = this;
        while (tag) {
          tag = tag.getParent();
          depth += 1;
        }
        return depth;
      }
      static getTagByName(name) {
        if (!this._caseSensitiveCache) {
          this._caseSensitiveCache = new Map();
        }
        if (this._caseSensitiveCache.has(name)) {
          return this._caseSensitiveCache.get(name) || null;
        }
        for (const tag of this.all()) {
          if (tag.name === name) {
            this._caseSensitiveCache.set(name, tag);
            return tag;
          }
        }
        return null;
      }
      static getTagByNameInsensitive(name) {
        const lowerCaseName = name.toLocaleLowerCase();
        if (!this._caseInsensitiveCache) {
          this._caseInsensitiveCache = new Map();
        }
        if (this._caseInsensitiveCache.has(lowerCaseName)) {
          return this._caseInsensitiveCache.get(lowerCaseName) || null;
        }
        for (const tag of this.all()) {
          if (tag.name.toLocaleLowerCase() === lowerCaseName) {
            this._caseInsensitiveCache.set(name, tag);
            return tag;
          }
        }
        return null;
      }
    }, _Tag._caseSensitiveCache = void 0, _Tag._caseInsensitiveCache = void 0, _Tag)) || _class$2F;

    const extraLanguageAttributes = [[1, {
      enforcedTemplateComment: '/* \n * ATTENTION!\n * This task does not have an enforced\n * template in this language!\n *\n * However, you can still submit any custom code.\n */\n\n',
      compiler: "g++ 14.2.0",
      comment: "Compiled with `g++ -static -O2 -lm -Wall -Wno-unused-result -std=c++2b -DCS_ACADEMY -DONLINE_JUDGE`.\nBoost 1.83.0 is available.",
      alternativeExtensions: ["h", "hpp"]
    }],
    // Plain C
    [13, {
      enforcedTemplateComment: '/* \n * ATTENTION!\n * This task does not have an enforced\n * template in this language!\n *\n * However, you can still submit any custom code.\n */\n\n',
      compiler: "gcc 14.2.0",
      comment: "Compiled with `gcc -O2 -lm -Wall -Wno-unused-result -DCS_ACADEMY -DONLINE_JUDGE`"
    }], [2, {
      enforcedTemplateComment: '/* \n * ATTENTION!\n * This task does not have an enforced\n * template in this language!\n *\n * However, you can still submit any custom code.\n */\n\n',
      compiler: "OpenJDK Java 21",
      comment: "Run with `java -Xmx4g -Xss256m -DONLINE_JUDGE -DCS_ACADEMY Main`"
    }], [4, {
      enforcedTemplateComment: '"""\n ATTENTION!\n This task does not have an enforced\n template in this language!\n \n However, you can still submit any custom code.\n"""\n\n',
      comment: "Comes with `numpy` and `scipy` modules",
      compiler: "Python 3.13.3"
    }],
    // Pypy3
    [29, {
      compiler: "Python 3.11.11, PyPy 7.9.13"
    }], [3, {
      enforcedTemplateComment: '"""\n ATTENTION!\n This task does not have an enforced\n template in this language!\n \n However, you can still submit any custom code.\n"""\n\n',
      compiler: "Python 2.7.18"
    }], [10, {
      enforcedTemplateComment: '# ATTENTION!\n# This task does not have an enforced\n# template in this language!\n# \n# However, you can still submit any custom code.\n\n',
      compiler: "Ruby 3.1.2p20"
    }], [11, {
      enforcedTemplateComment: '# ATTENTION!\n# This task does not have an enforced\n# template in this language!\n# \n# However, you can still submit any custom code.\n\n',
      compiler: "Perl 5.36.0"
    }], [5, {
      enforcedTemplateComment: '/* \n * ATTENTION!\n * This task does not have an enforced\n * template in this language!\n *\n * However, you can still submit any custom code.\n */\n\n',
      compiler: "Mono 6.8.0.105",
      comment: "Compiled with `mcs -define:ONLINE_JUDGE -define:CS_ACADEMY`"
    }], [14, {
      enforcedTemplateComment: '/*\n * ATTENTION!\n * This task does not have an enforced\n * template in this language!\n *\n * However, you can still submit any custom code.\n */\n\n',
      compiler: "gcc 14.2.0",
      comment: "Compiled with `gcc -DCS_ACADEMY -DONLINE_JUDGE -I 'gnustep-config --variable=GNUSTEP_SYSTEM_HEADERS' -L 'gnustep-config --variable=GNUSTEP_SYSTEM_LIBRARIES' -lgnustep-base -fconstant-string-class=NSConstantString -D_NATIVE_OBJC_EXCEPTIONS -Wl,--no-as-needed -lgnustep-base -lobjc`"
    }], [26, {
      enforcedTemplateComment: '#{\n ATTENTION!\n This task does not have an enforced\n template in this language!\n \n However, you can still submit any custom code.\n#}\n\n',
      compiler: "Swift 5.0.2"
    }], [25, {
      enforcedTemplateComment: '#{\n ATTENTION!\n This task does not have an enforced\n template in this language!\n \n However, you can still submit any custom code.\n#}\n\n',
      compiler: "Go 1.19.2"
    }], [17, {
      enforcedTemplateComment: '/* \n * ATTENTION!\n * This task does not have an enforced\n * template in this language!\n *\n * However, you can still submit any custom code.\n */\n\n',
      compiler: "Node 20.18.1"
    }], [31, {
      compiler: "rustc 1.71.1"
    }], [30, {
      compiler: "kotlinc-jvm 1.4.10 (JRE 21+35-Ubuntu-1)"
    }], [32, {
      compiler: "julia 1.5.3"
    }], [8, {
      enforcedTemplateComment: '! ATTENTION!\n! This task does not have an enforced\n! template in this language!\n! \n! However, you can still submit any custom code.\n\n',
      compiler: "GNU Fortran 14.2.0",
      comment: "Compiled with `gfortran -ffree-form`"
    }], [9, {
      enforcedTemplateComment: '--[=====[\n ATTENTION!\n This task does not have an enforced\n template in this language!\n \n However, you can still submit any custom code.\n--]=====]\n\n',
      compiler: "Lua 5.2.4"
    }], [12, {
      enforcedTemplateComment: '/*\n * ATTENTION!\n * This task does not have an enforced\n * template in this language!\n *\n * However, you can still submit any custom code.\n */\n\n',
      compiler: "PHP 8.0.8"
    }], [15, {
      enforcedTemplateComment: '"\n ATTENTION!\n This task does not have an enforced\n template in this language!\n \n However, you can still submit any custom code.\n"\n\n',
      compiler: "GNU Smalltalk 3.2.5"
    }], [16, {
      enforcedTemplateComment: '(*\n * ATTENTION!\n * This task does not have an enforced\n * template in this language!\n *\n * However, you can still submit any custom code.\n *)\n\n',
      compiler: "OCaml 4.11.1"
    }], [18, {
      enforcedTemplateComment: '*> ATTENTION!\n*> This task does not have an enforced\n*> template in this language!\n*> \n*> However, you can still submit any custom code.\n\n',
      compiler: "GnuCOBOL 4.0",
      comment: "Compiled with `cobc -free -x`"
    }], [19, {
      enforcedTemplateComment: '-- ATTENTION!\n-- This task does not have an enforced\n-- template in this language!\n--\n-- However, you can still submit any custom code.\n\n',
      compiler: "GNATMAKE 10.3.0"
    }], [21, {
      enforcedTemplateComment: ';; ATTENTION!\n;; This task does not have an enforced\n;; template in this language!\n;; \n;; However, you can still submit any custom code.\n\n',
      compiler: "SBCL 2.1.1"
    }], [27, {
      enforcedTemplateComment: '#{\n ATTENTION!\n This task does not have an enforced\n template in this language!\n \n However, you can still submit any custom code.\n#}\n\n',
      compiler: "Scala 2.11.12",
      comment: "Ran with `scala -J-Xmx4g -J-Xss256m -DONLINE_JUDGE -DCS_ACADEMY Main`"
    }], [23, {
      enforcedTemplateComment: '# ATTENTION!\n# This task does not have an enforced\n# template in this language!\n# \n# However, you can still submit any custom code.\n\n',
      compiler: "TCL Shell 8.6.6"
    }], [24, {
      enforcedTemplateComment: '#{\n ATTENTION!\n This task does not have an enforced\n template in this language!\n \n However, you can still submit any custom code.\n#}\n\n',
      compiler: "GNU Octave 6.2.0"
    }], [20, {
      enforcedTemplateComment: '{\n ATTENTION!\n This task does not have an enforced\n template in this language!\n \n However, you can still submit any custom code.\n}\n\n',
      compiler: "Free Pascal 3.2.0",
      comment: "Compiled with `fpc -O2 -Sgic -viwn -Tlinux -dONLINE_JUDGE -dCS_ACADEMY -XS`",
      disabled: true
    }], [6, {
      enforcedTemplateComment: '{-\n ATTENTION!\n This task does not have an enforced\n template in this language!\n \n However, you can still submit any custom code.\n-}\n\n',
      compiler: "GHC 8.8.4",
      disabled: true
    }], [7, {
      enforcedTemplateComment: '# ATTENTION!\n# This task does not have an enforced\n# template in this language!\n#\n# However, you can still submit any custom code.\n\n',
      compiler: "Bash 5.2.15",
      disabled: true
    }], [22, {
      enforcedTemplateComment: '% ATTENTION!\n% This task does not have an enforced\n% template in this language!\n% \n% However, you can still submit any custom code.\n\n',
      compiler: "Erlang/OTP 23 [erts-11.1.8]",
      disabled: true
    }]];
    let index = 1;
    const extraLanguageAttributesMap = {};
    for (const [key, value] of extraLanguageAttributes) {
      extraLanguageAttributesMap[key] = value;
      extraLanguageAttributesMap[key].ordinal = index++;
    }
    let ProgrammingLanguage = (_Class => {
      let _classDecorators = [globalStore];
      let _classDescriptor;
      let _classExtraInitializers = [];
      let _classThis;
      let _classSuper = BaseStore("ProgrammingLanguage");
      (_Class = class ProgrammingLanguage extends _classSuper {
        constructor(obj, event) {
          super(obj, event);
          Object.assign(this, extraLanguageAttributesMap[this.id] || {});
          this.ordinal = (this.ordinal || 999) * 10000 + Number(this.id);
        }
        getDefaultSource() {
          const user = User.getCurrentUser();
          if (user) {
            return user.getCustomSetting("workspace:programmingLanguage:" + this.id + ":defaultSource", this.defaultSource);
          }
          return this.defaultSource;
        }
        // This is appended to the beginning of the code for languages which
        // do not have a template in an enforced template task
        getDefaultTemplateComment() {
          return this.enforcedTemplateComment;
        }
        getExtension() {
          return this.extension;
        }
        toString() {
          return this.name;
        }
        static all() {
          const self = this;
          if (!self.cachedAll) {
            const objects = Array.from(super.all()).filter(programmingLanguage => !programmingLanguage.disabled);
            objects.sort((a, b) => a.ordinal - b.ordinal);
            self.cachedAll = objects;
          }
          return self.cachedAll; // Typescript bullshit
        }
        static getLanguageForFileName(fileName) {
          const parts = fileName.split(".");
          if (parts.length >= 2) {
            // Trying to get the language by languageId
            const nameWithoutExtension = parts[0];
            // 4 is the length of "Main". If that ever changes...Forta Steaua
            const languageId = parseInt(nameWithoutExtension.substring(4));
            const language = this.get(languageId);
            if (language) {
              return language;
            }
          }
          const extension = parts.length >= 2 ? parts.pop() : parts[0];
          for (const programmingLanguage of this.all()) {
            if (programmingLanguage.extension === extension || programmingLanguage.alternativeExtensions && programmingLanguage.alternativeExtensions.indexOf(extension) !== -1) {
              return programmingLanguage;
            }
          }
          console.error("Can't get a programming language for fileName: ", fileName);
          return {
            aceMode: "text"
          };
        }
        static getDefaultLanguage() {
          let programmingLanguageId = 1; // C++
          const user = User.getCurrentUser();
          if (user) {
            programmingLanguageId = user.getParsedCustomSetting("workspace:preferredProgrammingLanguage", programmingLanguageId);
          }
          return this.get(programmingLanguageId);
        }
      }, _classThis = _Class, (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = {
          value: _classThis
        }, _classDecorators, {
          kind: "class",
          name: _classThis.name,
          metadata: _metadata
        }, null, _classExtraInitializers);
        _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata
        });
        __runInitializers(_classThis, _classExtraInitializers);
      })(), _Class.cachedAll = void 0, _Class);
      return _classThis;
    })();

    let TermDefinitionObject = (_Class => {
      let _classDecorators = [globalStore];
      let _classDescriptor;
      let _classExtraInitializers = [];
      let _classThis;
      let _classSuper = BaseStore("TermDefinition");
      (_Class = class TermDefinitionObject extends _classSuper {
        static getDefinition(term) {
          return this.find(definition => definition.term === term);
        }
      }, _classThis = _Class, (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = {
          value: _classThis
        }, _classDecorators, {
          kind: "class",
          name: _classThis.name,
          metadata: _metadata
        }, null, _classExtraInitializers);
        _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata
        });
        __runInitializers(_classThis, _classExtraInitializers);
      })(), _Class);
      return _classThis;
    })();
    const TermDefinition = TermDefinitionObject;

    let AceThemeObject = (_Class => {
      let _classDecorators = [globalStore];
      let _classDescriptor;
      let _classExtraInitializers = [];
      let _classThis;
      let _classSuper = BaseStore("AceTheme");
      (_Class = class AceThemeObject extends _classSuper {
        toString() {
          return this.name;
        }
        static getDefaultTheme() {
          let aceThemeId = 1; // Dawn
          let user = User.getCurrentUser();
          if (user) {
            aceThemeId = user.getParsedCustomSetting("workspace:aceTheme", aceThemeId);
          }
          return this.get(aceThemeId);
        }
      }, _classThis = _Class, (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = {
          value: _classThis
        }, _classDecorators, {
          kind: "class",
          name: _classThis.name,
          metadata: _metadata
        }, null, _classExtraInitializers);
        _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata
        });
        __runInitializers(_classThis, _classExtraInitializers);
      })(), _Class);
      return _classThis;
    })();
    let AceKeyboardHandlerObject = (_Class2 => {
      let _classDecorators = [globalStore];
      let _classDescriptor;
      let _classExtraInitializers = [];
      let _classThis;
      let _classSuper = BaseStore("AceEditorKeyboardHandler");
      (_Class2 = class AceKeyboardHandlerObject extends _classSuper {
        toString() {
          return this.name;
        }
        static getDefaultKeyboardHandler() {
          let aceKeyboardHandlerId = 1; // ace
          let user = User.getCurrentUser();
          if (user) {
            aceKeyboardHandlerId = user.getParsedCustomSetting("workspace:aceKeyboardHandler", aceKeyboardHandlerId);
          }
          return this.get(aceKeyboardHandlerId);
        }
      }, _classThis = _Class2, (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = {
          value: _classThis
        }, _classDecorators, {
          kind: "class",
          name: _classThis.name,
          metadata: _metadata
        }, null, _classExtraInitializers);
        _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata
        });
        __runInitializers(_classThis, _classExtraInitializers);
      })(), _Class2);
      return _classThis;
    })();
    const AceTheme = AceThemeObject;
    const AceKeyboardHandler = AceKeyboardHandlerObject;

    let DifficultyObject = (_Class => {
      let _classDecorators = [globalStore];
      let _classDescriptor;
      let _classExtraInitializers = [];
      let _classThis;
      let _classSuper = BaseStore("Difficulty");
      (_Class = class DifficultyObject extends _classSuper {
        toString() {
          return this.name;
        }
      }, _classThis = _Class, (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
        __esDecorate(null, _classDescriptor = {
          value: _classThis
        }, _classDecorators, {
          kind: "class",
          name: _classThis.name,
          metadata: _metadata
        }, null, _classExtraInitializers);
        _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata
        });
      })(), _Class.getDefaultDifficulty = () => Difficulty.get(2), _Class.EASY = void 0, _Class.MEDIUM = void 0, _Class.HARD = void 0, _Class.HARDEST = void 0, _Class.TUTORIAL = void 0, __runInitializers(_classThis, _classExtraInitializers), _Class);
      return _classThis;
    })();
    const Difficulty = DifficultyObject;
    // Initialize static data
    Difficulty.importState([{
      id: -1,
      name: "TUTORIAL",
      color: "#00dd00"
    }, {
      id: 1,
      name: "EASY",
      color: "green"
    }, {
      id: 2,
      name: "MEDIUM",
      color: "orange"
    }, {
      id: 3,
      name: "HARD",
      color: "red"
    }, {
      id: 4,
      name: "HARDEST",
      color: "#aa0000"
    }]);
    // Set up static constants
    Difficulty.EASY = Difficulty.get(1);
    Difficulty.MEDIUM = Difficulty.get(2);
    Difficulty.HARD = Difficulty.get(3);
    Difficulty.HARDEST = Difficulty.get(4);
    Difficulty.TUTORIAL = Difficulty.get(-1);

    var _class$2E;
    let ContestScoring = globalStore(_class$2E = class ContestScoring extends BaseStore("ContestScoring") {
      static get PARTIAL_SCORING() {
        return this.get(1);
      }
      static get ACM() {
        return this.get(2);
      }
      static get CSA() {
        return this.get(3);
      }
      toString() {
        return this.name;
      }
    }) || _class$2E;

    var _class$2D;
    let SocialApp = globalStore(_class$2D = class SocialApp extends BaseStore("SocialApp") {
      getClientId() {
        return this.clientId;
      }
      static getSocialApps() {
        return this.all();
      }
      static getSocialAppByName(name) {
        return this.all().find(socialApp => socialApp.name === name);
      }
    }) || _class$2D;

    document.STEM_DEBUG = true;
    let startTime = performance.now();

    // GlobalState initialization
    GlobalState.applyEventWrapper = (...args) => GlobalState.applyEvent(...args);
    GlobalState.registerStream = function (streamName) {
      WebsocketSubscriber.addListener(streamName, GlobalState.applyEventWrapper);
    };
    GlobalState.importState(self.PUBLIC_STATE); // Set from PublicState.js

    //Register on the global event stream
    GlobalState.registerStream("global-events");
    if (USER.id) {
      //Register on the user event stream
      GlobalState.registerStream("user-" + USER.id + "-events");
    }

    // CSASettings initialization
    class CSASettingsClass extends SingletonStore {
      constructor() {
        super("CSASettings");
      }
    }
    new CSASettingsClass();

    // Load ISO 3 language codes
    Object.assign(Language, {
      ENGLISH: Language.getLanguageForCode("eng"),
      ROMANIAN: Language.getLanguageForCode("ro") || Language.getLanguageForCode("rom"),
      BULGARIAN: Language.getLanguageForCode("bg"),
      UKRAINIAN: Language.getLanguageForCode("ukr") || Language.getLanguageForCode("uk"),
      RUSSIAN: Language.getLanguageForCode("rus"),
      MANDARIN: Language.getLanguageForCode("cmn"),
      JAPANESE: Language.getLanguageForCode("jpn"),
      ARABIC: Language.getLanguageForCode("ara"),
      SPANISH: Language.getLanguageForCode("spa"),
      FRENCH: Language.getLanguageForCode("fra"),
      GERMAN: Language.getLanguageForCode("deu"),
      ITALIAN: Language.getLanguageForCode("it"),
      POLISH: Language.getLanguageForCode("pol"),
      DUTCH: Language.getLanguageForCode("nld"),
      HUNGARIAN: Language.getLanguageForCode("hu")
    });
    Language.setLocale(Language.get(USER.localeLanguageId) || Language.ENGLISH);
    setLanguageStore(Language);
    console.log("CSAState took", (performance.now() - startTime).toFixed(2), "ms at", performance.now().toFixed(2), "ms.");

    // TODO This should probably be something else
    function isSepi() {
      return self.ENV_NAME === "sepi";
    }

    // TODO: this file is in dire need of a rewrite

    class StringStream {
      constructor(string, options) {
        this.string = void 0;
        this.pointer = void 0;
        this.string = string;
        this.pointer = 0;
      }
      done() {
        return this.pointer >= this.string.length;
      }
      advance(steps = 1) {
        this.pointer += steps;
      }
      char() {
        let ch = this.string.charAt(this.pointer);
        this.pointer += 1;
        return ch;
      }
      whitespace(whitespaceChar = /\s/) {
        let whitespaceStart = this.pointer;
        while (!this.done() && whitespaceChar.test(this.at(0))) {
          this.pointer += 1;
        }

        // Return the actual whitespace in case it is needed
        return this.string.substring(whitespaceStart, this.pointer);
      }

      // Gets first encountered non-whitespace substring
      word(validChars = /\S/, skipWhitespace = true) {
        if (skipWhitespace) {
          this.whitespace();
        }
        let wordStart = this.pointer;
        while (!this.done() && validChars.test(this.at(0))) {
          this.pointer += 1;
        }
        return this.string.substring(wordStart, this.pointer);
      }
      number(skipWhitespace = true) {
        if (skipWhitespace) {
          this.whitespace();
        }
        let nanString = "NaN";
        if (this.startsWith(nanString)) {
          this.advance(nanString.length);
          return NaN;
        }
        let sign = "+";
        if (this.at(0) === "-" || this.at(0) === "+") {
          sign = this.char();
        }
        let infinityString = "Infinity";
        if (this.startsWith(infinityString)) {
          this.advance(infinityString.length);
          return sign === "+" ? Infinity : -Infinity;
        }
        let isDigit = char => {
          return char >= "0" || char <= "9";
        };
        if (this.at(0) === "0" && (this.at(1) === "X" || this.at(1) === "x")) {
          // hexadecimal number
          this.advance(2);
          let isHexDigit = char => {
            return isDigit(char) || char >= "A" && char <= "F" || char >= "a" && char <= "f";
          };
          let numberStart = this.pointer;
          while (!this.done() && isHexDigit(this.at(0))) {
            this.pointer += 1;
          }
          return parseInt(sign + this.string.substring(numberStart), 16);
        }
        let numberStart = this.pointer;
        while (!this.done() && isDigit(this.at(1))) {
          this.pointer += 1;
          if (this.peek() === ".") {
            this.advance(1);
            while (!this.done() && isDigit(this.at(1))) {
              this.pointer += 1;
            }
            break;
          }
        }
        return parseFloat(sign + this.string.substring(numberStart, this.pointer));
      }

      // Gets everything up to delimiter, usually end of line, limited to maxLength
      line(delimiter = /\r*\n/, maxLength = Infinity) {
        if (delimiter instanceof RegExp) {
          // Treat regex differently. It will probably be slower.
          let str = this.string.substring(this.pointer);
          let delimiterMatch = str.match(delimiter);
          let delimiterIndex, delimiterLength;
          if (delimiterMatch === null) {
            // End of string encountered
            delimiterIndex = str.length;
            delimiterLength = 0;
          } else {
            delimiterIndex = delimiterMatch.index;
            delimiterLength = delimiterMatch[0].length;
          }
          if (delimiterIndex >= maxLength) {
            this.pointer += maxLength;
            return str.substring(0, maxLength);
          }
          this.advance(delimiterIndex + delimiterLength);
          return str.substring(0, delimiterIndex);
        }
        let delimiterIndex = this.string.indexOf(delimiter, this.pointer);
        if (delimiterIndex === -1) {
          delimiterIndex = this.string.length;
        }
        if (delimiterIndex - this.pointer > maxLength) {
          let result = this.string.substring(this.pointer, this.pointer + maxLength);
          this.advance(maxLength);
          return result;
        }
        let result = this.string.substring(this.pointer, delimiterIndex);
        this.pointer = delimiterIndex + delimiter.length;
        return result;
      }

      // The following methods have no side effects

      // Access char at offset position, relative to current pointer
      at(index) {
        return this.string.charAt(this.pointer + index);
      }
      peek(length = 1) {
        return this.string.substring(this.pointer, this.pointer + length);
      }
      startsWith(prefix) {
        if (prefix instanceof RegExp) {
          // we modify the regex to only check for the beginning of the string
          let regexPrefix = new RegExp("^" + prefix.toString().slice(1, -1));
          return regexPrefix.test(this.string.substring(this.pointer));
        }
        return this.peek(prefix.length) === prefix;
      }

      // Returns first position of match
      search(pattern) {
        let position;
        if (pattern instanceof RegExp) {
          position = this.string.substring(this.pointer).search(pattern);
        } else {
          position = this.string.indexOf(pattern, this.pointer) - this.pointer;
        }
        return position < 0 ? -1 : position;
      }
      clone() {
        let newStream = new StringStream(this.string);
        newStream.pointer = this.pointer;
        return newStream;
      }
    }
    function kmp(input) {
      if (input.length === 0) {
        return [];
      }
      let prefix = [0];
      let prefixLength = 0;
      for (let i = 1; i < input.length; i += 1) {
        while (prefixLength > 0 && input[i] !== input[prefixLength]) {
          prefixLength = prefix[prefixLength];
        }
        if (input[i] === input[prefixLength]) {
          prefixLength += 1;
        }
        prefix.push(prefixLength);
      }
      return prefix;
    }
    class ModifierAutomation {
      // build automaton from string
      constructor(options) {
        this.options = void 0;
        this.steps = void 0;
        this.startNode = void 0;
        this.node = void 0;
        this.patternStep = void 0;
        this.endPatternStep = void 0;
        this.capture = void 0;
        this.options = options;
        this.steps = 0;
        this.startNode = {
          value: null,
          startNode: true
        };
        this.node = this.startNode;
        let lastNode = this.startNode;
        let char = options.pattern.charAt(0);
        let startPatternNode = {
          value: char,
          startNode: true
        };
        let patternPrefix = kmp(options.pattern);
        let patternNode = [startPatternNode];
        if (options.leftWhitespace) {
          // We don't want to match if the first char is not preceeded by whitespace
          let whitespaceNode = {
            value: " ",
            whitespaceNode: true
          };
          whitespaceNode.next = input => {
            if (input === char) return startPatternNode;
            return /\s/.test(input) ? whitespaceNode : this.startNode;
          };
          lastNode.next = input => {
            return /\s/.test(input) ? whitespaceNode : this.startNode;
          };
          this.node = whitespaceNode;
        } else {
          lastNode.next = input => {
            return input === char ? startPatternNode : this.startNode;
          };
        }
        lastNode = startPatternNode;
        for (let i = 1; i < options.pattern.length; i += 1) {
          let char = options.pattern[i];
          let newNode = {
            value: char
          };
          patternNode.push(newNode);
          let backNode = patternPrefix[i - 1] === 0 ? this.startNode : patternNode[patternPrefix[i - 1] - 1];
          lastNode.next = input => {
            if (input === char) {
              return newNode;
            }
            return backNode.next(input);
          };
          lastNode = newNode;
        }
        lastNode.patternLastNode = true;
        if (options.captureContent) {
          this.capture = [];
          let captureNode = {
            value: "",
            captureNode: true
          };

          // We treat the first character separately in order to support empty capture
          let char = options.endPattern.charAt(0);
          let endCaptureNode = {
            value: char
          };
          let endPatternPrefix = kmp(options.endPattern);
          let endPatternNodes = [endCaptureNode];
          lastNode.next = captureNode.next = input => {
            return input === char ? endCaptureNode : captureNode;
          };
          lastNode = endCaptureNode;
          for (let i = 1; i < options.endPattern.length; i += 1) {
            let char = options.endPattern[i];
            let newNode = {
              value: char
            };
            endPatternNodes.push(newNode);
            let backNode = endPatternPrefix[i - 1] === 0 ? captureNode : endPatternNodes[endPatternPrefix[i - 1] - 1];
            lastNode.next = input => {
              if (input === char) {
                return newNode;
              }
              return backNode.next(input);
            };
            lastNode = newNode;
          }
          lastNode.endPatternLastNode = true;
        }
        lastNode.endNode = true;
        lastNode.next = input => {
          return this.startNode.next(input);
        };
      }
      nextState(input) {
        this.steps += 1;
        this.node = this.node.next(input);
        if (this.node.startNode) {
          this.steps = 0;
          delete this.patternStep;
          delete this.endPatternStep;
        }
        if (this.node.patternLastNode) {
          this.patternStep = this.steps - this.options.pattern.length + 1;
        }
        if (this.node.endPatternLastNode) {
          // TODO(@all): Shouldn't it be this.options.endPattern.length instead of this.options.pattern.length?
          this.endPatternStep = this.steps - this.options.pattern.length + 1;
        }
        return this.node;
      }
      done() {
        return !!this.node.endNode;
      }
    }
    let Modifier$1 = class Modifier {
      constructor(options) {
        this.pattern = void 0;
        this.endPattern = void 0;
        this.captureContent = void 0;
        this.leftWhitespace = void 0;
        this.tag = void 0;
        this.itemTag = void 0;
        this.groupConsecutive = void 0;
        this.codeOptions = void 0;
        Object.assign(this, options);
      }
      modify(currentArray, originalString) {
        let matcher = new ModifierAutomation({
          pattern: this.pattern,
          captureContent: this.captureContent,
          // TODO: some elements should not wrap
          endPattern: this.endPattern,
          leftWhitespace: this.leftWhitespace
        });
        let arrayLocation = 0;
        let currentElement = currentArray[arrayLocation];
        let newArray = [];
        for (let i = 0; i < originalString.length; i += 1) {
          let char = originalString[i];
          if (i >= currentElement.end) {
            newArray.push(currentElement);
            arrayLocation += 1;
            currentElement = currentArray[arrayLocation];
          }
          if (currentElement.isJSX) {
            matcher.nextState("\\" + char); // prevent char from advancing automata
            continue;
          }
          matcher.nextState(char);
          if (matcher.done()) {
            let modifierStart = i - (matcher.steps - matcher.patternStep);
            let modifierEnd = i - (matcher.steps - matcher.endPatternStep) + this.endPattern.length;
            let modifierCapture = [];
            while (newArray.length > 0 && modifierStart <= newArray[newArray.length - 1].start) {
              let element = newArray.pop();
              modifierCapture.push(element);
            }
            if (newArray.length > 0 && modifierStart < newArray[newArray.length - 1].end) {
              let element = newArray.pop();
              newArray.push({
                isString: true,
                start: element.start,
                end: modifierStart
              });
              modifierCapture.push({
                isString: true,
                start: modifierStart,
                end: element.end
              });
            }
            if (currentElement.start < modifierStart) {
              newArray.push({
                isString: true,
                start: currentElement.start,
                end: modifierStart
              });
            }
            modifierCapture.reverse();

            // this is the end of the capture
            modifierCapture.push({
              isString: true,
              start: Math.max(currentElement.start, modifierStart),
              end: modifierEnd
            });
            newArray.push({
              content: this.wrap(this.processChildren(modifierCapture, originalString)),
              start: modifierStart,
              end: modifierEnd
            });

            // We split the current element to in two(one will be captured, one replaces the current element
            currentElement = {
              isString: true,
              start: modifierEnd,
              end: currentElement.end
            };
          }
        }
        if (currentElement.start < originalString.length) {
          newArray.push(currentElement);
        }
        return newArray;
      }
      processChildren(capture, originalString) {
        return capture.map(element => {
          return this.processChild(element, originalString);
        });
      }
      processChild(element, originalString) {
        if (element.isDummy) {
          return "";
        }
        if (element.isString) {
          return originalString.substring(element.start, element.end);
        } else {
          return element.content;
        }
      }
    };
    function InlineModifierMixin(BaseModifierClass) {
      return class InlineModifier extends BaseModifierClass {
        constructor(options) {
          super(options);
          this.captureContent = true;
        }
        wrap(content) {
          if (content.length > 0) {
            content[0] = content[0].substring(content[0].indexOf(this.pattern) + this.pattern.length);
            let lastElement = content.pop();
            lastElement = lastElement.substring(0, lastElement.lastIndexOf(this.endPattern));
            content.push(lastElement);
            return {
              tag: this.tag,
              children: content
            };
          }
        }
      };
    }
    function LineStartModifierMixin(BaseModifierClass) {
      return class LineStartModifier extends BaseModifierClass {
        constructor(options) {
          super(options);
          this.groupConsecutive = false;
        }
        isValidElement(element) {
          return element.content && element.content.tag === "p" && element.content.children.length > 0 && !element.content.children[0].tag &&
          // child is text string
          element.content.children[0].startsWith(this.pattern);
        }
        modify(currentArray, originalString) {
          let newArray = [];
          for (let i = 0; i < currentArray.length; i += 1) {
            let element = currentArray[i];
            if (this.isValidElement(element)) {
              if (this.groupConsecutive) {
                let elements = [];
                let start, end;
                start = currentArray[i].start;
                while (i < currentArray.length && this.isValidElement(currentArray[i])) {
                  elements.push(this.wrapItem(currentArray[i].content.children));
                  i += 1;
                }
                // we make sure no elements are skipped
                i -= 1;
                end = currentArray[i].end;
                newArray.push({
                  start: start,
                  end: end,
                  content: this.wrap(elements)
                });
              } else {
                // We use object assign here to keep the start and end properties. (Maybe along with others)
                let newElement = Object.assign({}, element, {
                  content: this.wrap(element.content.children)
                });
                newArray.push(newElement);
              }
            } else {
              newArray.push(element);
            }
          }
          return newArray;
        }
        wrapItem(content) {
          let firstChild = content[0];
          let patternIndex = firstChild.indexOf(this.pattern);
          let patternEnd = patternIndex + this.pattern.length;
          content[0] = firstChild.substring(patternEnd);
          return {
            tag: this.itemTag,
            children: content
          };
        }
        wrap(content) {
          return {
            tag: this.tag,
            children: content
          };
        }
      };
    }
    function RawContentModifierMixin(BaseModifierClass) {
      return class RawContentModifier extends BaseModifierClass {
        processChildren(children, originalString) {
          if (children.length === 0) {
            return [];
          }
          return [originalString.substring(children[0].start, children[children.length - 1].end)];
        }
      };
    }
    class BlockCodeModifier extends Modifier$1 {
      constructor(options) {
        super(options);
        this.pattern = "```";
        this.endPattern = "\n```";
        this.leftWhitespace = true;
        this.captureContent = true;
      }
      processChildren(capture, originalString) {
        this.codeOptions = null;
        if (capture.length > 0) {
          let codeBlock = originalString.substring(capture[0].start, capture[capture.length - 1].end);
          codeBlock = codeBlock.substring(codeBlock.indexOf(this.pattern) + this.pattern.length);
          codeBlock = codeBlock.substring(0, codeBlock.lastIndexOf(this.endPattern));
          let firstLineEnd = codeBlock.indexOf("\n") + 1;
          let firstLine = codeBlock.substring(0, firstLineEnd).trim();
          codeBlock = codeBlock.substring(firstLineEnd);
          if (firstLine.length > 0) {
            this.codeOptions = {};
            let lineStream = new StringStream(firstLine);
            this.codeOptions.aceMode = lineStream.word();
            Object.assign(this.codeOptions, MarkupParser.parseOptions(lineStream));
          }
          return codeBlock;
        }
        return "";
      }
      getElement(content) {
        return {
          tag: this.constructor.tag || "pre",
          children: [content]
        };
      }
      wrap(content, options) {
        let codeHighlighter = this.getElement(content);

        // TODO: this code should not be here
        let codeOptions = {
          aceMode: "c_cpp",
          maxLines: 32
        };
        if (this.codeOptions) {
          Object.assign(codeOptions, this.codeOptions);
          delete this.codeOptions;
        }
        Object.assign(codeOptions, codeHighlighter);
        return codeOptions;
      }
    }
    class HeaderModifier extends LineStartModifierMixin(Modifier$1) {
      constructor(options) {
        super(options);
        this.pattern = "#";
      }
      wrap(content) {
        let firstChild = content[0];
        let hashtagIndex = firstChild.indexOf("#");
        let hashtagEnd = hashtagIndex + 1;
        let headerLevel = 1;
        let nextChar = firstChild.charAt(hashtagEnd);
        if (nextChar >= "1" && nextChar <= "6") {
          headerLevel = parseInt(nextChar);
          hashtagEnd += 1;
        } else if (nextChar === "#") {
          while (headerLevel < 6 && firstChild.charAt(hashtagEnd) === "#") {
            headerLevel += 1;
            hashtagEnd += 1;
          }
        }
        content[0] = firstChild.substring(hashtagEnd);
        return {
          tag: "h" + headerLevel,
          children: content
        };
      }
    }
    class HorizontalRuleModifier extends LineStartModifierMixin(Modifier$1) {
      constructor(options) {
        super(options);
        this.pattern = "---";
      }
      wrap(content) {
        return {
          tag: "hr"
        };
      }
    }
    class UnorderedListModifier extends LineStartModifierMixin(Modifier$1) {
      constructor(options) {
        super(options);
        this.tag = "ul";
        this.itemTag = "li";
        this.pattern = "- ";
        this.groupConsecutive = true;
      }
    }
    class OrderedListModifier extends LineStartModifierMixin(Modifier$1) {
      constructor(options) {
        super(options);
        this.tag = "ol";
        this.itemTag = "li";
        this.pattern = "1. ";
        this.groupConsecutive = true;
      }
    }
    class ParagraphModifier extends Modifier$1 {
      modify(currentArray, originalString) {
        let newArray = [];
        let capturedContent = [];
        let arrayLocation = 0;
        let currentElement = currentArray[arrayLocation];
        let lineStart = 0;
        for (let i = 0; i < originalString.length; i += 1) {
          if (i >= currentElement.end) {
            capturedContent.push(currentElement);
            arrayLocation += 1;
            currentElement = currentArray[arrayLocation];
          }
          if (currentElement.isJSX) {
            continue;
          }
          if (originalString[i] === "\n") {
            if (currentElement.start < i) {
              capturedContent.push({
                isString: true,
                start: currentElement.start,
                end: i
              });
            }
            newArray.push({
              content: this.wrap(this.processChildren(capturedContent, originalString)),
              start: lineStart,
              end: i + 1
            });
            capturedContent = [];
            lineStart = i + 1;
            if (originalString[i + 1] === "\n") {
              let start, end;
              start = i;
              while (i + 1 < originalString.length && originalString[i + 1] === "\n") {
                i += 1;
              }
              end = i + 1;
              newArray.push({
                content: {
                  tag: "br"
                },
                start: start,
                end: end
              });
              lineStart = i + 1;
            }
            currentElement = {
              isString: true,
              start: lineStart,
              end: currentElement.end
            };
          }
        }
        if (currentElement.start < originalString.length) {
          capturedContent.push(currentElement);
        }
        if (capturedContent.length > 0) {
          newArray.push({
            content: this.wrap(this.processChildren(capturedContent, originalString)),
            start: lineStart,
            end: originalString.length
          });
        }
        return newArray;
      }
      wrap(capture) {
        return {
          tag: "p",
          children: capture
        };
      }
    }
    class StrongModifier extends InlineModifierMixin(Modifier$1) {
      constructor(options) {
        super(options);
        this.leftWhitespace = true;
        this.pattern = "*";
        this.endPattern = "*";
        this.tag = "strong";
      }
    }
    class ItalicModifier extends InlineModifierMixin(Modifier$1) {
      constructor(options) {
        super(options);
        this.leftWhitespace = true;
        this.pattern = "/";
        this.endPattern = "/";
        this.tag = "em";
      }
    }
    class InlineCodeModifier extends RawContentModifierMixin(InlineModifierMixin(Modifier$1)) {
      constructor(options) {
        super(options);
        this.pattern = "`";
        this.endPattern = "`";
        this.tag = "code";
      }
      processChildren(children, originalString) {
        if (children.length === 0) {
          return [];
        }
        return [originalString.substring(children[0].start, children[children.length - 1].end)];
      }
    }
    class InlineVarModifier extends RawContentModifierMixin(InlineModifierMixin(Modifier$1)) {
      constructor(options) {
        super(options);
        this.pattern = "$";
        this.endPattern = "$";
        this.tag = "var";
      }
    }
    class InlineLatexModifier extends RawContentModifierMixin(InlineModifierMixin(Modifier$1)) {
      constructor(options) {
        super(options);
        this.pattern = "$$";
        this.endPattern = "$$";
        this.tag = "Latex";
      }
    }
    class LinkModifier extends Modifier$1 {
      static isCorrectUrl(str) {
        if (str.startsWith("http://") || str.startsWith("https://")) {
          return true;
        }
        return false;
      }
      static trimProtocol(str) {
        if (str[4] === 's') {
          return str.substring(8, str.length);
        }
        return str.substring(7, str.length);
      }
      modify(currentArray, originalString) {
        let newArray = [];
        let arrayLocation = 0;
        let currentElement = currentArray[arrayLocation];
        let lineStart = 0;
        let checkAndAddUrl = (start, end) => {
          let substr = originalString.substring(start, end);
          if (this.constructor.isCorrectUrl(substr)) {
            if (currentElement.start < start) {
              newArray.push({
                isString: true,
                start: currentElement.start,
                end: start
              });
            }
            newArray.push({
              isJSX: true,
              content: {
                tag: "a",
                href: substr,
                children: [this.constructor.trimProtocol(substr)],
                target: "_blank"
              },
              start: start,
              end: end
            });
            currentElement = {
              isString: true,
              start: end,
              end: currentElement.end
            };
          }
        };
        for (let i = 0; i < originalString.length; i += 1) {
          if (i >= currentElement.end) {
            newArray.push(currentElement);
            arrayLocation += 1;
            currentElement = currentArray[arrayLocation];
          }
          if (currentElement.isJSX) {
            continue;
          }
          if (/\s/.test(originalString[i])) {
            checkAndAddUrl(lineStart, i);
            lineStart = i + 1;
          }
        }
        if (lineStart < originalString.length) {
          checkAndAddUrl(lineStart, originalString.length);
        }
        if (currentElement.start < originalString.length) {
          newArray.push(currentElement);
        }
        return newArray;
      }
    }
    let MarkupModifier = Modifier$1;
    class MarkupParser {
      constructor(options) {
        this.modifiers = void 0;
        this.uiElements = void 0;
        options = options || {};
        this.modifiers = options.modifiers || this.constructor.modifiers;
        this.uiElements = options.uiElements || new Map();
      }
      parse(content) {
        if (!content) return [];
        let result = [];
        let arr = this.parseUIElements(content);
        for (let i = this.modifiers.length - 1; i >= 0; i -= 1) {
          let modifier = this.modifiers[i];
          arr = modifier.modify(arr, content);
        }
        for (let el of arr) {
          if (el.isDummy) ; else if (el.isString) {
            result.push(content.substring(el.start, el.end));
          } else {
            result.push(el.content);
          }
        }
        return result;
      }
      parseUIElements(content) {
        let stream = new StringStream(content);
        let result = [];
        let textStart = 0;
        while (!stream.done()) {
          let char = stream.char();
          if (char === "<" && /[a-zA-Z]/.test(stream.at(0))) {
            stream.pointer -= 1; //step back to beginning of ui element
            let elementStart = stream.pointer;
            let uiElement;
            try {
              uiElement = this.parseUIElement(stream);
            } catch (e) {
              // failed to parse jsx element
              continue;
            }
            if (this.uiElements.has(uiElement.tag)) {
              result.push({
                isString: true,
                start: textStart,
                end: elementStart
              });
              result.push({
                content: uiElement,
                isJSX: true,
                start: elementStart,
                end: stream.pointer
              });
              textStart = stream.pointer;
            }
          }
        }
        if (textStart < content.length) {
          result.push({
            isString: true,
            start: textStart,
            end: content.length
          });
        }
        return result;
      }
      parseUIElement(stream, delimiter = /\/?>/) {
        // content should be of type <ClassName option1="string" option2={{jsonObject: true}} />
        // TODO: support nested elements like <ClassName><NestedClass /></ClassName>

        stream.whitespace();
        if (stream.done()) {
          return null;
        }
        if (stream.at(0) !== "<") {
          throw Error("Invalid UIElement declaration.");
        }
        let result = {};
        stream.char(); // skip the '<'

        result.tag = stream.word();
        stream.whitespace();
        Object.assign(result, this.parseOptions(stream, delimiter));
        stream.line(delimiter);
        return result;
      }
      parseOptions(stream, optionsEnd) {
        return this.constructor.parseOptions(stream, optionsEnd);
      }

      // optionsEnd cannot include whitespace or start with '='
      static parseOptions(stream, optionsEnd) {
        let options = {};
        stream.whitespace();
        while (!stream.done()) {
          // argument name is anything that comes before whitespace or '='
          stream.whitespace();
          let validOptionName = /[\w$]/;
          let optionName;
          if (validOptionName.test(stream.at(0))) {
            optionName = stream.word(validOptionName);
          }
          stream.whitespace();
          if (optionsEnd && stream.search(optionsEnd) === 0) {
            options[optionName] = true;
            break;
          }
          if (!optionName) {
            throw Error("Invalid option name");
          }
          if (stream.peek() === "=") {
            stream.char();
            stream.whitespace();
            if (stream.done()) {
              throw Error("No argument given for option: " + optionName);
            }
            if (stream.peek() === '"') {
              // We have a string here
              let optionString = "";
              let foundStringEnd = false;
              stream.char();
              while (!stream.done()) {
                let char = stream.char();
                if (char === '"') {
                  foundStringEnd = true;
                  break;
                }
                optionString += char;
              }
              if (!foundStringEnd) {
                // You did not close that string
                throw Error("Argument string not closed: " + optionString);
              }
              options[optionName] = optionString;
            } else if (stream.peek() === '{') {
              // Once you pop, the fun don't stop
              let bracketCount = 0;
              let validJSON = false;
              let jsonString = "";
              stream.char();
              while (!stream.done()) {
                let char = stream.char();
                if (char === '{') {
                  bracketCount += 1;
                } else if (char === '}') {
                  if (bracketCount > 0) {
                    bracketCount -= 1;
                  } else {
                    // JSON ends here
                    options[optionName] = jsonString.length > 0 ? this.parseJSON5(jsonString) : undefined;
                    validJSON = true;
                    break;
                  }
                }
                jsonString += char;
              }
              if (!validJSON) {
                throw Error("Invalid JSON argument for option: " + optionName + ". Input: " + jsonString);
              }
            } else {
              throw Error("Invalid argument for option: " + optionName + ". Need string or JSON.");
            }
          } else {
            options[optionName] = true;
          }
          stream.whitespace();
        }
        return options;
      }
      parseTextLine(stream) {
        let capturedContent = [];
        let textStart = stream.pointer;
        let contentStart = stream.pointer;
        while (!stream.done()) {
          if (stream.startsWith(/\s+\r*\n/)) {
            // end of line, stop here
            break;
          }
          if (stream.at(0) === "<") {
            capturedContent.push({
              content: stream.string.substring(contentStart, stream.pointer),
              start: contentStart,
              end: stream.pointer
            });
            let uiElementStart = stream.pointer;
            let uiElement = this.parseUIElement(stream, /\/*>/);
            capturedContent.push({
              content: uiElement,
              start: uiElementStart,
              end: stream.pointer
            });
            contentStart = stream.pointer;
            continue;
          }
          let char = stream.char();
          if (char === "\\") {
            // escape next character
            char += stream.char();
          }
        }
        let remainingContent = stream.string.substring(textStart, stream.pointer);
        if (remainingContent.length > 0) {
          capturedContent.push(remainingContent);
        }
        stream.line(); // delete line endings

        return capturedContent;
      }
    }
    MarkupParser.modifiers = void 0;
    MarkupParser.parseJSON5 = void 0;
    MarkupParser.modifiers = [new BlockCodeModifier(), new HeaderModifier(), new HorizontalRuleModifier(), new UnorderedListModifier(), new OrderedListModifier(), new ParagraphModifier(), new InlineCodeModifier(), new InlineLatexModifier(), new InlineVarModifier(), new StrongModifier(), new ItalicModifier(), new LinkModifier()];

    // json5.js
    // This file is based directly off of Douglas Crockford's json_parse.js:
    // https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js
    MarkupParser.parseJSON5 = function () {
      // This is a function that can parse a JSON5 text, producing a JavaScript
      // data structure. It is a simple, recursive descent parser. It does not use
      // eval or regular expressions, so it can be used as a model for implementing
      // a JSON5 parser in other languages.

      // We are defining the function inside of another function to avoid creating
      // global variables.

      let at,
        // The index of the current character
        lineNumber,
        // The current line number
        columnNumber,
        // The current column number
        ch; // The current character
      let escapee = {
        "'": "'",
        '"': '"',
        '\\': '\\',
        '/': '/',
        '\n': '',
        // Replace escaped newlines in strings w/ empty string
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t'
      };
      let text;
      let renderChar = chr => {
        return chr === '' ? 'EOF' : "'" + chr + "'";
      };
      let error = m => {
        // Call error when something is wrong.

        let error = new SyntaxError();
        // beginning of message suffix to agree with that provided by Gecko - see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
        error.message = m + " at line " + lineNumber + " column " + columnNumber + " of the JSON5 data. Still to read: " + JSON.stringify(text.substring(at - 1, at + 19));
        error.at = at;
        // These two property names have been chosen to agree with the ones in Gecko, the only popular
        // environment which seems to supply this info on JSON.parse
        error.lineNumber = lineNumber;
        error.columnNumber = columnNumber;
        throw error;
      };
      let next = c => {
        // If a c parameter is provided, verify that it matches the current character.

        if (c && c !== ch) {
          error("Expected " + renderChar(c) + " instead of " + renderChar(ch));
        }

        // Get the next character. When there are no more characters,
        // return the empty string.

        ch = text.charAt(at);
        at++;
        columnNumber++;
        if (ch === '\n' || ch === '\r' && peek() !== '\n') {
          lineNumber++;
          columnNumber = 0;
        }
        return ch;
      };
      let peek = () => {
        // Get the next character without consuming it or
        // assigning it to the ch varaible.

        return text.charAt(at);
      };
      let identifier = () => {
        // Parse an identifier. Normally, reserved words are disallowed here, but we
        // only use this for unquoted object keys, where reserved words are allowed,
        // so we don't check for those here. References:
        // - http://es5.github.com/#x7.6
        // - https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Core_Language_Features#Variables
        // - http://docstore.mik.ua/orelly/webprog/jscript/ch02_07.htm
        // TODO Identifiers can have Unicode "letters" in them; add support for those.
        let key = ch;

        // Identifiers must start with a letter, _ or $.
        if (ch !== '_' && ch !== '$' && (ch < 'a' || ch > 'z') && (ch < 'A' || ch > 'Z')) {
          error("Bad identifier as unquoted key");
        }

        // Subsequent characters can contain digits.
        while (next() && (ch === '_' || ch === '$' || ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch >= '0' && ch <= '9')) {
          key += ch;
        }
        return key;
      };
      let number = () => {
        // Parse a number value.
        var number,
          sign = '',
          string = '',
          base = 10;
        if (ch === '-' || ch === '+') {
          sign = ch;
          next(ch);
        }

        // support for Infinity (could tweak to allow other words):
        if (ch === 'I') {
          number = word();
          if (typeof number !== 'number' || isNaN(number)) {
            error('Unexpected word for number');
          }
          return sign === '-' ? -number : number;
        }

        // support for NaN
        if (ch === 'N') {
          number = word();
          if (!isNaN(number)) {
            error('expected word to be NaN');
          }
          // ignore sign as -NaN also is NaN
          return number;
        }
        if (ch === '0') {
          string += ch;
          next();
          if (ch === 'x' || ch === 'X') {
            string += ch;
            next();
            base = 16;
          } else if (ch >= '0' && ch <= '9') {
            error('Octal literal');
          }
        }
        switch (base) {
          case 10:
            while (ch >= '0' && ch <= '9') {
              string += ch;
              next();
            }
            if (ch === '.') {
              string += '.';
              while (next() && ch >= '0' && ch <= '9') {
                string += ch;
              }
            }
            if (ch === 'e' || ch === 'E') {
              string += ch;
              next();
              if (ch === '-' || ch === '+') {
                string += ch;
                next();
              }
              while (ch >= '0' && ch <= '9') {
                string += ch;
                next();
              }
            }
            break;
          case 16:
            while (ch >= '0' && ch <= '9' || ch >= 'A' && ch <= 'F' || ch >= 'a' && ch <= 'f') {
              string += ch;
              next();
            }
            break;
        }
        if (sign === '-') {
          number = -string;
        } else {
          number = +string;
        }
        if (!isFinite(number)) {
          error("Bad number");
        } else {
          return number;
        }
      };
      let string = () => {
        // Parse a string value.
        let hex,
          i,
          string = '',
          uffff;
        let delim; // double quote or single quote

        // When parsing for string values, we must look for ' or " and \ characters.

        if (ch === '"' || ch === "'") {
          delim = ch;
          while (next()) {
            if (ch === delim) {
              next();
              return string;
            } else if (ch === '\\') {
              next();
              if (ch === 'u') {
                uffff = 0;
                for (i = 0; i < 4; i += 1) {
                  hex = parseInt(next(), 16);
                  if (!isFinite(hex)) {
                    break;
                  }
                  uffff = uffff * 16 + hex;
                }
                string += String.fromCharCode(uffff);
              } else if (ch === '\r') {
                if (peek() === '\n') {
                  next();
                }
              } else if (typeof escapee[ch] === 'string') {
                string += escapee[ch];
              } else {
                break;
              }
            } else if (ch === '\n') {
              // unescaped newlines are invalid; see:
              // https://github.com/aseemk/json5/issues/24
              // TODO this feels special-cased; are there other
              // invalid unescaped chars?
              break;
            } else {
              string += ch;
            }
          }
        }
        error("Bad string");
      };
      let inlineComment = () => {
        // Skip an inline comment, assuming this is one. The current character should
        // be the second / character in the // pair that begins this inline comment.
        // To finish the inline comment, we look for a newline or the end of the text.

        if (ch !== '/') {
          error("Not an inline comment");
        }
        do {
          next();
          if (ch === '\n' || ch === '\r') {
            next();
            return;
          }
        } while (ch);
      };
      let blockComment = () => {
        // Skip a block comment, assuming this is one. The current character should be
        // the * character in the /* pair that begins this block comment.
        // To finish the block comment, we look for an ending */ pair of characters,
        // but we also watch for the end of text before the comment is terminated.

        if (ch !== '*') {
          error("Not a block comment");
        }
        do {
          next();
          while (ch === '*') {
            next('*');
            if (ch === '/') {
              next('/');
              return;
            }
          }
        } while (ch);
        error("Unterminated block comment");
      };
      let comment = () => {
        // Skip a comment, whether inline or block-level, assuming this is one.
        // Comments always begin with a / character.

        if (ch !== '/') {
          error("Not a comment");
        }
        next('/');
        if (ch === '/') {
          inlineComment();
        } else if (ch === '*') {
          blockComment();
        } else {
          error("Unrecognized comment");
        }
      };
      let white = () => {
        // Skip whitespace and comments.
        // Note that we're detecting comments by only a single / character.
        // This works since regular expressions are not valid JSON(5), but this will
        // break if there are other valid values that begin with a / character!

        while (ch) {
          if (ch === '/') {
            comment();
          } else if (/\s/.test(ch)) {
            next();
          } else {
            return;
          }
        }
      };
      let word = () => {
        // true, false, or null.

        switch (ch) {
          case 't':
            next('t');
            next('r');
            next('u');
            next('e');
            return true;
          case 'f':
            next('f');
            next('a');
            next('l');
            next('s');
            next('e');
            return false;
          case 'n':
            next('n');
            next('u');
            next('l');
            next('l');
            return null;
          case 'I':
            next('I');
            next('n');
            next('f');
            next('i');
            next('n');
            next('i');
            next('t');
            next('y');
            return Infinity;
          case 'N':
            next('N');
            next('a');
            next('N');
            return NaN;
        }
        error("Unexpected " + renderChar(ch));
      };
      let value;
      let array = () => {
        // Parse an array value.
        let array = [];
        if (ch === '[') {
          next('[');
          white();
          while (ch) {
            if (ch === ']') {
              next(']');
              return array; // Potentially empty array
            }
            // ES5 allows omitting elements in arrays, e.g. [,] and
            // [,null]. We don't allow this in JSON5.
            if (ch === ',') {
              error("Missing array element");
            } else {
              array.push(value());
            }
            white();
            // If there's no comma after this value, this needs to
            // be the end of the array.
            if (ch !== ',') {
              next(']');
              return array;
            }
            next(',');
            white();
          }
        }
        error("Bad array");
      };
      let object = () => {
        // Parse an object value.

        var key,
          object = {};
        if (ch === '{') {
          next('{');
          white();
          while (ch) {
            if (ch === '}') {
              next('}');
              return object; // Potentially empty object
            }

            // Keys can be unquoted. If they are, they need to be
            // valid JS identifiers.
            if (ch === '"' || ch === "'") {
              key = string();
            } else {
              key = identifier();
            }
            white();
            next(':');
            object[key] = value();
            white();
            // If there's no comma after this pair, this needs to be
            // the end of the object.
            if (ch !== ',') {
              next('}');
              return object;
            }
            next(',');
            white();
          }
        }
        error("Bad object");
      };
      value = () => {
        // Parse a JSON value. It could be an object, an array, a string, a number,
        // or a word.

        white();
        switch (ch) {
          case '{':
            return object();
          case '[':
            return array();
          case '"':
          case "'":
            return string();
          case '-':
          case '+':
          case '.':
            return number();
          default:
            return ch >= '0' && ch <= '9' ? number() : word();
        }
      };

      // Return the json_parse function. It will have access to all of the above
      // functions and variables.

      return function (source, reviver) {
        var result;
        text = String(source);
        at = 0;
        lineNumber = 1;
        columnNumber = 1;
        ch = ' ';
        result = value();
        white();
        if (ch) {
          error("Syntax error");
        }

        // If there is a reviver function, we recursively walk the new structure,
        // passing each name/value pair to the reviver function for possible
        // transformation, starting with a temporary root object that holds the result
        // in an empty key. If there is not a reviver function, we simply return the
        // result.

        return typeof reviver === 'function' ? function walk(holder, key) {
          var k,
            v,
            value = holder[key];
          if (value && typeof value === 'object') {
            for (k in value) {
              if (Object.prototype.hasOwnProperty.call(value, k)) {
                v = walk(value, k);
                if (v !== undefined) {
                  value[k] = v;
                } else {
                  delete value[k];
                }
              }
            }
          }
          return reviver.call(holder, key, value);
        }({
          '': result
        }, '') : result;
      };
    }();

    function _applyDecoratedDescriptor(i, e, r, n, l) {
      var a = {};
      return Object.keys(n).forEach(function (i) {
        a[i] = n[i];
      }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = true), a = r.slice().reverse().reduce(function (r, n) {
        return n(i, e, r) || r;
      }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a;
    }
    function _extends() {
      return _extends = Object.assign ? Object.assign.bind() : function (n) {
        for (var e = 1; e < arguments.length; e++) {
          var t = arguments[e];
          for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
        }
        return n;
      }, _extends.apply(null, arguments);
    }
    function _initializerDefineProperty(e, i, r, l) {
      r && Object.defineProperty(e, i, {
        enumerable: r.enumerable,
        configurable: r.configurable,
        writable: r.writable,
        value: r.initializer ? r.initializer.call(l) : void 0
      });
    }

    // TODO: should this be actually better done throught the dynamic CSS API, without doing through the DOM?
    // So far it's actually better like this, since we want to edit the classes inline
    class StyleInstance extends UI$1.TextElement {
      constructor(options) {
        super(options);
        this.attributes = void 0;
        this.setOptions(options);
      }
      setOptions(options) {
        this.options = options;
        this.options.attributes = this.options.attributes || {};
        this.attributes = new Map();
        for (let key in this.options.attributes) {
          this.attributes.set(key, this.options.attributes[key]);
        }
      }
      getValue() {
        let str = this.options.selector + "{";
        for (let [key, value] of this.attributes) {
          if (typeof value === "function") {
            value = value();
          }
          // Ignore keys with null or undefined value
          if (value == null) {
            continue;
          }
          key = dashCase(key);

          // If it's a size property, and the value is a number, assume it's in pixels
          if (isNumber(value) && value != 0 && defaultToPixelsAttributes.has(key)) {
            value = value + "px";
          }

          // TODO: if key starts with vendor-, replace it with the browser specific one (and the plain one)
          const buildKeyValue = (key, value) => key + ":" + value + ";";
          if (Array.isArray(value)) {
            for (const v of value) {
              str += buildKeyValue(key, v);
            }
          } else {
            str += buildKeyValue(key, value);
          }
        }
        return str + "}";
      }
      copyState(element) {
        this.setOptions(element.options);
      }
      setAttribute(name, value) {
        this.attributes.set(name, value);
        this.redraw();
      }
      deleteAttribute(name) {
        this.attributes.delete(name);
        this.redraw();
      }
    }
    class StyleElement extends UI$1.Primitive("style") {
      getNodeAttributes() {
        // TODO: allow custom style attributes (media, scoped, etc)
        const attr = new NodeAttributes({});
        if (this.options.name) {
          attr.setAttribute("name", this.options.name);
        }
        return attr;
      }
    }
    const ALLOWED_SELECTOR_STARTS = new Set([":", ">", " ", "+", "~", "[", "."]);

    // TODO: figure out how to work with animation frames, this only creates a wrapper class
    class DynamicStyleElement extends StyleElement {
      constructor(...args) {
        super(...args);
        this.className = void 0;
      }
      toString() {
        return this.getClassName();
      }

      // Overwrite valueOf, so when using the + operator should seamlessly concatenate to create a valid className
      valueOf() {
        return " " + this.getClassName() + " ";
      }

      // TODO: use a cached decorator here
      getClassName() {
        if (this.className) {
          return this.className;
        }
        self.styleInstanceCounter = (self.styleInstanceCounter || 0) + 1;
        this.className = (this.options.name || "autocls") + "-" + self.styleInstanceCounter;
        return this.className;
      }
      getSelector() {
        return this.options.selectorName || "." + this.getClassName();
      }

      // A cyclic dependency in the style object will cause an infinite loop here
      getStyleInstances(selector, style) {
        const result = [];
        const ownStyle = {};
        let haveOwnStyle = false;
        for (const key in style) {
          const value = style[key];
          if (value == null) {
            continue;
          }
          const isProperValue = isString(value) || isNumber(value) || isFunction(value) || Array.isArray(value);
          if (isProperValue) {
            ownStyle[key] = value;
            haveOwnStyle = true;
          } else {
            // Check that this actually is a valid subselector
            const firstChar = String(key).charAt(0);
            if (!ALLOWED_SELECTOR_STARTS.has(firstChar)) {
              console.error(`First character of your selector is invalid. The key is "${key}"`);
              continue;
            }
            // TODO: maybe optimize for waste here?
            const subStyle = this.getStyleInstances(selector + key, value);
            result.push(...subStyle);
          }
        }
        if (haveOwnStyle) {
          result.unshift(new StyleInstance({
            selector: selector,
            key: selector,
            attributes: ownStyle
          }));
        }
        return result;
      }
      render() {
        let style = this.options.style || {};
        if (typeof style === "function") {
          style = style();
        }
        if (style.selectorName) {
          this.options.selectorName = style.selectorName;
          delete style.selectorName;
        }
        return this.getStyleInstances(this.getSelector(), style);
      }
      setStyle(key, value) {
        if (this.options.style && typeof this.options.style === 'object') {
          this.options.style[key] = value;
          this.children[0].setAttribute(key, value);
        }
      }
      setSubStyle(selector, key, value) {
        throw Error("Implement me!");
      }
      getStyleObject() {
        return this.options.style;
      }
    }
    class KeyframeElement extends StyleElement {
      constructor(...args) {
        super(...args);
        this.keyframeName = void 0;
      }
      toString() {
        return this.getKeyframeName();
      }
      getKeyframeName() {
        if (this.keyframeName) {
          return this.keyframeName;
        }
        self.styleInstanceCounter = (self.styleInstanceCounter || 0) + 1;
        this.keyframeName = (this.options.name || "autokeyframe") + "-" + self.styleInstanceCounter;
        return this.keyframeName;
      }
      getValue(style) {
        let str = "{";
        for (let key in style) {
          let value = style[key];
          if (typeof value === "function") {
            value = value();
          }
          if (value == null) {
            continue;
          }
          str += dashCase(key) + ":" + value + ";";
        }
        return str + "}";
      }
      getKeyframeInstance(keyframe) {
        let result = "{";
        for (let key in keyframe) {
          let value = keyframe[key];
          result += key + " " + this.getValue(value);
        }
        return result + "}";
      }
      render() {
        return "@keyframes " + this.getKeyframeName() + this.getKeyframeInstance(this.options.keyframe || {});
      }
    }

    function isDescriptor(desc) {
      if (!desc?.hasOwnProperty) {
        return false;
      }
      const keys = ["value", "initializer", "get", "set"];
      for (let key of keys) {
        if (desc.hasOwnProperty(key)) {
          return true;
        }
      }
      return false;
    }

    // TODO @types what should entryArgs really be?
    function decorate(handleDescriptor, entryArgs) {
      if (isDescriptor(entryArgs[entryArgs.length - 1])) {
        return handleDescriptor(...entryArgs, []);
      } else {
        return function (target, key, descriptor) {
          return handleDescriptor(target, key, descriptor, entryArgs);
        };
      }
    }
    function createDefaultSetter(key) {
      return function set(newValue) {
        Object.defineProperty(this, key, {
          configurable: true,
          writable: true,
          // IS enumerable when reassigned by the outside word
          enumerable: true,
          value: newValue
        });
        return newValue;
      };
    }

    function handleDescriptor(target, key, descriptor, args) {
      const {
        configurable,
        enumerable,
        initializer,
        value
      } = descriptor;
      // The "key" property is constructed with accessor descriptor (getter / setter),
      // but the first time the getter is used, the property is reconstructed with data descriptor.
      return {
        configurable,
        enumerable,
        get() {
          // This happens if someone accesses the property directly on the prototype
          if (this === target) {
            return;
          }
          const ret = initializer ? initializer.call(this) : value;

          // Overwrite the getter & setter combo with the plain field on first assignment.
          Object.defineProperty(this, key, {
            configurable,
            enumerable,
            writable: true,
            value: ret
          });
          return ret;
        },
        set: createDefaultSetter(key)
      };
    }
    function lazyInit(...args) {
      return decorate(handleDescriptor, args);
    }

    function evaluateStyleRuleObject(target, initializer, value, options) {
      let result = initializer ? initializer.call(target) : value;
      if (typeof result === "function") {
        result = result();
      }
      if (Array.isArray(result)) {
        result = Object.assign({}, ...result);
      }
      return result;
    }
    function getStyleRuleKey(key) {
      return "__style__" + String(key);
    }
    function getKeyframesRuleKey(key) {
      return "__keyframes__" + String(key);
    }
    const PREFERRED_CLASS_NAME_KEY = Symbol("PreferredClassName");
    function getPreferredClassName(cls, key, descriptor) {
      if (key !== "container") {
        return String(key);
      }
      let className = cls.constructor.name;
      if (className.endsWith("Style")) {
        className = className.substr(0, className.length - 5);
      }
      className = className.replaceAll("$", ""); // Fix minify mangling
      return className + "-container";
    }

    // TODO @types faking it for Typescript, we're actually using old decorators

    // TODO: this function can be made a lot more generic, to wrap plain object initializer with inheritance support
    function styleRuleWithOptions(...optionsArgs) {
      let options = Object.assign({}, ...optionsArgs);
      // TODO: Remove this if you don't think it's appropiate, I thought a warning would do no harm
      if (!options.targetMethodName) {
        console.error("WARNING: targetMethodName not specified in the options (default is \"css\")");
      }
      let targetMethodName = options.targetMethodName || "css";
      function styleRuleDecorator(target, key, descriptor) {
        const {
          initializer,
          value
        } = descriptor;
        descriptor.objInitializer = function () {
          let style = evaluateStyleRuleObject(this, initializer, value);
          if (options.selector) {
            style["selectorName"] = options.selector;
          }
          if (options.inherit) {
            // Get the value we set in the prototype of the parent class
            let parentDesc = Object.getPrototypeOf(target)[options.getKey(key)];
            if (!parentDesc) {
              console.error("You're trying to inherit a rule that isn't implemented in the parent: " + String(key));
            }
            let parentStyle = evaluateStyleRuleObject(this, parentDesc.objInitializer, parentDesc.value);
            style = deepCopy({}, parentStyle, style);
          }
          style[PREFERRED_CLASS_NAME_KEY] = getPreferredClassName(target, key);
          return style;
        };

        // Change the prototype of this object to be able to access the old descriptor/value
        target[options.getKey(key)] = Object.assign({}, descriptor);
        descriptor.initializer = function () {
          let style = descriptor.objInitializer.call(this);
          return this[targetMethodName](style);
        };
        delete descriptor.value;
        return lazyInit(target, key, descriptor);
      }
      return styleRuleDecorator;
    }

    // TODO: Second argument is mostly useless (implied from targetMethodName)
    const styleRule = styleRuleWithOptions({
      targetMethodName: "css",
      getKey: getStyleRuleKey,
      inherit: false
    });
    const styleRuleInherit = styleRuleWithOptions({
      targetMethodName: "css",
      getKey: getStyleRuleKey,
      inherit: true
    });
    function styleRuleCustom(options) {
      return styleRuleWithOptions(Object.assign({
        targetMethodName: "css",
        getKey: getStyleRuleKey,
        inherit: false
      }, options));
    }
    const keyframesRule = styleRuleWithOptions({
      targetMethodName: "keyframes",
      getKey: getKeyframesRuleKey,
      inherit: false
    });

    // TODO: This is currently not working (I think)
    styleRuleWithOptions({
      targetMethodName: "keyframes",
      getKey: getKeyframesRuleKey,
      inherit: true
    });

    // Class meant to group multiple classes inside a single <style> element, for convenience
    // TODO: pattern should be more robust, to be able to only update classes
    class StyleSheet extends Dispatchable {
      // The default for most style sheets

      constructor(options = {}) {
        super();
        this.options = void 0;
        this.elements = void 0;
        this.options = {
          ...this.getDefaultOptions(options),
          ...options
        };
        this.elements = new Set();
        const {
          delayedMount
        } = this.options;
        if (!delayedMount) {
          this.ensureMounted();
        }
        this.themeProps = this.options.theme.props;
      }
      getDefaultOptions(options) {
        const theme = options.theme || Theme.Global;
        return {
          parent: document.head,
          theme,
          name: options.name || this.constructor.getElementName(theme) // call only if needed
        };
      }
      ensureMounted() {
        if (this.styleElement) {
          return;
        }
        const styleElementOptions = {
          children: [],
          name: this.options.name
        };
        this.styleElement = StyleElement.create(this.options.parent, styleElementOptions);
      }
      static getInstance(theme = this.theme || Theme.Global) {
        return theme.getStyleSheetInstance(this);
      }

      // Just to have the same pattern as objects or not
      getInstance(theme) {
        return this;
      }

      // Generate an instance, and also make sure to instantiate all style elements
      static initialize() {
        const styleSheet = this.getInstance();
        for (const key in this.prototype) {
          // Just hit the getter to instantiate the style
          if (!styleSheet[key]) {
            console.log("This is here to prevent a bundling optimization bug");
          }
        }
      }
      static getElementName(theme) {
        this.elementNameCounter = (this.elementNameCounter || 0) + 1;
        let name = this.name;
        if (theme !== Theme.Global) {
          name += "-" + theme.name;
        }
        name = name.replaceAll("$", ""); // Fix minify mangling
        if (this.elementNameCounter > 1) {
          name += "-" + this.elementNameCounter;
        }
        return name;
      }
      ensureFirstUpdate() {
        if (this._firstUpdate) {
          return;
        }
        this._firstUpdate = true;
        this.ensureMounted();
        // Call all listeners before update for the very first time, to update any possible variables
        this.dispatch("beforeUpdate", this);
      }
      css(style, ...args) {
        this.ensureFirstUpdate();
        if (arguments.length > 1) {
          style = Object.assign({}, style, ...args);
        }
        let elementOptions = {
          style: style
        };
        if (style[PREFERRED_CLASS_NAME_KEY]) {
          elementOptions.name = style[PREFERRED_CLASS_NAME_KEY];
        }
        let element = new DynamicStyleElement(elementOptions);
        this.elements.add(element);
        let styleInstances = element.render();
        for (let styleInstance of styleInstances) {
          this.styleElement.appendChild(styleInstance);
        }
        return element;
      }
      keyframes(keyframes, ...args) {
        this.ensureFirstUpdate();
        // This is not really necessarily as I don't believe it will ever be used
        if (arguments.length > 1) {
          keyframes = Object.assign({}, keyframes, ...args);
        }
        let element = new KeyframeElement({
          keyframe: keyframes
        });
        this.elements.add(element);
        this.styleElement.appendChild(element);
        return element;
      }
      addBeforeUpdateListener(callback) {
        return this.addListener("beforeUpdate", callback);
      }
      update() {
        if (!this._firstUpdate) {
          return;
        }
        this.dispatch("beforeUpdate", this);
        for (const key of Object.keys(this)) {
          if (this[key] instanceof DynamicStyleElement) {
            const desc = this["__style__" + key];
            const func = desc && desc.objInitializer;
            if (func) {
              this[key].options.style = func.call(this);
            }
          }
        }
        let children = [];
        for (let value of this.elements) {
          if (value instanceof StyleElement) {
            let styleElements = value.render();
            children.push(...styleElements);
          }
        }
        this.styleElement.options.children = children;
        this.styleElement.redraw();
      }
    }

    // Helper class, meant to only keep one class active for an element from a set of classes
    // TODO @types remove
    StyleSheet.elementNameCounter = void 0;
    StyleSheet.theme = void 0;

    const COLORS_BY_NAME = {
      aliceblue: "#f0f8ff",
      antiquewhite: "#faebd7",
      aqua: "#00ffff",
      aquamarine: "#7fffd4",
      azure: "#f0ffff",
      beige: "#f5f5dc",
      bisque: "#ffe4c4",
      black: "#000000",
      blanchedalmond: "#ffebcd",
      blue: "#0000ff",
      blueviolet: "#8a2be2",
      brown: "#a52a2a",
      burlywood: "#deb887",
      cadetblue: "#5f9ea0",
      chartreuse: "#7fff00",
      chocolate: "#d2691e",
      coral: "#ff7f50",
      cornflowerblue: "#6495ed",
      cornsilk: "#fff8dc",
      crimson: "#dc143c",
      cyan: "#00ffff",
      darkblue: "#00008b",
      darkcyan: "#008b8b",
      darkgoldenrod: "#b8860b",
      darkgray: "#a9a9a9",
      darkgreen: "#006400",
      darkkhaki: "#bdb76b",
      darkmagenta: "#8b008b",
      darkolivegreen: "#556b2f",
      darkorange: "#ff8c00",
      darkorchid: "#9932cc",
      darkred: "#8b0000",
      darksalmon: "#e9967a",
      darkseagreen: "#8fbc8f",
      darkslateblue: "#483d8b",
      darkslategray: "#2f4f4f",
      darkturquoise: "#00ced1",
      darkviolet: "#9400d3",
      deeppink: "#ff1493",
      deepskyblue: "#00bfff",
      dimgray: "#696969",
      dodgerblue: "#1e90ff",
      firebrick: "#b22222",
      floralwhite: "#fffaf0",
      forestgreen: "#228b22",
      fuchsia: "#ff00ff",
      gainsboro: "#dcdcdc",
      ghostwhite: "#f8f8ff",
      gold: "#ffd700",
      goldenrod: "#daa520",
      gray: "#808080",
      green: "#008000",
      greenyellow: "#adff2f",
      honeydew: "#f0fff0",
      hotpink: "#ff69b4",
      indianred: "#cd5c5c",
      indigo: "#4b0082",
      ivory: "#fffff0",
      khaki: "#f0e68c",
      lavender: "#e6e6fa",
      lavenderblush: "#fff0f5",
      lawngreen: "#7cfc00",
      lemonchiffon: "#fffacd",
      lightblue: "#add8e6",
      lightcoral: "#f08080",
      lightcyan: "#e0ffff",
      lightgoldenrodyellow: "#fafad2",
      lightgray: "#d3d3d3",
      lightgreen: "#90ee90",
      lightpink: "#ffb6c1",
      lightsalmon: "#ffa07a",
      lightseagreen: "#20b2aa",
      lightskyblue: "#87cefa",
      lightslategray: "#778899",
      lightsteelblue: "#b0c4de",
      lightyellow: "#ffffe0",
      lime: "#00ff00",
      limegreen: "#32cd32",
      linen: "#faf0e6",
      magenta: "#ff00ff",
      maroon: "#800000",
      mediumaquamarine: "#66cdaa",
      mediumblue: "#0000cd",
      mediumorchid: "#ba55d3",
      mediumpurple: "#9370db",
      mediumseagreen: "#3cb371",
      mediumslateblue: "#7b68ee",
      mediumspringgreen: "#00fa9a",
      mediumturquoise: "#48d1cc",
      mediumvioletred: "#c71585",
      midnightblue: "#191970",
      mintcream: "#f5fffa",
      mistyrose: "#ffe4e1",
      moccasin: "#ffe4b5",
      navajowhite: "#ffdead",
      navy: "#000080",
      oldlace: "#fdf5e6",
      olive: "#808000",
      olivedrab: "#6b8e23",
      orange: "#ffa500",
      orangered: "#ff4500",
      orchid: "#da70d6",
      palegoldenrod: "#eee8aa",
      palegreen: "#98fb98",
      paleturquoise: "#afeeee",
      palevioletred: "#db7093",
      papayawhip: "#ffefd5",
      peachpuff: "#ffdab9",
      peru: "#cd853f",
      pink: "#ffc0cb",
      plum: "#dda0dd",
      powderblue: "#b0e0e6",
      purple: "#800080",
      red: "#ff0000",
      rosybrown: "#bc8f8f",
      royalblue: "#4169e1",
      saddlebrown: "#8b4513",
      salmon: "#fa8072",
      sandybrown: "#f4a460",
      seagreen: "#2e8b57",
      seashell: "#fff5ee",
      sienna: "#a0522d",
      silver: "#c0c0c0",
      skyblue: "#87ceeb",
      slateblue: "#6a5acd",
      slategray: "#708090",
      snow: "#fffafa",
      springgreen: "#00ff7f",
      steelblue: "#4682b4",
      tan: "#d2b48c",
      teal: "#008080",
      thistle: "#d8bfd8",
      tomato: "#ff6347",
      turquoise: "#40e0d0",
      violet: "#ee82ee",
      wheat: "#f5deb3",
      white: "#ffffff",
      whitesmoke: "#f5f5f5",
      yellow: "#ffff00",
      yellowgreen: "#9acd32"
    };
    /*
     * This class contains methods for operating with colors. Its objects are kept in hsva format with normalized
     * attributes (each attribute has value between 0 and 1 inclusive), and can be converted from/to rgba.
     */
    let Color$1 = class Color {
      constructor(color) {
        this.color = void 0;
        if (color) {
          this.setColor(color);
        }
      }
      setColor(color) {
        this.color = this.constructor.parseColor(color);
      }
      getColor() {
        let rgba = Color.parseColor(this);
        return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`;
      }

      /*
       * @param color A color string of the types: native name, hex3, hex6, rgb, rgba, hsl, hsla
       *              or a Color object, or a hsla color array
       */
      static parseColor(color) {
        if (color instanceof Color) {
          return color.color;
        } else if (color instanceof Array) {
          // Add the alpha parameter at the end
          if (color.length === 3) {
            color.push(1);
          }
          return color;
        }
        color = color.trim().toLowerCase();

        // Check if color is given by name
        if (COLORS_BY_NAME.hasOwnProperty(color)) {
          color = COLORS_BY_NAME[color];
        }
        let values = [0, 0, 0, 1];

        // Check for hex3 (e.g. "#f00")
        let hex3 = color.match(/^#([0-9a-f]{3})$/i);
        if (hex3) {
          values = [parseInt(hex3[1].charAt(0), 16) * 0x11, parseInt(hex3[1].charAt(1), 16) * 0x11, parseInt(hex3[1].charAt(2), 16) * 0x11, 1];
        }

        // Check for hex6 (e.g. "#ff0000")
        let hex6 = color.match(/^#([0-9a-f]{6})$/i);
        if (hex6) {
          values = [parseInt(hex6[1].substr(0, 2), 16), parseInt(hex6[1].substr(2, 2), 16), parseInt(hex6[1].substr(4, 2), 16), 1];
        }

        // Check for rgba (e.g. "rgba(255, 0, 0, 0.5)")
        let rgba = color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+\.?\d*)\s*\)$/i);
        if (rgba) {
          values = [parseInt(rgba[1]), parseInt(rgba[2]), parseInt(rgba[3]), parseFloat(rgba[4])];
        }

        // Check for rgb (e.g. "rgb(255, 0, 0)")
        let rgb = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        if (rgb) {
          values = [parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3]), 1];
        }
        return values;
      }

      // TODO: this should be implemented as a factory that generates an interpolator object, that just takes in a t
      static interpolate(firstColor, secondColor, t = 0.5) {
        let firstColorArray = Color.parseColor(firstColor);
        let secondColorArray = Color.parseColor(secondColor);
        return Color.convertToRgba([parseInt(firstColorArray[0] * (1 - t) + secondColorArray[0] * t + ""), parseInt(firstColorArray[1] * (1 - t) + secondColorArray[1] * t + ""), parseInt(firstColorArray[2] * (1 - t) + secondColorArray[2] * t + ""), parseFloat(firstColorArray[3] * (1 - t) + secondColorArray[3] * t + "")]);
      }
      static addOpacity(color, opacity) {
        let colorArray = Color.parseColor(color);
        return Color.convertToRgba([parseInt(colorArray[0] + ""), parseInt(colorArray[1] + ""), parseInt(colorArray[2] + ""), opacity]);
      }
      static convertToRgba(rgba) {
        return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`;
      }
      static isLight(color) {
        let values = Color.parseColor(color);
        return values[0] * 0.3 + values[1] * 0.59 + values[2] * 0.11 > 188;
      }
      static isWhite(color) {
        let values = Color.parseColor(color);
        return values[0] === 255 && values[1] === 255 && values[2] === 255 && values[3] === 1;
      }
      static isBlack(color) {
        let values = Color.parseColor(color);
        return values[0] === 0 && values[1] === 0 && values[2] === 0 && values[3] === 1;
      }
    };
    function lighten(color, amount) {
      if (amount >= 0) {
        return Color$1.interpolate(color, "#fff", amount);
      } else {
        return darken(color, -amount);
      }
    }
    function darken(color, amount) {
      if (amount >= 0) {
        let rgba = Color$1.parseColor(Color$1.interpolate(color, "#000", amount));
        for (let i = 0; i < 3; i += 1) {
          let root = Math.pow(255 - rgba[i], 0.7);
          rgba[i] = parseInt(rgba[i] - root * amount + "");
          if (rgba[i] < 0) {
            rgba[i] = 0;
          }
        }
        return Color$1.convertToRgba(rgba);
      } else {
        return lighten(color, -amount);
      }
    }
    const COLOR_MATCHER_REGEXP = new RegExp(`(#[0-9a-f]{6}|#[0-9a-f]{3}|rgba\\s*\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d*\\.?\\d*\\s*\\)|rgb\\s*\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*\\))|${Object.keys(COLORS_BY_NAME).sort((a, b) => b.length - a.length).join("|")}`, "gi");
    function saturateColor(color, saturate) {
      const rgba = Color$1.parseColor(color);
      const rgb = rgba.slice(0, 3);
      const maxValueIndex = rgb.findIndex(x => x === Math.max(...rgb));
      const minValueIndex = rgb.findIndex((x, i) => x === Math.min(...rgb) && i !== maxValueIndex);
      const midValueIndex = 3 - minValueIndex - maxValueIndex;
      const lightness = (rgb[maxValueIndex] + rgb[minValueIndex]) / 2 / 255;
      const grayValue = lightness * 255;
      const saturationRange = Math.round(Math.min(255 - grayValue, grayValue));
      const saturateSign = saturate > 0 ? 1 : -1;
      const saturateValue = Math.abs(saturate);
      const maxChange = saturate > 0 ? Math.min(255 - rgb[maxValueIndex], Math.max(saturate * 30, rgb[minValueIndex])) : grayValue - rgb[minValueIndex];
      const changeAmount = Math.min(saturationRange * saturateValue, maxChange);
      const highDiff = grayValue - rgb[maxValueIndex];
      const midDiff = grayValue - rgb[midValueIndex];
      let midValueRatio;
      if (highDiff === 0) {
        midValueRatio = 1;
      } else {
        midValueRatio = midDiff / highDiff;
      }
      rgb[minValueIndex] -= saturateSign * changeAmount;
      rgb[maxValueIndex] += saturateSign * changeAmount;
      rgb[midValueIndex] = grayValue + (rgb[maxValueIndex] - grayValue) * midValueRatio;
      const newRGBA = rgb.map(x => Math.min(255, Math.max(0, Math.round(x))));
      newRGBA.push(rgba[3]);
      return Color$1.convertToRgba(newRGBA);
    }
    function enhanceColor(color, amount, saturate) {
      let enhancedColor;
      if (Color$1.isLight(color)) {
        enhancedColor = darken(color, amount);
      } else {
        enhancedColor = lighten(color, amount);
      }
      return saturateColor(enhancedColor, saturate);
    }

    // gamma: [-1,1], saturate: [-1,1] (you can also try bigger values, seems to be working fine, heh)
    function enhance(colorContainingString, gamma, saturate = 0) {
      return colorContainingString.replace(COLOR_MATCHER_REGEXP, color => enhanceColor(color, gamma, saturate));
    }
    function buildColors(color, dark = true) {
      let colors = [];
      let darkenPercents;
      if (!dark) {
        darkenPercents = [0.1, 0, -0.2, -0.3, -0.35, -0.2, -1];
      } else if (Color$1.isLight(color)) {
        darkenPercents = [0.05, 0, 0.05, 0.1, 0.15, 0.3, 0.8];
      } else {
        darkenPercents = [-0.3, 0, 0.1, 0.2, 0.23, 0.1, -1];
      }
      for (let i = 0; i < darkenPercents.length; i += 1) {
        colors.push(darken(color, darkenPercents[i]));
      }
      return colors;
    }
    class ColorGenerator {
      static getPersistentColor(uniqueId) {
        if (uniqueId < this.FIRST_COLORS.length) {
          return this.FIRST_COLORS[uniqueId];
        }
        if (!this.cache.has(uniqueId)) {
          this.cache.set(uniqueId, this.getRandomColor());
        }
        return this.cache.get(uniqueId);
      }
      static getRandomColor() {
        const allowed = "3456789ABC";
        let color = "#";
        for (let i = 0; i < 6; i += 1) {
          color += allowed.charAt(parseInt(Math.random() * allowed.length + ""));
        }
        return color;
      }
    }
    ColorGenerator.FIRST_COLORS = ["#337ab7", "#5cb85c", "#f0ad4e", "#5bc0de", "#d9534f"];
    ColorGenerator.cache = new Map();

    // Primitive utils for wrapping browser info

    function isTouchDevice() {
      return !!("createTouch" in window.document || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 || "ontouchstart" in window);
    }
    function isMobileDevice() {
      const mobileDevices = ["Android", "webOS", "iPad", "iPhone", "iPod", "BlackBerry", "Windows Phone"];
      for (let device of mobileDevices) {
        if (navigator.userAgent.indexOf(device) !== -1) {
          return true;
        }
      }
      return false;
    }
    function isLandscape() {
      const orientation = window.screen.orientation;
      if (orientation === -90 || orientation === 90) {
        return true;
      }
      if (!isMobileDevice()) {
        return window.innerWidth > window.innerHeight;
      }
      const width = isMobileDevice() && window.screen?.width || window.innerWidth;
      const height = isMobileDevice() && window.screen?.height || window.innerHeight;
      return width > height || height < 380;
    }
    function getEventTouchIdentifier(event) {
      return Math.min(...Array.from(event.touches).map(touch => touch.identifier));
    }
    function getEventTouch(event) {
      const identifier = getEventTouchIdentifier(event);
      return Array.from(event.touches).find(touch => touch.identifier === identifier);
    }
    function getEventCoord(event, axis, reference = "client") {
      let coordName = reference + axis;
      if (event[coordName]) {
        return event[coordName];
      }
      if (event.touches) {
        const touch = getEventTouch(event);
        return touch ? touch[coordName] : undefined;
      }
      if (event.originalEvent) {
        return getEventCoord(event.originalEvent, axis, reference);
      }
      console.warn("Couldn't find coordinates for event. Maybe wrong reference point? (client/page/screen)");
      return undefined;
    }
    function getEventX(event, reference = "client") {
      return getEventCoord(event, "X", reference);
    }
    function getEventY(event, reference = "client") {
      return getEventCoord(event, "Y", reference);
    }
    function getBrowser() {
      // TODO: should try to use navigator
      if (window.opr && window.opr.addons || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
        return "Opera";
      }
      if (typeof window.InstallTrigger !== 'undefined') {
        return "Firefox";
      }
      if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
        return "Safari";
      }
      if (document.documentMode) {
        return "Internet Explorer";
      }
      if (window.StyleMedia) {
        return "Edge";
      }
      if (window.chrome && window.chrome.webstore) {
        return "Chrome";
      }
      return "Unknown";
    }
    const supportsEventCache = new Map();
    function supportsEvent(eventName) {
      if (!supportsEventCache.has(eventName)) {
        const element = document.createElement("div");
        const onEventName = "on" + eventName;
        let isSupported = onEventName in element;
        if (!isSupported) {
          element.setAttribute(onEventName, "return;");
          isSupported = typeof element[onEventName] === "function";
        }
        supportsEventCache.set(eventName, isSupported);
      }
      return supportsEventCache.get(eventName);
    }

    // TODO This object is deprecated, use the functions in this file directly instead.
    const Device = {
      isTouchDevice,
      isMobileDevice,
      isLandscape,
      getEventTouchIdentifier,
      getEventTouch,
      getEventCoord,
      getEventX,
      getEventY,
      getBrowser,
      supportsEvent
    };

    const Orientation$1 = {
      HORIZONTAL: 1,
      VERTICAL: 2
    };
    const Direction = {
      UP: "up",
      LEFT: "left",
      DOWN: "down",
      RIGHT: "right"
    };
    const Level = {
      INFO: "info",
      PRIMARY: "primary",
      SECONDARY: "secondary",
      SUCCESS: "success",
      WARNING: "warning",
      DANGER: "error",
      ERROR: "error"
    };
    const Size = {
      NONE: null,
      EXTRA_SMALL: "xs",
      SMALL: "sm",
      LARGE: "lg",
      EXTRA_LARGE: "xl"
    };
    const VoteStatus = {
      NONE: null,
      LIKE: 1,
      DISLIKE: 0
    };
    const ActionStatus = {
      INITIAL: 1,
      RUNNING: 2,
      SUCCESS: 3,
      FAILED: 4
    };

    var _class2$1j, _descriptor8$n, _descriptor9$i, _class3$q, _descriptor0$e, _descriptor1$c, _descriptor10$a, _descriptor11$9, _descriptor12$9, _class4$f, _descriptor13$8, _descriptor14$8, _descriptor15$8;

    // Type definitions for CSS style objects

    // TODO @types move to Theme?

    function getTextColor(backgroundColor) {
      return enhance(backgroundColor, 1);
    }
    Theme.setProperties({
      // TODO use _COLOR as a suffix
      COLOR_BACKGROUND: "#fff",
      COLOR_BACKGROUND_ALTERNATIVE: "#eee",
      COLOR_BACKGROUND_BODY: "#f8f8f8",
      COLOR_FOREGROUND_BODY: "#f2f2f2",
      COLOR_BACKGROUND_BADGE: "#777",
      COLOR_PRIMARY: "#337ab7",
      COLOR_SECONDARY: "#358ba4",
      COLOR_SUCCESS: "#5cb85c",
      COLOR_INFO: "#5bc0de",
      COLOR_WARNING: "#f0ad4e",
      COLOR_DANGER: "#d9534f",
      COLOR_LINK: "#337ab7",
      FONT_SIZE_EXTRA_SMALL: 10,
      FONT_SIZE_SMALL: 12,
      FONT_SIZE_DEFAULT: 14,
      FONT_SIZE_LARGE: 17,
      FONT_SIZE_EXTRA_LARGE: 21,
      FONT_WEIGHT_DEFAULT: 400,
      FONT_WEIGHT_BOLD: 700,
      GENERAL_LINE_HEIGHT: "1.5",
      BASE_DISABLED_OPACITY: FloatType(0.6),
      DEFAULT_TRANSITION_DURATION_MS: 250,
      DEFAULT_TRANSITION: props => props.DEFAULT_TRANSITION_DURATION_MS + "ms ease",
      BASE_BORDER_RADIUS: 0,
      BASE_BOX_SHADOW: "0px 0px 10px rgb(160, 162, 168)",
      BASE_BORDER_WIDTH: 0,
      BASE_BORDER_STYLE: "solid",
      BASE_BORDER_COLOR: "#ddd",
      BUTTON_PADDING: "6px 12px",
      BUTTON_BORDER_RADIUS: props => props.BASE_BORDER_RADIUS,
      BUTTON_COLOR: props => props.COLOR_BACKGROUND,
      BUTTON_FONT_WEIGHT: props => props.FONT_WEIGHT_DEFAULT,
      TOGGLE_COLOR: "#086472",
      TOGGLE_BACKGROUND: "#D2E2E5",
      TOGGLE_PILL_SIZE: 20,
      TOGGLE_DISABLED_BACKGROUND: "#78AAB2",
      TOGGLE_SHADOW: "0 1px 1px 0 rgba(0,0,0,.14), 0 2px 1px -1px rgba(0,0,0,.12), 0 1px 3px 0 rgba(0,0,0,.2)",
      CARD_HEADER_BACKGROUND_COLOR: "#ccc",
      CARD_HEADER_TEXT_COLOR: "#222",
      CARD_HEADER_HEIGHT: "",
      CARD_PANEL_HEADER_HEIGHT: 30,
      CARD_PANEL_HEADER_HEIGHT_LARGE: 40,
      CARD_PANEL_HEADING_PADDING: 10,
      CARD_PANEL_HEADING_PADDING_LARGE: 20,
      CARD_PANEL_TEXT_TRANSFORM: "inherit",
      DARK_BOX_SHADOW: "0px 0px 10px rgba(0, 0, 0, .6)",
      ROW_LIST_ROW_HEIGHT: 30,
      ROW_LIST_ROW_HEIGHT_LARGE: 40,
      ROW_LIST_ROW_PADDING: 10,
      ROW_LIST_ROW_PADDING_LARGE: 20,
      ROW_LIST_ROW_BORDER_WIDTH: 1,
      FONT_FAMILY_SANS_SERIF: "Lato, 'Segoe UI', 'Lucida Sans Unicode', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      FONT_FAMILY_SERIF: "serif",
      FONT_FAMILY_MONOSPACE: "'Source Code Pro', Menlo, Monaco, Consolas, 'Courier New', monospace",
      FONT_FAMILY_DEFAULT: props => props.FONT_FAMILY_SANS_SERIF,
      NAV_MANAGER_NAVBAR_HEIGHT: 50,
      NAV_MANAGER_BOX_SHADOW_NAVBAR: "0px 0px 10px rgb(0, 0, 0)",
      NAV_MANAGER_BOX_SHADOW_SIDE_PANEL: "0px 0px 10px #202e3e",
      MAIN_CONTAINER_EXTRA_PADDING_TOP_DESKTOP: 0,
      MAIN_CONTAINER_EXTRA_PADDING_TOP_MOBILE: 0,
      MAIN_CONTAINER_EXTRA_PADDING_BOTTOM_DESKTOP: 0,
      MAIN_CONTAINER_EXTRA_PADDING_BOTTOM_MOBILE: 0,
      FLAT_TAB_AREA_LINE_HEIGHT: 30,
      FLAT_TAB_AREA_PADDING_SIDES: 10,
      FLAT_TAB_AREA_UNDERLINE_HEIGHT: 3,
      INPUT_BACKGROUND: "#fff",
      INPUT_BORDER_COLOR: "#E5EAE9",
      INPUT_BORDER_RADIUS: 4
    });
    class BasicLevelSizeStyleSheet extends StyleSheet {
      Level(level) {
        if (!level) {
          return null;
        }
        if (this[level]) {
          return this[level];
        }
        for (let type of Object.keys(Level)) {
          if (level == Level[type]) {
            return this[type];
          }
        }
      }
      Size(size) {
        if (!size) {
          return null;
        }
        for (let type of Object.keys(Size)) {
          if (size == Size[type]) {
            return this[type];
          }
        }
      }
    }
    const BasicLevelStyleSheet = colorToStyleFunction => {
      var _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
      return _class = class BasicLevelStyleClass extends BasicLevelSizeStyleSheet {
        constructor(...args) {
          super(...args);
          _initializerDefineProperty(this, "BASE", _descriptor, this);
          _initializerDefineProperty(this, "PRIMARY", _descriptor2, this);
          _initializerDefineProperty(this, "SECONDARY", _descriptor3, this);
          _initializerDefineProperty(this, "SUCCESS", _descriptor4, this);
          _initializerDefineProperty(this, "INFO", _descriptor5, this);
          _initializerDefineProperty(this, "WARNING", _descriptor6, this);
          _initializerDefineProperty(this, "DANGER", _descriptor7, this);
        }
        colorStyleRule(color, textColor) {
          return colorToStyleFunction(color, textColor || getTextColor(color));
        }
      }, _descriptor = _applyDecoratedDescriptor(_class.prototype, "BASE", [styleRule], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return this.colorStyleRule(this.themeProps.COLOR_BACKGROUND);
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "PRIMARY", [styleRule], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return this.colorStyleRule(this.themeProps.COLOR_PRIMARY);
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "SECONDARY", [styleRule], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return this.colorStyleRule(this.themeProps.COLOR_SECONDARY);
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "SUCCESS", [styleRule], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return this.colorStyleRule(this.themeProps.COLOR_SUCCESS);
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, "INFO", [styleRule], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return this.colorStyleRule(this.themeProps.COLOR_INFO);
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, "WARNING", [styleRule], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return this.colorStyleRule(this.themeProps.COLOR_WARNING);
        }
      }), _descriptor7 = _applyDecoratedDescriptor(_class.prototype, "DANGER", [styleRule], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return this.colorStyleRule(this.themeProps.COLOR_DANGER);
        }
      }), _class;
    };
    let FlexContainerStyle = (_class2$1j = class FlexContainerStyle extends StyleSheet {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "HORIZONTAL", _descriptor8$n, this);
        _initializerDefineProperty(this, "VERTICAL", _descriptor9$i, this);
      }
      Orientation(orientation) {
        for (let type of Object.keys(Orientation$1)) {
          if (orientation == Orientation$1[type]) {
            return this[type];
          }
        }
      }
    }, _descriptor8$n = _applyDecoratedDescriptor(_class2$1j.prototype, "HORIZONTAL", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          display: "flex",
          ">*": {
            marginLeft: 20,
            flex: "1"
          },
          ">:first-child": {
            marginLeft: 0
          }
        };
      }
    }), _descriptor9$i = _applyDecoratedDescriptor(_class2$1j.prototype, "VERTICAL", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          display: "flex",
          flexDirection: "column",
          ">*": {
            marginTop: 20,
            flex: "1"
          },
          ">:first-child": {
            marginTop: 0
          }
        };
      }
    }), _class2$1j);
    let ContainerStyle = (_class3$q = class ContainerStyle extends StyleSheet {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "EXTRA_SMALL", _descriptor0$e, this);
        _initializerDefineProperty(this, "SMALL", _descriptor1$c, this);
        _initializerDefineProperty(this, "MEDIUM", _descriptor10$a, this);
        _initializerDefineProperty(this, "LARGE", _descriptor11$9, this);
        _initializerDefineProperty(this, "EXTRA_LARGE", _descriptor12$9, this);
      }
      getSizeStyle(mobilePixels, desktopPercent) {
        return {
          margin: Device.isMobileDevice() ? `0 ${mobilePixels}px` : `0% ${desktopPercent}%`
        };
      }
      Size(size) {
        for (let type of Object.keys(Size)) {
          if (size == Size[type]) {
            return this[type];
          }
        }
      }
    }, _descriptor0$e = _applyDecoratedDescriptor(_class3$q.prototype, "EXTRA_SMALL", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return this.getSizeStyle(6, 15);
      }
    }), _descriptor1$c = _applyDecoratedDescriptor(_class3$q.prototype, "SMALL", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return this.getSizeStyle(4, 10);
      }
    }), _descriptor10$a = _applyDecoratedDescriptor(_class3$q.prototype, "MEDIUM", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return this.getSizeStyle(4, 6);
      }
    }), _descriptor11$9 = _applyDecoratedDescriptor(_class3$q.prototype, "LARGE", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return this.getSizeStyle(2, 3);
      }
    }), _descriptor12$9 = _applyDecoratedDescriptor(_class3$q.prototype, "EXTRA_LARGE", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return this.getSizeStyle(2, 1);
      }
    }), _class3$q);
    let StyleUtils = (_class4$f = class StyleUtils extends StyleSheet {
      constructor(...args) {
        super(...args);
        this.extraTop = () => this.themeProps[Device.isMobileDevice() ? "MAIN_CONTAINER_EXTRA_PADDING_TOP_MOBILE" : "MAIN_CONTAINER_EXTRA_PADDING_TOP_DESKTOP"];
        _initializerDefineProperty(this, "fullHeight", _descriptor13$8, this);
        _initializerDefineProperty(this, "hidden", _descriptor14$8, this);
        // Use this class for content that has no space between it and the navbar.
        _initializerDefineProperty(this, "fullContainer", _descriptor15$8, this);
      }
      // TODO @types
      get Utils() {
        return StyleUtils.getInstance();
      }
      get Container() {
        return ContainerStyle.getInstance();
      }
      get FlexContainer() {
        return FlexContainerStyle.getInstance();
      }
    }, _descriptor13$8 = _applyDecoratedDescriptor(_class4$f.prototype, "fullHeight", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          height: "100%"
        };
      }
    }), _descriptor14$8 = _applyDecoratedDescriptor(_class4$f.prototype, "hidden", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          display: "none"
        };
      }
    }), _descriptor15$8 = _applyDecoratedDescriptor(_class4$f.prototype, "fullContainer", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          width: "100%",
          height: () => "calc(100% + " + this.extraTop() + "px)",
          marginTop: () => -this.extraTop()
        };
      }
    }), _class4$f); // TODO simplify this
    const GlobalStyle = StyleUtils.getInstance();

    class Switcher extends UIElement {
      constructor(...args) {
        super(...args);
        this.numRedraws = 0;
        this.childMap = new WeakMap();
        this.activeChild = void 0;
      }
      getPreferredActive() {
        const {
          children
        } = this.options;
        for (const child of children) {
          if (child.options.active) {
            return child;
          }
        }
        return children[0] || this.activeChild;
      }
      getDefaultOptions() {
        return {
          fullHeight: false,
          preserveScroll: true
        };
      }
      extraNodeAttributes(attr) {
        if (this.options.fullHeight) {
          attr.addClass(GlobalStyle.fullHeight);
        }
      }
      copyState(element) {
        const options = {
          ...element.options,
          children: this.overwriteChildren(this.options.children || [], element.options.children || [])
        };

        // TODO @Mihai use the logic from UIElement.copyState
        this.setOptions(options);
        this.activeChild = this.getPreferredActive();
      }
      render() {
        return this.activeChild || this.options.children && this.options.children[0];
      }
      overwriteChildren(existingChildren, newChildren) {
        let keyMap = this.getElementKeyMap(existingChildren) || new Map();
        for (let i = 0; i < newChildren.length; i += 1) {
          let newChild = newChildren[i];
          let newChildKey = newChild.options?.key || "autokey" + i;
          let existingChild = keyMap.get(newChildKey);
          if (existingChild === newChild) {
            continue;
          }
          const wasActive = existingChild === this.activeChild;
          if (existingChild && newChild.canOverwrite(existingChild)) {
            newChildren[i] = newChild = this.overwriteChild(existingChild, newChild);
          }
          if (wasActive) {
            newChild.options.active = true;
          }
        }
        return newChildren;
      }
      redraw() {
        this.numRedraws += 1;

        //basic things for our current node
        this.applyNodeAttributes();
        this.applyRef();

        // This render may be required to update this.options.children
        RenderStack.push(this);
        this.render();
        RenderStack.pop();
        if (!this.options.children || this.options.children.length === 0) {
          return false;
        }
        const activeChild = this.activeChild || this.options.children[0];
        for (let child of this.options.children) {
          if (child === activeChild) {
            continue;
          }
          if (this.options.lazyRender) {
            this.getChildProperties(child).isUpToDate = false;
            child.applyRef();
          } else {
            this.updateChild(child);
          }
        }
        this.updateActiveChild(activeChild);
        return true;
      }
      getChildProperties(child) {
        if (!this.childMap.has(child)) {
          this.childMap.set(child, {
            isMounted: !!child.node,
            redrawIndex: -1
          });
        }
        return this.childMap.get(child);
      }
      updateChild(child) {
        if (this.getChildProperties(child).redrawIndex < this.numRedraws) {
          if (!child.node) {
            child.mount(this);
          } else {
            child.redraw();
          }
          this.getChildProperties(child).redrawIndex = this.numRedraws;
        }
      }
      appendChild(child, doMount = false) {
        if (!this.options.children) {
          this.options.children = [];
        }
        this.options.children.push(child);
        if (doMount) {
          child.mount(this);
        }
        if (this.options.children.length === 1) {
          this.setActive(child);
        }
        return child;
      }
      getActive() {
        return this.activeChild;
      }
      insertChildNodeBefore(child, nextSibling) {
        let childProperties = this.getChildProperties(child);
        childProperties.isMounted = true;
        childProperties.redrawIndex = this.numRedraws;
      }
      updateActiveChild(element) {
        // Removing and reinserting the same node is inefficient, so
        // just update the internal state of the switcher instead.
        if (element && element.node === this.node.firstChild) {
          this.updateChild(element);
          this.children[0] = this.activeChild = element;
          return;
        }
        while (this.node.firstChild) {
          //TODO: would be useful here to be able to access the matching UI Element
          this.node.removeChild(this.node.firstChild);
        }
        if (!element) {
          this.activeChild = undefined;
          return;
        }
        this.updateChild(element);
        this.node.appendChild(element.node);
        this.children[0] = this.activeChild = element;
      }
      deactivateChild(child) {
        child.dispatch("hide");
        child.dispatch("setActive", false);
        if (this.options.preserveScroll) {
          this.getChildProperties(child).scrollTop = this.node.scrollTop;
        }
      }
      activateChild(child) {
        child.dispatch("setActive", true);
        child.dispatch("show");
        if (this.options.preserveScroll) {
          this.node.scrollTop = this.getChildProperties(child).scrollTop || 0;
        }
      }
      setActive(element) {
        if (this.activeChild === element) {
          return;
        }
        if (this.activeChild) {
          this.deactivateChild(this.activeChild);
        }
        this.updateActiveChild(element);
        if (this.activeChild) {
          this.activateChild(this.activeChild);
        }
      }
      hasChild(element) {
        return this.childMap.has(element);
      }
      onMount() {
        this.addListener("shouldRedrawChild", event => {
          if (event.child.isInDocument()) {
            event.child.redraw();
          } else {
            this.getChildProperties(event.child).isUpToDate = false;
          }
        });
      }
    }

    class PageTitleManager {
      static getPrefix() {
        return this.prefix;
      }
      static setPrefix(prefix) {
        this.prefix = prefix;
        this.updatePageTitle();
      }
      static setDefaultTitle(defaultTitle) {
        this.defaultTitle = defaultTitle;
      }
      static getTitle() {
        return this.title || this.defaultTitle;
      }
      static setTitle(title) {
        this.title = title;
        this.updatePageTitle();
      }
      static getFullPageTitle() {
        return unwrapArray([this.getPrefix(), this.getTitle()]).join(" - ");
      }
      static updatePageTitle() {
        document.title = this.getFullPageTitle();
      }
      static setIcon() {
        throw new Error("Not implemented yet!");
      }
    }
    PageTitleManager.title = null;
    PageTitleManager.defaultTitle = "Website";
    PageTitleManager.prefix = null;

    class Router extends Switcher {
      // Return a historic page, depth = 0 current, depth = 1 previous, etc
      static getHistoricPath(depth) {
        depth = Math.abs(depth); // So negatives also work
        const index = this.localHistory.length - 1 - depth;
        if (index < 0) {
          return null;
        }
        const url = this.localHistory[index];

        // TODO @cleanup this should use new URL(url), only keeping Denis's shit code to not break anything
        return url.split("?")[0].split("#")[0];
      }
      static getCurrentPath() {
        let path = "";
        if (this.useLocalHistory && this.localHistory.length) {
          // We do this to get rid of query params or hash params
          path = this.getHistoricPath(0);
        } else {
          path = location.pathname;
        }
        return path;
      }
      static parseURL(path = location.pathname) {
        if (!Array.isArray(path)) {
          path = path.split("/");
        }
        return path.filter(str => str != "");
      }
      static joinQueryParams(queryParams = {}) {
        return Object.keys(queryParams).map(param => `${encodeURIComponent(param)}=${encodeURIComponent(queryParams[param])}`).join("&");
      }
      static formatURL(url) {
        if (Array.isArray(url)) {
          url = url.length ? "/" + url.join("/") : "/";
        }
        if (isString(url) && url[0] !== "/") {
          url = "/" + url;
        }
        return url;
      }
      static changeURL(url, options = {
        queryParams: {},
        state: {},
        replaceHistory: false,
        forceElementUpdate: false,
        keepSearchParams: false
      }) {
        url = this.formatURL(url);
        if (options.queryParams && Object.keys(options.queryParams).length > 0) {
          const queryString = this.joinQueryParams(options.queryParams);
          url = `${url}?${queryString}`;
        } else if (options.keepSearchParams) {
          url += location.search;
        }
        if (url === window.location.pathname && !options.forceElementUpdate) {
          // We're already here
          return;
        }
        options.state = options.state || {};
        const historyArgs = [options.state, PageTitleManager.getTitle(), url];
        if (this.useLocalHistory) {
          if (options.replaceHistory) {
            this.localHistory.pop();
          }
          if (this.localHistory.length === 0 || this.localHistory[this.localHistory.length - 1] != url) {
            this.localHistory.push(url);
          }
        } else {
          if (options.replaceHistory) {
            window.history.replaceState(...historyArgs);
          } else {
            window.history.pushState(...historyArgs);
          }
        }
        this.updateURL();
      }
      static onPopState() {
        this.changeURL(this.parseURL(this.getCurrentPath()), {
          replaceHistory: true,
          forceElementUpdate: true,
          keepSearchParams: true
        });
        Dispatcher.Global.dispatch("externalURLChange");
      }
      static back() {
        if (this.useLocalHistory) {
          this.localHistory.pop();
          this.onPopState();
        } else {
          window.history.back();
        }
      }
      static updateURL() {
        this.Global.setURL(this.parseURL(this.getCurrentPath()));
      }
      static setGlobalRouter(router) {
        this.Global = router;
        window.onpopstate = () => {
          this.onPopState();
        };
        if (this.globalSetURL) {
          this.Global.setURL = this.globalSetURL;
        }
        this.updateURL();
      }
      clearCache() {
        this.getRoutes().clearCache();
      }

      // TODO: should be named getRootRoute() :)
      getRoutes() {
        return this.options.routes;
      }
      getPageNotFound() {
        const element = UI$1.createElement("h1", {
          children: ["Can't find url, make sure you typed it correctly"]
        });
        element.pageTitle = "Page not found";
        return element;
      }
      getPageToRender(urlParts) {
        const result = this.getRoutes().getPage(urlParts);
        if (result === false) {
          return this.getPageNotFound();
        }
        if (Array.isArray(result)) {
          this.constructor.changeURL(...result);
          return null;
        }
        return result;
      }
      deactivateChild(child) {
        super.deactivateChild(child);
        if (child.options.doNotCache) {
          child.destroyNode();
        }
      }
      setURL(urlParts) {
        urlParts = unwrapArray(urlParts);
        const page = this.getPageToRender(urlParts);
        if (!page) return;
        const activePage = this.getActive();
        if (activePage !== page) {
          activePage?.dispatch("urlExit");
          this.setActive(page);
          page.dispatch("urlEnter");
        } else {
          page.dispatch("urlReload");
        }
        if (page.pageTitle) {
          PageTitleManager.setTitle(page.pageTitle);
        }
        this.dispatchChange(urlParts, page, activePage);
      }
      onMount() {
        if (!Router.Global) {
          this.constructor.setGlobalRouter(this);
        }
      }
    }
    Router.Global = void 0;
    Router.globalSetURL = void 0;
    // TODO: This works bad with query params. Fix it!
    Router.localHistory = [];
    // If we want the router to not alter the window history, use this instead.
    Router.useLocalHistory = false;
    class Route {
      getDefaultOptions() {
        return {
          beforeEnter: null,
          cachePage: true
        };
      }
      constructor(expr, pageGenerator, subroutes = [], options = {}) {
        this.expr = void 0;
        this.pageGenerator = void 0;
        this.subroutes = void 0;
        this.options = void 0;
        this.cachedPages = new Map();
        this.expr = expr instanceof Array ? expr : [expr];
        this.pageGenerator = pageGenerator;
        this.subroutes = unwrapArray(subroutes);
        if (typeof options === "string") {
          options = {
            title: options
          };
        }
        this.options = {
          ...this.getDefaultOptions(),
          ...options
        };
        this.cachedPages = new Map();
      }
      clearCache() {
        this.cachedPages.clear();
        for (const subroute of this.subroutes) {
          if (subroute.clearCache) {
            subroute.clearCache();
          }
        }
      }
      matches(urlParts) {
        if (urlParts.length < this.expr.length) {
          return null;
        }
        let args = [];
        for (let i = 0; i < this.expr.length; i += 1) {
          const isArg = this.expr[i] === this.constructor.ARG_KEY;
          if (urlParts[i] != this.expr[i] && !isArg) {
            return null;
          }
          if (isArg) {
            args.push(urlParts[i]);
          }
        }
        return {
          args: args,
          urlParts: urlParts.slice(this.expr.length)
        };
      }
      getPageTitle() {
        return this.options.title;
      }
      getPageGuard() {
        return this.options.beforeEnter;
      }
      generatePage(pageGenerator, ...argsArray) {
        if (!pageGenerator) {
          return null;
        }
        const serializedArgs = argsArray.toString();
        if (!this.cachedPages.has(serializedArgs)) {
          const args = unwrapArray(argsArray);
          const generatorArgs = {
            args,
            argsArray,
            doNotCache: this.options.doNotCache
          };
          const page = pageGenerator.prototype instanceof UI$1.Element ? new pageGenerator(generatorArgs) : pageGenerator(generatorArgs);
          if (page && !page.pageTitle) {
            const myPageTitle = this.getPageTitle();
            if (myPageTitle) {
              page.pageTitle = this.getPageTitle();
            }
          }
          if (this.options.doNotCache) {
            return page;
          }
          this.cachedPages.set(serializedArgs, page);
        }
        return this.cachedPages.get(serializedArgs);
      }
      matchesOwnNode(urlParts) {
        return urlParts.length === 0;
      }
      executeGuard() {
        const pageGuard = this.getPageGuard();
        if (!pageGuard) {
          return null;
        }
        return pageGuard(this.getSnapshot());
      }
      getPage(urlParts, router, ...argsArray) {
        let match;
        let matchingRoute = this.matchesOwnNode(urlParts) ? this : null;
        if (!matchingRoute) {
          for (const subroute of this.subroutes) {
            match = subroute.matches(urlParts);
            if (!match) {
              continue;
            }
            if (match.args.length) {
              argsArray.push(match.args);
            }
            matchingRoute = subroute;
            break;
          }
        }
        if (!matchingRoute) {
          return false;
        }
        const guardResult = this.executeGuard();
        if (!guardResult) {
          return matchingRoute === this ? this.generatePage(this.pageGenerator, ...argsArray) : matchingRoute.getPage(match.urlParts, router, ...argsArray);
        }
        if (Array.isArray(guardResult)) {
          return guardResult;
        }
        return this.generatePage(guardResult, ...argsArray);
      }
      getSnapshot() {
        return {
          expr: this.expr,
          url: window.location.href,
          path: `${window.location.pathname}${window.location.search}`,
          params: new URLSearchParams(window.location.search)
        };
      }
    }
    Route.ARG_KEY = "%s";
    class TerminalRoute extends Route {
      constructor(expr, pageGenerator, options = {}) {
        super(expr, pageGenerator, [], options);
        this.timeout = null;
      }
      matchesOwnNode(urlParts) {
        return true;
      }
      getPage(urlParts, router) {
        const page = super.getPage(...arguments);
        // TODO: why is this in a setTimeout?
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          if (page?.setURL) {
            page.setURL(urlParts);
          }
        });
        return page;
      }
    }

    var _class$2C, _descriptor$12, _dec$1l, _class2$1i;
    function sanitizeUrlFromOptions(options, key) {
      const rawURL = options[key];
      if (!rawURL || !rawURL.includes(":")) {
        return options;
      }
      const invalidateUrl = () => {
        console.error("Invalid URL", rawURL);
        options[key] = "";
        options.value = options.label = options.alt = "[Invalid URL]";
      };
      try {
        const url = new URL(rawURL);
        if (["http:", "https:", "mailto:", "tel:"].indexOf(url.protocol) === -1) {
          invalidateUrl();
        }
      } catch (e) {
        invalidateUrl();
      }
      return options;
    }
    let LinkStyle = (_class$2C = class LinkStyle extends StyleSheet {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "container", _descriptor$12, this);
      }
    }, _descriptor$12 = _applyDecoratedDescriptor(_class$2C.prototype, "container", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          cursor: "pointer"
        };
      }
    }), _class$2C);
    let Link = (_dec$1l = registerStyle(LinkStyle), _dec$1l(_class2$1i = class Link extends UI$1.Primitive("a") {
      getDefaultOptions(options) {
        return {
          newTab: false
        };
      }
      setOptions(options) {
        options = sanitizeUrlFromOptions(options, "href");
        super.setOptions(options);
        if (this.options.newTab) {
          this.options.target = "_blank";
        }
        return options;
      }
      render() {
        const {
          value,
          label
        } = this.options;
        return value || label || super.render();
      }
      changeRouteInternal() {
        // TODO Only if Router.Global exists?
        Router.changeURL(trimLocalUrl(this.options.href));
      }
      onMount() {
        this.addClickListener(event => {
          const {
            href,
            newTab,
            target
          } = this.options;
          const specialKeyPressed = event.shiftKey || event.ctrlKey || event.metaKey;
          const unroutable = !href || !isLocalUrl(href);
          if (specialKeyPressed || unroutable || newTab || target && target !== "_self") {
            // Leave it to the browser
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          this.changeRouteInternal();
        });
      }
    }) || _class2$1i);

    class IFrame extends UI$1.Primitive("iframe") {}
    IFrame.domAttributesMap = new DOMAttributesMap(UI$1.Element.domAttributesMap, [["allow"], ["allowfullscreen", {
      noValue: true
    }], ["allowpaymentrequest", {
      noValue: true
    }], ["csp"], ["loading"], ["name"], ["referrerpolicy"], ["sandbox"], ["src"], ["srcdoc"], ["align"], ["frameborder"], ["longdesc"], ["marginheight"], ["marginwidth"], ["scrolling"], ["mozbrowser"]]);

    class Image extends UI$1.Primitive("img") {
      setOptions(options) {
        return super.setOptions(sanitizeUrlFromOptions(options, "src"));
      }
      addLoadListener(callback) {
        return this.addNodeListener("load", callback);
      }
    }

    // TODO: this file existed to hold generic classes in a period of fast prototyping, has a lot of old code

    // Type definitions

    // A very simple class, all this does is implement the `getTitle()` method
    // TODO Just deprecate this class?
    class Panel extends UIElement {
      getTitle() {
        return this.options.title;
      }
    }

    function enqueueIfNotLoaded(target, key, descriptor) {
      const method = descriptor.value;
      return Object.assign({}, descriptor, {
        value: function (...args) {
          if (this.isLoaded()) {
            return method.call(this, ...args);
          } else {
            this.enqueueMethodCall(method, args);
            return null;
          }
        }
      });
    }
    function EnqueueableMethodMixin(BaseClass) {
      return class EnqueueableMethodClass extends BaseClass {
        constructor(...args) {
          super(...args);
          this.methodCallQueue = void 0;
        }
        isLoaded() {
          throw Error("Not implemented!");
        }
        enqueueMethodCall(method, args) {
          this.methodCallQueue = this.methodCallQueue || [];
          this.methodCallQueue.push([method, args]);
        }
        resolveQueuedMethods() {
          if (!this.isLoaded()) {
            throw Error("Cannot process scheduled jobs, element not loaded");
          }
          for (let methodCall of this.methodCallQueue || []) {
            methodCall[0].call(this, ...methodCall[1]);
          }
          delete this.methodCallQueue;
        }
      };
    }

    class ScriptResolver extends Dispatchable {
      constructor(scriptPath) {
        super();
        this.loaded = void 0;
        this.jobs = void 0;
        this.loaded = false;
        this.jobs = [];
        // TODO: should be more thought out
        let scriptElement = document.createElement("script");
        scriptElement.async = true;
        scriptElement.src = scriptPath;
        scriptElement.onload = () => this.onLoad();
        // TODO: what about error?
        document.getElementsByTagName("head")[0].appendChild(scriptElement);
      }
      onLoad() {
        this.loaded = true;
        for (let i = 0; i < this.jobs.length; i += 1) {
          this.jobs[i](this);
        }
        this.jobs = [];
      }
      resolve(callback) {
        if (this.loaded) {
          callback(this);
          return;
        }
        this.jobs.push(callback);
      }
    }
    const scriptResolveMap = new Map();
    async function ensureSingle(script) {
      let scriptResolver = scriptResolveMap.get(script);
      if (!scriptResolver) {
        scriptResolver = new ScriptResolver(script);
        scriptResolveMap.set(script, scriptResolver);
      }
      return new Promise(function (resolve, reject) {
        scriptResolver.resolve(resolve);
      });
    }
    async function ensure(scripts, callback) {
      scripts = toArray(scripts);
      const promises = scripts.map(script => ensureSingle(script));
      return Promise.all(promises).then(function (results) {
        if (callback) {
          callback(...results);
        }
        return results;
      });
    }

    var _class$2B, _CodeEditor, _class2$1h, _descriptor$11, _dec$1k, _class3$p;

    // Type definitions for Ace Editor

    let CodeEditor = (_class$2B = (_CodeEditor = class CodeEditor extends EnqueueableMethodMixin(UIElement) {
      constructor(...args) {
        super(...args);
        this.ace = void 0;
        this.apiChange = false;
      }
      static requireAce(callback) {
        throw Error("You need to implement requireAce");
      }
      isLoaded() {
        return !!this.getAce();
      }
      setOptions(options) {
        let defaultOptions = {
          aceMode: "text",
          readOnly: false,
          aceTheme: "dawn",
          aceKeyboardHandler: "ace",
          fontSize: 14,
          tabSize: 4,
          showLineNumber: true,
          showPrintMargin: false,
          printMarginSize: 80
        };
        options = Object.assign(defaultOptions, options);
        if (options.aceMode) {
          options.aceMode = options.aceMode.toLowerCase();
        }
        if (options.aceMode === "cpp" || options.aceMode === "c") {
          options.aceMode = "c_cpp";
        }
        super.setOptions(options);
        if (this.getAce()) {
          this.applyAceOptions();
        }
      }
      redraw() {
        if (this.getAce()) {
          this.aceResize();
          this.applyRef();
          return true;
        }
        return super.redraw();
      }
      whenLoaded(callback) {
        if (this.isLoaded()) {
          callback();
        } else {
          this.addListenerOnce("aceReady", callback);
        }
      }
      onMount() {
        // Sometimes when the parent div resizes the ace editor doesn't fully update.
        this.addListener("resize", () => {
          this.aceResize();
        });
        this.addListener("change", () => {
          this.aceResize();
        });
        if (!window.ace) {
          this.constructor.requireAce(() => {
            this.onDelayedMount();
          });
          return;
        }
        this.onDelayedMount();
      }
      onDelayedMount() {
        this.ace = window.ace.edit(this.node);

        // Removes some warnings
        this.getAce().$blockScrolling = Infinity;
        this.resolveQueuedMethods();
        this.applyAceOptions();

        //#voodoo was here to automatically redraw when unhiding
        //This Ace event listener might be useful in the future
        this.getAce().renderer.$textLayer.addEventListener("changeCharacterSize", event => {
          this.aceResize();
        });
        this.dispatch("aceReady");
      }
      onUnmount() {
        this.getAce().destroy();
      }
      getAce() {
        return this.ace;
      }
      getValue() {
        return this.getAce().getValue();
      }
      applyAceOptions() {
        // TODO maybe only this should be with enqueueIfNotLoaded
        this.setAceMode(this.options.aceMode);
        this.setAceKeyboardHandler(this.options.aceKeyboardHandler);
        this.setAceTheme(this.options.aceTheme);
        this.setAceFontSize(this.options.fontSize);
        this.setAceTabSize(this.options.tabSize);
        this.setAceLineNumberVisible(this.options.showLineNumber);
        this.setAcePrintMarginVisible(this.options.showPrintMargin);
        this.setAcePrintMarginSize(this.options.printMarginSize);
        this.setReadOnly(this.options.readOnly);
        this.setUseWrapMode(this.options.lineWrapping || false);
        if (this.options.numLines) {
          this.options.maxLines = this.options.minLines = this.options.numLines;
        }
        if (this.options.maxLines) {
          this.setAceOptions({
            maxLines: this.options.maxLines
          });
        }
        if (this.options.minLines) {
          this.setAceOptions({
            minLines: this.options.minLines
          });
        }
        if (this.options.value) {
          this.setValue(this.options.value, -1);
        }
        if (this.options.hasOwnProperty("enableBasicAutocompletion") || this.options.hasOwnProperty("enableLiveAutocompletion")) {
          const {
            langToolsSrc
          } = this.constructor;
          if (!langToolsSrc) {
            console.warn("Autocompletion requires setting 'langToolSrc' in CodeEditor");
          } else {
            ensure([langToolsSrc], () => {
              this.setBasicAutocompletion(this.options.enableBasicAutocompletion);
              this.setLiveAutocompletion(this.options.enableLiveAutocompletion);
              this.setSnippets(this.options.enableSnippets);
            });
          }
        }
      }
      aceResize() {
        this.getAce().resize();
      }
      setValue(sourceCode, fakeUserChange) {
        // We need to wrap the ace call in these flags so any event listeners can know if this change
        // was done by us or by the user
        this.apiChange = !fakeUserChange;
        this.getAce().setValue(sourceCode, -1);
        this.apiChange = false;
      }
      setAceOptions(options) {
        this.getAce().setOptions(options);
      }

      // TODO: should this be setEditable?
      setReadOnly(value) {
        this.getAce().setReadOnly(value);
      }
      setAceMode(aceMode) {
        if (aceMode.hasOwnProperty("aceMode")) {
          aceMode = aceMode.aceMode;
        }
        this.getAce().getSession().setMode("ace/mode/" + aceMode);
      }
      getAceKeyboardHandler() {
        return this.getAce().$keybindingId;
      }
      setAceKeyboardHandler(keyboardHandler) {
        if (keyboardHandler.hasOwnProperty("aceName")) {
          keyboardHandler = keyboardHandler.aceName;
        }
        this.getAce().setKeyboardHandler("ace/keyboard/" + keyboardHandler);
      }
      getAceMode() {
        return this.getAce().getSession().getMode();
      }
      setAceTheme(theme) {
        if (theme.hasOwnProperty("aceName")) {
          theme = theme.aceName;
        }
        this.getAce().setTheme("ace/theme/" + theme);
      }
      getAceTheme() {
        return this.getAce().getTheme();
      }
      setAceFontSize(fontSize) {
        this.getAce().setOptions({
          fontSize: fontSize + "px"
        });
      }
      getAceFontSize() {
        return this.getAce().getFontSize();
      }
      setAceTabSize(tabSize) {
        this.getAce().setOptions({
          tabSize: tabSize
        });
      }
      getAceTabSize() {
        return this.getAce().getOption("tabSize");
      }
      setAceLineNumberVisible(value) {
        this.getAce().renderer.setShowGutter(value);
      }
      getAceLineNumberVisible() {
        return this.getAce().renderer.getShowGutter();
      }
      setAcePrintMarginVisible(value) {
        this.getAce().setShowPrintMargin(value);
      }
      getAcePrintMarginVisible() {
        return this.getAce().getShowPrintMargin();
      }
      setAcePrintMarginSize(printMarginSize) {
        this.getAce().setPrintMarginColumn(printMarginSize);
      }
      getAcePrintMarginSize() {
        return this.getAce().getPrintMarginColumn();
      }
      setBasicAutocompletion(value) {
        this.getAce().setOptions({
          enableBasicAutocompletion: value
        });
      }
      setLiveAutocompletion(value) {
        this.getAce().setOptions({
          enableLiveAutocompletion: value
        });
      }
      setSnippets(value) {
        this.getAce().setOptions({
          enableSnippets: value
        });
      }
      setAnnotations(annotations) {
        this.getAce().getSession().setAnnotations(annotations);
      }
      setUseWrapMode(value) {
        this.getAce().getSession().setUseWrapMode(value);
      }
      setIndentedSoftWrap(value) {
        this.getAce().setOption("indentedSoftWrap", value);
      }
      blockScroll() {
        this.getAce().$blockScrolling = Infinity;
      }
      setFoldStyle(foldStyle) {
        this.getAce().getSession().setFoldStyle(foldStyle);
      }
      setHighlightActiveLine(value) {
        this.getAce().setHighlightActiveLine(value);
      }
      setHighlightGutterLine(value) {
        this.getAce().setHighlightGutterLine(value);
      }
      setShowGutter(value) {
        this.getAce().renderer.setShowGutter(value);
      }
      getScrollTop() {
        return this.getAce().getSession().getScrollTop();
      }
      setScrollTop(value) {
        this.getAce().getSession().setScrollTop(value);
      }
      addMarker(startLine, startCol, endLine, endCol, ...args) {
        const Range = this.constructor.AceRange;
        return this.getAce().getSession().addMarker(new Range(startLine, startCol, endLine, endCol), ...args);
      }
      removeMarker(marker) {
        this.getAce().getSession().removeMarker(marker);
      }
      getRendererLineHeight() {
        return this.getAce().renderer.lineHeight;
      }
      getTextRange(startLine, startCol, endLine, endCol) {
        const Range = this.constructor.AceRange;
        return this.getAce().getSession().doc.getTextRange(new Range(startLine, startCol, endLine, endCol));
      }
      setTextRange(startLine, startCol, endLine, endCol, text) {
        const Range = this.constructor.AceRange;
        this.getAce().getSession().replace(new Range(startLine, startCol, endLine, endCol), text);
      }
      removeLine(line) {
        const Range = this.constructor.AceRange;
        this.getAce().getSession().getDocument().remove(new Range(line, 0, line + 1, 0));
      }
      insertAtLine(line, str) {
        let column = this.getAce().session.getLine(line - 1).length;
        this.getAce().gotoLine(line, column);
        this.insert(str);
      }
      replaceLine(line, str) {
        const Range = this.constructor.AceRange;
        this.getAce().getSession().getDocument().replace(new Range(line, 0, line + 1, 0), str);
      }
      addAceSessionEventListener(event, callback) {
        this.getAce().getSession().addEventListener(event, callback);
      }
      addAceSessionChangeListener(callback) {
        this.addAceSessionEventListener("change", callback);
      }
      addAceChangeListener(callback) {
        this.getAce().on("change", callback);
      }
      addChangeListener(callback) {
        this.getAce().getSession().addEventListener("change", callback);
        // TODO We should return the handler to remove the listener here
        return undefined;
      }
      addAceEventListener(...args) {
        this.getAce().addEventListener(...args);
      }
      focus() {
        this.getAce().focus();
      }
      gotoEnd() {
        let editor = this.getAce();
        let editorRow = editor.session.getLength() - 1;
        let editorColumn = editor.session.getLine(editorRow).length;
        editor.gotoLine(editorRow + 1, editorColumn);
      }
      setUndoManager(undoManager) {
        this.getAce().getSession().setUndoManager(undoManager);
      }
      setAceRendererOption(key, value) {
        this.getAce().renderer.setOption(key, value);
      }

      // Inserts the text at the current cursor position
      insert(text) {
        this.getAce().insert(text);
      }

      // Appends the text at the end of the document
      append(text) {
        var lastRow = this.getAce().getSession().getLength() - 1;
        if (lastRow < 0) {
          lastRow = 0;
        }
        var lastRowLength = this.getAce().getSession().getLine(lastRow).length;
        var scrolledToBottom = this.getAce().isRowFullyVisible(lastRow);
        // console.log("Scroll to bottom ", scrolledToBottom);
        this.getAce().getSession().insert({
          row: lastRow,
          column: lastRowLength
        }, text);
        this.aceResize();
        if (scrolledToBottom) {
          // TODO: Include scroll lock option!
          // TODO: See if scrolling to bottom can be done better
          // TODO: for some reason the scroll bar height is not being updated, this needs to be fixed
          this.getAce().scrollToLine(this.getAce().getSession().getLength() - 1, true, true, function () {});
        }
      }
      copyTextToClipboard() {
        this.getAce().selectAll();
        this.getAce().focus();
        document.execCommand("copy");
      }
    }, _CodeEditor.langToolsSrc = null, _CodeEditor.AceRange = void 0, _CodeEditor), _applyDecoratedDescriptor(_class$2B.prototype, "applyAceOptions", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "applyAceOptions"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "aceResize", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "aceResize"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setValue", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setValue"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setAceOptions", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setAceOptions"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setReadOnly", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setReadOnly"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setAceMode", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setAceMode"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setAceKeyboardHandler", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setAceKeyboardHandler"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setAceTheme", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setAceTheme"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setAceFontSize", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setAceFontSize"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setAceTabSize", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setAceTabSize"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setAceLineNumberVisible", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setAceLineNumberVisible"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setAcePrintMarginVisible", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setAcePrintMarginVisible"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setAcePrintMarginSize", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setAcePrintMarginSize"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setBasicAutocompletion", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setBasicAutocompletion"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setLiveAutocompletion", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setLiveAutocompletion"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setSnippets", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setSnippets"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setAnnotations", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setAnnotations"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setUseWrapMode", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setUseWrapMode"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setIndentedSoftWrap", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setIndentedSoftWrap"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "blockScroll", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "blockScroll"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setFoldStyle", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setFoldStyle"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setHighlightActiveLine", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setHighlightActiveLine"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setHighlightGutterLine", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setHighlightGutterLine"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setShowGutter", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setShowGutter"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setScrollTop", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setScrollTop"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "addMarker", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "addMarker"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "removeMarker", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "removeMarker"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setTextRange", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setTextRange"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "removeLine", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "removeLine"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "insertAtLine", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "insertAtLine"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "replaceLine", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "replaceLine"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "addAceSessionEventListener", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "addAceSessionEventListener"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "addAceSessionChangeListener", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "addAceSessionChangeListener"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "addAceChangeListener", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "addAceChangeListener"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "addChangeListener", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "addChangeListener"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "addAceEventListener", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "addAceEventListener"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "focus", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "focus"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "gotoEnd", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "gotoEnd"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setUndoManager", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setUndoManager"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "setAceRendererOption", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "setAceRendererOption"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "insert", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "insert"), _class$2B.prototype), _applyDecoratedDescriptor(_class$2B.prototype, "append", [enqueueIfNotLoaded], Object.getOwnPropertyDescriptor(_class$2B.prototype, "append"), _class$2B.prototype), _class$2B);
    let StaticCodeHighlighterStyle = (_class2$1h = class StaticCodeHighlighterStyle extends StyleSheet {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "hideActive", _descriptor$11, this);
      }
    }, _descriptor$11 = _applyDecoratedDescriptor(_class2$1h.prototype, "hideActive", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          " .ace_gutter-active-line": {
            display: "none"
          },
          " .ace_active-line": {
            display: "none"
          },
          " .ace_cursor": {
            display: "none"
          }
        };
      }
    }), _class2$1h); // Interface declaration for proper typing
    let StaticCodeHighlighter = (_dec$1k = registerStyle(StaticCodeHighlighterStyle), _dec$1k(_class3$p = class StaticCodeHighlighter extends CodeEditor {
      setOptions(options) {
        options = Object.assign({
          fontSize: 13,
          readOnly: true,
          lineWrapping: true
        }, options);
        super.setOptions(options);
      }
      extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.hideActive);
      }
    }) || _class3$p);

    var _MarkupClassMap;

    // TODO @types shouldn't this be in UIBase?

    // Class that for every markup tag returns the UI class to instantiate for that element
    class MarkupClassMap {
      constructor(fallback = null, extraClasses = []) {
        this.classMap = void 0;
        this.fallback = void 0;
        this.classMap = new Map();
        this.fallback = fallback;
        for (const extraClass of extraClasses) {
          this.addClass(extraClass[0], extraClass[1]);
        }
      }
      addClass(className, classObject) {
        this.classMap.set(className, classObject);
      }
      registerDependencies(dependencies) {
        for (let dependency of dependencies) {
          if (dependency?.registerMarkup) {
            dependency.registerMarkup(this);
          }
        }
      }
      static addClass(className, classObject) {
        this.GLOBAL.addClass(className, classObject);
      }
      getClass(className) {
        let classObject = this.classMap.get(className);
        if (!classObject && this.fallback) {
          classObject = this.fallback.getClass(className);
        }
        return classObject;
      }
      get(className) {
        return this.getClass(className);
      }
      has(className) {
        return this.getClass(className);
      }
    }
    _MarkupClassMap = MarkupClassMap;
    MarkupClassMap.GLOBAL = new _MarkupClassMap();
    class MarkupRenderer extends Panel {
      setOptions(options) {
        if (!options.classMap) {
          options.classMap = new MarkupClassMap(MarkupClassMap.GLOBAL);
        }
        if (!options.parser) {
          options.parser = new MarkupParser({
            uiElements: options.classMap
          });
        }
        super.setOptions(options);
        this.setValue(this.options.value || "");
        this.classMap = this.options.classMap;
      }
      setValue(value) {
        if (typeof value === "string") {
          this.options.rawValue = value;
          try {
            value = this.options.parser.parse(value);
          } catch (e) {
            console.error("Can't parse ", value, e);
            value = {
              tag: "span",
              children: [value]
            };
          }
        }
        this.options.value = value;
      }
      reparse() {
        if (this.options.rawValue) {
          this.setValue(this.options.rawValue);
        }
      }
      registerDependencies(dependencies) {
        if (dependencies.length > 0) {
          this.classMap.registerDependencies(dependencies);
          this.reparse();
        }
      }
      addClass(className, classObject) {
        this.classMap.addClass(className, classObject);
      }
      getClass(className) {
        return this.classMap.getClass(className);
      }
      getValue() {
        return this.options.value;
      }
      convertToUI(value) {
        if (value instanceof UI$1.TextElement || value instanceof UI$1.Element) {
          // TODO: investigate this!
          return value;
        }
        if (typeof value === "string") {
          return new UI$1.TextElement(value);
        }
        if (Array.isArray(value)) {
          return value.map(x => this.convertToUI(x));
        }
        if (value.children) {
          value.children = this.convertToUI(value.children);
        }
        let classObject = this.getClass(value.tag) || value.tag;

        // TODO: maybe just copy to another object, not delete?
        //delete value.tag;
        return UI$1.createElement(classObject, value, ...(value.children || []));
      }
      render() {
        return this.convertToUI(this.getValue());
      }
    }
    MarkupClassMap.addClass("CodeSnippet", StaticCodeHighlighter);
    const SafeUriEnhancer = (BaseClass, attribute) => class SafeUriClass extends BaseClass {
      setOptions(options) {
        if (options[attribute] && !this.constructor.isSafeUri(options[attribute])) {
          options = Object.assign({}, options, {
            [attribute]: undefined
          });
        }
        return super.setOptions(options);
      }
      static isSafeUri(uri) {
        return uri.indexOf(":") === -1 || uri.startsWith("http:") || uri.startsWith("https:") || uri.startsWith("mailto:");
      }
    };
    MarkupClassMap.addClass("Link", SafeUriEnhancer(Link, "href"));
    MarkupClassMap.addClass("Image", SafeUriEnhancer(Image, "src"));

    var _class$2A, _descriptor$10, _descriptor2$T, _descriptor3$L, _descriptor4$F, _descriptor5$B, _descriptor6$v, _dec$1j, _class2$1g, _class3$o, _descriptor7$q, _descriptor8$m, _descriptor9$h, _descriptor0$d, _descriptor1$b, _descriptor10$9, _dec2$s, _class4$e;

    // Type definitions

    function DefaultMakeIcon(icon, options = {}) {
      if (isFunction(icon)) {
        return icon(options);
      }
      if (icon instanceof UIElement) {
        return icon;
      }
      const iconOptions = {
        ...options
      };
      iconOptions.className = (iconOptions.className || "") + " fa fa-" + icon;
      return UI$1.createElement("span", iconOptions);
    }
    let MakeIconFunc = DefaultMakeIcon;

    // Change the icon function
    function SetMakeIcon(func) {
      MakeIconFunc = func;
    }
    function MakeIcon(icon, options) {
      return MakeIconFunc(icon, options);
    }
    class SimpleStyledElement extends UIElement {
      getLevel() {
        return this.options.level || this.parent && this.parent.getLevel && this.parent.getLevel();
      }
      setLevel(level) {
        this.updateOptions({
          level
        });
      }
      getSize() {
        return this.options.size || this.parent && this.parent.getSize && this.parent.getSize();
      }
      setSize(size) {
        this.updateOptions({
          size
        });
      }
    }
    class IconableInterface extends SimpleStyledElement {
      render() {
        return [this.beforeChildren(), this.getLabel(), super.render()];
      }
      getLabel() {
        return this.options.label;
      }
      setLabel(label) {
        this.updateOptions({
          label
        });
      }
      setIcon(icon) {
        this.updateOptions({
          icon
        });
      }
      getIcon() {
        const icon = this.options.icon;
        return icon ? MakeIcon(icon) : null;
      }
      beforeChildren() {
        return this.getIcon();
      }
    }

    // TODO: move this to another file
    let labelColorToStyle = color => {
      const colors = buildColors(color);
      let darker = {
        backgroundColor: colors[2],
        color: colors[6],
        textDecoration: "none"
      };
      let regular = {
        backgroundColor: colors[1],
        borderColor: colors[5],
        color: colors[6]
      };
      return Object.assign({}, regular, {
        ":hover": darker,
        ":hover:disabled": regular,
        ":focus": darker,
        ":active": darker
      });
    };
    let LabelStyle = (_class$2A = class LabelStyle extends BasicLevelStyleSheet(labelColorToStyle) {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "container", _descriptor$10, this);
        _initializerDefineProperty(this, "EXTRA_SMALL", _descriptor2$T, this);
        _initializerDefineProperty(this, "SMALL", _descriptor3$L, this);
        _initializerDefineProperty(this, "MEDIUM", _descriptor4$F, this);
        _initializerDefineProperty(this, "LARGE", _descriptor5$B, this);
        _initializerDefineProperty(this, "EXTRA_LARGE", _descriptor6$v, this);
      }
    }, _descriptor$10 = _applyDecoratedDescriptor(_class$2A.prototype, "container", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          fontSize: 12,
          fontWeight: "bold",
          border: "0.1em solid transparent",
          padding: "0.07em 0.4em",
          borderRadius: "0.3em",
          textAlign: "center",
          whiteSpace: "nowrap",
          verticalAlign: "bottom",
          lineHeight: 4 / 3 + "",
          display: "inline-block",
          touchAction: "manipulation",
          ":disabled": {
            opacity: "0.7",
            cursor: "not-allowed"
          },
          ...this.colorStyleRule(this.themeProps.COLOR_BACKGROUND_BADGE)
        };
      }
    }), _descriptor2$T = _applyDecoratedDescriptor(_class$2A.prototype, "EXTRA_SMALL", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          fontSize: 10,
          padding: "0.05em 0.2em",
          borderWidth: "0.05em"
        };
      }
    }), _descriptor3$L = _applyDecoratedDescriptor(_class$2A.prototype, "SMALL", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          fontSize: 10
        };
      }
    }), _descriptor4$F = _applyDecoratedDescriptor(_class$2A.prototype, "MEDIUM", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {};
      }
    }), _descriptor5$B = _applyDecoratedDescriptor(_class$2A.prototype, "LARGE", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          fontSize: 14
        };
      }
    }), _descriptor6$v = _applyDecoratedDescriptor(_class$2A.prototype, "EXTRA_LARGE", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          fontSize: 17,
          padding: "0.05em 0.2em"
        };
      }
    }), _class$2A);

    // Interface declaration for proper typing

    let Label = (_dec$1j = registerStyle(LabelStyle), _dec$1j(_class2$1g = class Label extends UI$1.Primitive("span", IconableInterface) {
      extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.Size(this.getSize()));
        attr.addClass(this.styleSheet.Level(this.getLevel()));
      }
    }) || _class2$1g);
    let badgeColorToStyle = color => {
      const colors = buildColors(color);
      return {
        backgroundColor: colors[1],
        borderColor: colors[5],
        color: colors[6]
      };
    };
    let BadgeStyle = (_class3$o = class BadgeStyle extends BasicLevelStyleSheet(badgeColorToStyle) {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "container", _descriptor7$q, this);
        _initializerDefineProperty(this, "EXTRA_SMALL", _descriptor8$m, this);
        _initializerDefineProperty(this, "SMALL", _descriptor9$h, this);
        _initializerDefineProperty(this, "MEDIUM", _descriptor0$d, this);
        _initializerDefineProperty(this, "LARGE", _descriptor1$b, this);
        _initializerDefineProperty(this, "EXTRA_LARGE", _descriptor10$9, this);
      }
    }, _descriptor7$q = _applyDecoratedDescriptor(_class3$o.prototype, "container", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          display: "inline-block",
          padding: "0.25em 0.55em",
          fontWeight: "700",
          lineHeight: "1",
          color: "#fff",
          textAlign: "center",
          whiteSpace: "nowrap",
          verticalAlign: "middle",
          backgroundColor: "#777",
          borderRadius: "0.8em",
          fontSize: 12,
          ...this.colorStyleRule(this.themeProps.COLOR_BACKGROUND_BADGE)
        };
      }
    }), _descriptor8$m = _applyDecoratedDescriptor(_class3$o.prototype, "EXTRA_SMALL", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          fontSize: "10px",
          padding: "0.1em 0.2em"
        };
      }
    }), _descriptor9$h = _applyDecoratedDescriptor(_class3$o.prototype, "SMALL", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          fontSize: "10px"
        };
      }
    }), _descriptor0$d = _applyDecoratedDescriptor(_class3$o.prototype, "MEDIUM", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {};
      }
    }), _descriptor1$b = _applyDecoratedDescriptor(_class3$o.prototype, "LARGE", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          fontSize: "14px"
        };
      }
    }), _descriptor10$9 = _applyDecoratedDescriptor(_class3$o.prototype, "EXTRA_LARGE", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          fontSize: "17px",
          padding: "0.1em 0.2em"
        };
      }
    }), _class3$o);

    // Interface declaration for proper typing

    let Badge = (_dec2$s = registerStyle(BadgeStyle), _dec2$s(_class4$e = class Badge extends UI$1.Primitive("span", IconableInterface) {
      extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.Size(this.getSize()));
        attr.addClass(this.styleSheet.Level(this.getLevel()));
      }
    }) || _class4$e);

    var _class$2z, _descriptor$$, _descriptor2$S, _descriptor3$K, _descriptor4$E, _descriptor5$A, _class2$1f, _descriptor6$u, _descriptor7$p, _class3$n, _descriptor8$l;
    const buttonColorToStyle = color => {
      const colors = buildColors(color);
      const darker1 = {
        backgroundColor: colors[2]
      };
      const darker2 = {
        backgroundColor: colors[3]
      };
      const darker3 = {
        backgroundColor: colors[4]
      };
      const regular = {
        backgroundColor: colors[1],
        borderColor: colors[5],
        color: colors[6]
      };
      return {
        ...regular,
        ":hover": darker1,
        ":hover:disabled": {
          ...regular
        },
        ":focus": darker1,
        ":active": darker2,
        ":hover:active": darker3,
        ":focus:active": darker3,
        ".active": darker3
      };
    };
    let ButtonStyle = (_class$2z = class ButtonStyle extends BasicLevelStyleSheet(buttonColorToStyle) {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "container", _descriptor$$, this);
        _initializerDefineProperty(this, "EXTRA_SMALL", _descriptor2$S, this);
        _initializerDefineProperty(this, "SMALL", _descriptor3$K, this);
        _initializerDefineProperty(this, "LARGE", _descriptor4$E, this);
        _initializerDefineProperty(this, "EXTRA_LARGE", _descriptor5$A, this);
      }
    }, _descriptor$$ = _applyDecoratedDescriptor(_class$2z.prototype, "container", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          outline: 0,
          border: "1px solid",
          padding: this.themeProps.BUTTON_PADDING,
          borderRadius: this.themeProps.BUTTON_BORDER_RADIUS,
          fontFamily: "inherit",
          fontSize: this.themeProps.FONT_SIZE_DEFAULT,
          fontWeight: this.themeProps.BUTTON_FONT_WEIGHT,
          textAlign: "center",
          whiteSpace: "nowrap",
          verticalAlign: "middle",
          touchAction: "manipulation",
          userSelect: "none",
          cursor: "pointer",
          ":disabled": {
            opacity: 0.7,
            cursor: "not-allowed"
          },
          ...this.colorStyleRule(this.themeProps.BUTTON_COLOR)
        };
      }
    }), _descriptor2$S = _applyDecoratedDescriptor(_class$2z.prototype, "EXTRA_SMALL", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          fontSize: this.themeProps.FONT_SIZE_EXTRA_SMALL,
          padding: "0.2em 0.4em",
          borderWidth: "0.05em"
        };
      }
    }), _descriptor3$K = _applyDecoratedDescriptor(_class$2z.prototype, "SMALL", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          fontSize: this.themeProps.FONT_SIZE_SMALL
        };
      }
    }), _descriptor4$E = _applyDecoratedDescriptor(_class$2z.prototype, "LARGE", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          fontSize: this.themeProps.FONT_SIZE_LARGE
        };
      }
    }), _descriptor5$A = _applyDecoratedDescriptor(_class$2z.prototype, "EXTRA_LARGE", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          fontSize: this.themeProps.FONT_SIZE_EXTRA_LARGE,
          padding: "0.2em 0.4em"
        };
      }
    }), _class$2z);
    let ButtonGroupStyle = (_class2$1f = class ButtonGroupStyle extends StyleSheet {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "HORIZONTAL", _descriptor6$u, this);
        _initializerDefineProperty(this, "VERTICAL", _descriptor7$p, this);
      }
      Orientation(orientation) {
        for (let type of Object.keys(Orientation$1)) {
          if (orientation === Orientation$1[type]) {
            return this[type];
          }
        }
      }
    }, _descriptor6$u = _applyDecoratedDescriptor(_class2$1f.prototype, "HORIZONTAL", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          pointerEvents: "none",
          ">*": {
            "margin-left": "5px",
            "display": "inline-block",
            pointerEvents: "initial"
          },
          ">:first-child": {
            "margin-left": "0px"
          }
        };
      }
    }), _descriptor7$p = _applyDecoratedDescriptor(_class2$1f.prototype, "VERTICAL", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          pointerEvents: "none",
          ">*": {
            "margin-top": "5px",
            "display": "block",
            pointerEvents: "initial"
          },
          ">:first-child": {
            "margin-top": "0px"
          }
        };
      }
    }), _class2$1f);
    let RadioButtonGroupStyle = (_class3$n = class RadioButtonGroupStyle extends StyleSheet {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "container", _descriptor8$l, this);
      }
    }, _descriptor8$l = _applyDecoratedDescriptor(_class3$n.prototype, "container", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          pointerEvents: "none",
          ">*": {
            pointerEvents: "initial",
            borderRadius: 0,
            margin: 0
          },
          ">:last-child": {
            borderTopRightRadius: "0.3em",
            borderBottomRightRadius: "0.3em"
          },
          ">:first-child": {
            borderTopLeftRadius: "0.3em",
            borderBottomLeftRadius: "0.3em"
          }
        };
      }
    }), _class3$n);

    var _dec$1i, _class$2y;
    let Button = (_dec$1i = registerStyle(ButtonStyle), _dec$1i(_class$2y = class Button extends IconableInterface {
      getNodeType() {
        return "button";
      }
      extraNodeAttributes(attr) {
        const {
          styleSheet
        } = this;
        // TODO Maybe StyleSheet should have a method onElementRedraw(attr, element), that just adds container by default
        attr.addClass(styleSheet.Size(this.getSize()));
        attr.addClass(styleSheet.Level(this.getLevel()));
      }
      disable() {
        this.setEnabled(false);
      }
      enable() {
        this.setEnabled(true);
      }
      setEnabled(enabled) {
        this.updateOptions({
          disabled: !enabled
        });
      }
    }) || _class$2y);

    // TODO: this whole file is mostly here to not break compatibility with pre-Stem code, need refactoring

    const EPS = 1e-6;

    // Check if a value is equal to zero. Use epsilon check.
    function isZero(val, epsilon = EPS) {
      return Math.abs(val) < epsilon;
    }
    function equal(val1, val2, epsilon = EPS) {
      return isZero(val1 - val2, epsilon);
    }

    // Compute square of a number
    function sqr(x) {
      return x * x;
    }

    // Compute the distance between 2 points
    function distance(p1, p2) {
      return Math.sqrt(sqr(p1.x - p2.x) + sqr(p1.y - p2.y));
    }
    function signedDistancePointLine(point, line) {
      return (line.a * point.x + line.b * point.y + line.c) / Math.sqrt(sqr(line.a) + sqr(line.b));
    }
    function distancePointLine(point, line) {
      return Math.abs(signedDistancePointLine(point, line));
    }
    function pointOnSegment(point, segmentStart, segmentEnd, epsilon) {
      epsilon = epsilon || EPS;
      return Math.abs(distance(point, segmentStart) + distance(point, segmentEnd) - distance(segmentStart, segmentEnd)) <= epsilon;
    }
    function perpendicularFoot(point, line) {
      const dist = (line.a * point.x + line.b * point.y + line.c) / (sqr(line.a) + sqr(line.b));
      return {
        x: point.x - line.a * dist,
        y: point.y - line.b * dist
      };
    }
    function lineEquation(A, B) {
      return {
        a: B.y - A.y,
        b: A.x - B.x,
        c: A.y * B.x - A.x * B.y
      };
    }

    // TODO: lots of these should be methods of the point class, not global functions
    function crossProduct(p1, p2, p0 = {
      x: 0,
      y: 0
    }) {
      return (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x);
    }
    function rotatePoint(point, angle, orig = {
      x: 0,
      y: 0
    }) {
      return {
        x: Math.cos(angle) * (point.x - orig.x) - Math.sin(angle) * (point.y - orig.y) + orig.x,
        y: Math.sin(angle) * (point.x - orig.x) + Math.cos(angle) * (point.y - orig.y) + orig.y
      };
    }
    function polarToCartesian(angle, radius, orig = {
      x: 0,
      y: 0
    }) {
      return {
        x: radius * Math.cos(angle) + orig.x,
        y: radius * Math.sin(angle) + orig.y
      };
    }
    function vectorLength(vector) {
      return distance({
        x: 0,
        y: 0
      }, vector);
    }
    function normalizeVector(vector) {
      const len = vectorLength(vector);
      if (Math.abs(len) < EPS) {
        return {
          x: 0,
          y: 0
        };
      }
      return {
        x: vector.x / len,
        y: vector.y / len
      };
    }
    function scaleVector(vector, scalar) {
      return {
        x: vector.x * scalar,
        y: vector.y * scalar
      };
    }
    function addVectors(vector1, vector2) {
      return {
        x: vector1.x + vector2.x,
        y: vector1.y + vector2.y
      };
    }
    function subtractVectors(vector1, vector2) {
      return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y
      };
    }
    function interpolationValue(interpolationArray, X) {
      let Y = 0;
      for (let i = 0; i < interpolationArray.length; i += 1) {
        if (interpolationArray[i].x === X) {
          return interpolationArray[i].y;
        }
      }
      for (let i = 0; i < interpolationArray.length; i += 1) {
        let aux = interpolationArray[i].y;
        for (let j = 0; j < interpolationArray.length; j += 1) {
          if (i !== j) {
            aux = aux * (X - interpolationArray[j].x) / (interpolationArray[i].x - interpolationArray[j].x);
          }
        }
        Y += aux;
      }
      return Y;
    }

    let Transition$1 = class Transition {
      constructor(options) {
        this.func = void 0;
        this.context = void 0;
        this.duration = void 0;
        this.startTime = void 0;
        this.dependsOn = void 0;
        this.speedFactor = void 0;
        this.stopped = void 0;
        this.pauseTime = void 0;
        this.lastT = void 0;
        this.func = options.func;
        this.context = options.context;
        this.duration = options.duration || 0;
        this.startTime = options.startTime || 0;
        this.dependsOn = options.dependsOn || [];
        this.speedFactor = 1;
      }
      toString() {
        return "{\n" + "   context: " + this.context + "\n" + "   duration: " + this.duration + "\n" + "   startTime: " + this.startTime + "\n" + "   dependsOn: " + this.dependsOn + "\n" + "   func: " + this.func.toString() + "\n" + "}\n";
      }
      hasDependencyOn(t) {
        for (let transition of this.dependsOn) {
          if (transition === t) {
            return true;
          }
        }
        return false;
      }
      canAdvance() {
        for (let i = 0; i < this.dependsOn.length; i += 1) {
          if (!this.dependsOn[i].isStopped()) {
            return false;
          }
        }
        return true;
      }
      getFraction(now = Date.now()) {
        return Math.min((now - this.startTime) / this.getLength(), 1);
      }
      start(now = Date.now()) {
        if (this.stopped) {
          delete this.stopped;
        }
        this.setStartTime(now);
        const functionWrapper = () => {
          if (this.stopped) {
            return;
          }
          if (!this.pauseTime) {
            this.nextStep();
          }
          requestAnimationFrame(functionWrapper);
        };
        requestAnimationFrame(functionWrapper);
        return this;
      }
      getLength() {
        return this.getEndTime() - this.startTime;
      }
      setStartTime(time) {
        this.startTime = time;
        return this;
      }
      setSpeedFactor(speedFactor, now = Date.now()) {
        const ratio = speedFactor / this.speedFactor;
        this.startTime = (this.startTime - now) / ratio + now;
        if (this.pauseTime) {
          this.pauseTime = (this.pauseTime - now) / ratio + now;
        }
        this.speedFactor = speedFactor;
        return this;
      }
      pause(now = Date.now()) {
        if (!this.pauseTime) {
          this.pauseTime = now;
        }
        return this;
      }
      resume(now = Date.now()) {
        if (this.pauseTime) {
          this.startTime += now - this.pauseTime;
          this.pauseTime = 0;
        }
        return this;
      }
      forceStart() {
        this.restart();
        this.func(0.0, this.context);
        return this;
      }
      forceFinish() {
        this.func(1.0, this.context);
        this.stop();
        return this;
      }
      stop() {
        this.stopped = true;
      }
      restart() {
        delete this.stopped;
        return this;
      }
      isStopped() {
        return this.stopped === true;
      }
      nextStep(now = Date.now()) {
        // Return if transition is stopped
        if (this.isStopped()) {
          return this;
        }
        this.lastT = this.getFraction(now);
        // Return if transitions not started yet
        if (this.lastT < 0) {
          return this;
        }
        // Call the animation function
        this.func(this.lastT, this.context);
        // Stop the animation if it's the last step
        if (this.lastT === 1) {
          this.stop();
        }
        return this;
      }
      getEndTime() {
        return this.startTime + this.duration / this.speedFactor;
      }
    };
    class Modifier extends Transition$1 {
      constructor(options) {
        super(options);
        this.reverseFunc = void 0;
        this.reverseFunc = options.reverseFunc;
        this.context = options.context;
      }
      toString() {
        return "{\n" + "   context: " + this.context + "\n" + "   duration: " + this.duration + "\n" + "   startTime: " + this.startTime + "\n" + "   dependsOn: " + this.dependsOn + "\n" + "   func: " + this.func.toString() + "\n" + "   reverseFunc: " + this.reverseFunc.toString() + "\n" + "}\n";
      }
      forceStart() {
        this.restart();
        this.reverseFunc(this.context);
        return this;
      }
      forceFinish() {
        this.func(1.0, this.context);
        this.stop();
        return this;
      }
      nextStep(now = Date.now()) {
        if (this.isStopped()) {
          return this;
        }
        if (now >= this.startTime) {
          const t = this.getFraction(now);
          this.func(t, this.context);
          this.stop();
        }
        return this;
      }
      getEndTime() {
        return this.startTime;
      }
    }
    class TransitionList {
      constructor(startTime = 0) {
        this.startTime = void 0;
        this.speedFactor = void 0;
        this.transitions = void 0;
        this.dependsOn = void 0;
        this.stopped = void 0;
        this.pauseTime = void 0;
        this.onNewFrame = void 0;
        this.animationFrameId = void 0;
        this.context = void 0;
        this.duration = void 0;
        this.startTime = startTime;
        this.speedFactor = 1;
        this.transitions = [];
        this.dependsOn = [];
      }
      toString() {
        return "{\n" + "   context: " + this.context + "\n" + "   duration: " + this.duration + "\n" + "   startTime: " + this.startTime + "\n" + "   dependsOn: " + this.dependsOn + "\n" + "   transitions: [" + (this.transitions.length ? this.transitions[0].toString() : "") + " ...]\n" + "}\n";
      }
      add(transition, forceFinish = true) {
        for (let i = 0; i < transition.dependsOn.length; i += 1) {
          if (transition.dependsOn[i].getEndTime() > transition.startTime) {
            console.error(transition.toString() + "\ndepends on\n" + transition.dependsOn[i].toString() + "\n" + "which ends after its start!");
          }
        }
        if (forceFinish) {
          transition.forceFinish();
        }
        this.transitions.push(transition);
        return this;
      }
      push(transition, forceFinish = true) {
        transition.setStartTime(this.getLength());
        for (let i = 0; i < transition.dependsOn.length; i += 1) {
          if (transition.dependsOn[i].getEndTime() > transition.startTime) {
            console.error(transition.toString() + "\ndepends on\n" + transition.dependsOn[i].toString() + "\n" + "which ends after its start!");
          }
        }
        if (forceFinish) {
          transition.forceFinish();
        }
        this.transitions.push(transition);
        return this;
      }
      getFraction(now = Date.now()) {
        return Math.min((now - this.startTime) / this.getLength(), 1);
      }
      setStartTime(startTime) {
        const timeDelta = startTime - this.startTime;
        this.startTime = startTime;
        for (let i = 0; i < this.transitions.length; i += 1) {
          const transition = this.transitions[i];
          transition.setStartTime(transition.startTime + timeDelta);
        }
      }
      start(now = Date.now()) {
        if (this.stopped) {
          delete this.stopped;
        }
        this.setStartTime(now);
        const functionWrapper = () => {
          if (this.stopped) {
            return;
          }
          if (!this.pauseTime) {
            this.nextStep();
          }
          requestAnimationFrame(functionWrapper);
        };
        requestAnimationFrame(functionWrapper);
        return this;
      }
      stop() {
        this.stopped = true;
        for (let i = 0; i < this.transitions.length; i += 1) {
          const transition = this.transitions[i];
          transition.stop();
        }
      }
      isStopped() {
        return this.stopped === true;
      }
      pause(now = Date.now()) {
        if (!this.pauseTime) {
          this.pauseTime = now;
          for (let i = 0; i < this.transitions.length; i += 1) {
            this.transitions[i].pause(now);
          }
        }
        return this;
      }
      resume(now = Date.now()) {
        if (this.pauseTime) {
          this.startTime += now - this.pauseTime;
          for (let i = 0; i < this.transitions.length; i += 1) {
            this.transitions[i].resume(now);
          }
          this.pauseTime = 0;
        }
        return this;
      }
      nextStep() {
        // Return if transition list is stopped
        if (this.isStopped()) {
          return this;
        }
        if (this.onNewFrame) {
          this.onNewFrame(this.getFraction());
        }
        let finished = true;
        const stk = [];
        for (let i = 0; i < this.transitions.length; i += 1) {
          const transition = this.transitions[i];
          if (!transition.isStopped()) {
            if (transition.canAdvance()) {
              transition.nextStep();
              while (stk.length !== 0 && this.transitions[stk[stk.length - 1]].canAdvance()) {
                this.transitions[stk[stk.length - 1]].nextStep();
                stk.pop();
              }
            } else {
              stk.push(i);
            }
            finished = false;
          }
        }
        if (finished) {
          this.stop();
        }
        return this;
      }
      setSpeedFactor(speedFactor, now = Date.now()) {
        const ratio = speedFactor / this.speedFactor;
        this.startTime = (this.startTime - now) / ratio + now;
        if (this.pauseTime) {
          this.pauseTime = (this.pauseTime - now) / ratio + now;
        }
        this.speedFactor = speedFactor;
        for (let i = 0; i < this.transitions.length; i += 1) {
          this.transitions[i].setSpeedFactor(speedFactor, now);
        }
        return this;
      }
      restart() {
        delete this.stopped;
        for (let i = 0; i < this.transitions.length; i += 1) {
          const transition = this.transitions[i];
          transition.restart();
        }
        this.sortByEndTime();
        return this;
      }
      getLength() {
        return this.getEndTime() - this.startTime;
      }
      getEndTime() {
        let endTime = 0;
        for (let i = 0; i < this.transitions.length; i += 1) {
          const transitionEndTime = this.transitions[i].getEndTime();
          if (transitionEndTime > endTime) {
            endTime = transitionEndTime;
          }
        }
        return endTime;
      }
      hasDependencyOn(t) {
        for (let transition of this.dependsOn) {
          if (transition === t) {
            return true;
          }
        }
        return false;
      }
      canAdvance() {
        for (let i = 0; i < this.dependsOn.length; i += 1) {
          if (!this.dependsOn[i].isStopped()) {
            return false;
          }
        }
        return true;
      }
      sortByStartTime() {
        // TODO: this comparator should be global
        this.transitions.sort((a, b) => {
          if (!equal(a.startTime, b.startTime, 0.001)) {
            return b.startTime - a.startTime;
          }
          //not a hack, works in all conflict cases
          if (!equal(a.getEndTime(), b.getEndTime(), 0.001)) {
            return b.getEndTime() - a.getEndTime();
          }
          if (a.hasDependencyOn(b)) {
            return 1;
          }
          if (b.hasDependencyOn(a)) {
            return -1;
          }
          return 0;
        });
      }
      sortByEndTime() {
        this.transitions.sort((a, b) => {
          if (!equal(a.getEndTime(), b.getEndTime(), 0.001)) {
            return a.getEndTime() - b.getEndTime();
          }
          //not a hack, works in all conflict cases
          if (!equal(a.startTime, b.startTime, 0.001)) {
            return a.startTime - b.startTime;
          }
          if (a.hasDependencyOn(b)) {
            return -1;
          }
          if (b.hasDependencyOn(a)) {
            return 1;
          }
          return 0;
        });
      }
      forceStart(now = Date.now()) {
        this.sortByStartTime();
        for (let i = 0; i < this.transitions.length; i += 1) {
          const transition = this.transitions[i];
          if (transition.startTime <= now) {
            transition.forceStart();
          }
        }
        return this;
      }
      forceFinish(now = Date.now(), startTime = -1) {
        this.sortByEndTime();
        for (let i = 0; i < this.transitions.length; i += 1) {
          const transition = this.transitions[i];
          if (transition.getEndTime() >= startTime) {
            if (transition instanceof TransitionList) {
              transition.forceFinish(now, startTime);
            } else {
              if (typeof now === "undefined" || transition.getEndTime() < now) {
                transition.forceFinish();
              }
            }
          }
        }
        return this;
      }
      startAtPercent(startPercent, now = Date.now()) {
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
        }
        this.restart();
        // TODO(@wefgef): Buggy
        const paused = this.pauseTime;
        if (paused) {
          this.resume();
        }
        this.forceStart(now);
        this.setStartTime(now - startPercent * this.getLength());
        this.forceFinish(now);
        // TODO(@wefgef): Huge hack to deal with force transition
        this.nextStep();
        this.nextStep();
        if (paused) {
          this.pause();
        }
        const functionWrapper = () => {
          if (this.isStopped()) {
            return;
          }
          if (!this.pauseTime) {
            this.nextStep();
          }
          this.animationFrameId = requestAnimationFrame(functionWrapper);
        };
        this.animationFrameId = requestAnimationFrame(functionWrapper);
      }
    }

    var _class$2x, _descriptor$_, _descriptor2$R, _class2$1e, _descriptor3$J, _descriptor4$D, _descriptor5$z, _descriptor6$t, _descriptor7$o;
    let FloatingWindowStyle = (_class$2x = class FloatingWindowStyle extends StyleSheet {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "hiddenAnimated", _descriptor$_, this);
        _initializerDefineProperty(this, "visibleAnimated", _descriptor2$R, this);
      }
    }, _descriptor$_ = _applyDecoratedDescriptor(_class$2x.prototype, "hiddenAnimated", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          visibility: "hidden",
          opacity: "0",
          transition: "opacity 0.1s linear"
        };
      }
    }), _descriptor2$R = _applyDecoratedDescriptor(_class$2x.prototype, "visibleAnimated", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          visibility: "visible",
          opacity: "1",
          transition: "opacity 0.1s linear"
        };
      }
    }), _class$2x);
    let ModalStyle = (_class2$1e = class ModalStyle extends FloatingWindowStyle {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "container", _descriptor3$J, this);
        _initializerDefineProperty(this, "background", _descriptor4$D, this);
        _initializerDefineProperty(this, "header", _descriptor5$z, this);
        _initializerDefineProperty(this, "body", _descriptor6$t, this);
        _initializerDefineProperty(this, "footer", _descriptor7$o, this);
      }
    }, _descriptor3$J = _applyDecoratedDescriptor(_class2$1e.prototype, "container", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          position: "fixed",
          top: "0px",
          left: "0px",
          right: "0px",
          bottom: "0px",
          width: "100%",
          height: "100%",
          zIndex: "9999"
        };
      }
    }), _descriptor4$D = _applyDecoratedDescriptor(_class2$1e.prototype, "background", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          position: "fixed",
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)"
        };
      }
    }), _descriptor5$z = _applyDecoratedDescriptor(_class2$1e.prototype, "header", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          padding: "15px",
          borderBottom: "1px solid #e5e5e5"
        };
      }
    }), _descriptor6$t = _applyDecoratedDescriptor(_class2$1e.prototype, "body", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          position: "relative",
          padding: "15px"
        };
      }
    }), _descriptor7$o = _applyDecoratedDescriptor(_class2$1e.prototype, "footer", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          padding: "15px",
          textAlign: "right",
          borderTop: "1px solid #e5e5e5"
        };
      }
    }), _class2$1e);

    var _dec$1h, _class$2w;
    let FloatingWindow = (_dec$1h = registerStyle(FloatingWindowStyle), _dec$1h(_class$2w = class FloatingWindow extends UI$1.Element {
      getDefaultOptions() {
        return {
          transitionTime: 0,
          style: {
            zIndex: 2016
          }
        };
      }
      fadeOut() {
        this.removeClass(this.styleSheet.visibleAnimated);
        this.addClass(this.styleSheet.hiddenAnimated);
      }
      fadeIn() {
        this.removeClass(this.styleSheet.hiddenAnimated);
        this.addClass(this.styleSheet.visibleAnimated);
      }
      show() {
        // TODO: refactor this to use this.parent and UI.Element appendChild
        if (!this.isInDocument()) {
          this.parentNode.appendChild(this.node);
          this.redraw();
          setTimeout(() => {
            this.fadeIn();
          }, 0);
        }
      }
      setParentNode(parentNode) {
        this.options.parentNode = parentNode;
      }
      get parentNode() {
        if (!this.options.parentNode) {
          if (this.parent) {
            if (this.parent instanceof HTMLElement) {
              this.options.parentNode = this.parent;
            } else {
              this.options.parentNode = this.parent.node;
            }
          } else {
            this.options.parentNode = document.body;
          }
        }
        return this.options.parentNode;
      }
      hide() {
        // TODO: refactor this to use this.parent and UI.Element removeChild
        if (this.isInDocument()) {
          this.fadeOut();
          setTimeout(() => {
            if (this.isInDocument()) {
              this.parentNode.removeChild(this.node);
            }
          }, this.options.transitionTime);
        }
      }
    }) || _class$2w);
    class VolatileFloatingWindow extends FloatingWindow {
      bindWindowListeners() {
        this.hideListener = this.hideListener || (() => {
          this.hide();
        });
        window.addEventListener("click", this.hideListener);
      }
      toggle() {
        if (!this.isInDocument()) {
          this.show();
        } else {
          this.hide();
        }
      }
      show() {
        if (!this.isInDocument()) {
          this.bindWindowListeners();
          super.show();
        }
      }
      hide() {
        if (this.isInDocument()) {
          super.hide();
        }
      }
      onUnmount() {
        super.onUnmount();
        window.removeEventListener("click", this.hideListener);
      }
      onMount() {
        if (!this.options.notVisible) {
          this.bindWindowListeners();
        } else {
          setTimeout(() => {
            this.hide();
          });
        }
        this.addClickListener(event => {
          event.stopPropagation();
        });
      }
    }

    class BasePopup extends FloatingWindow {
      constructor(...args) {
        super(...args);
        this.target = void 0;
        this.popupArrow = void 0;
        this.popupArrowOutline = void 0;
      }
      getDefaultOptions() {
        let options = super.getDefaultOptions();
        options.x = 0;
        options.y = 0;
        options.contentPadding = "7px";
        options.contentStyle = {};
        options.arrowDirection = Direction.UP;
        options.arrowColor = "white";
        options.backgroundColor = "white";
        return options;
      }
      setOptions(options) {
        super.setOptions(options);
        this.options.style = Object.assign({
          boxShadow: "0px 0px 4px rgba(0,0,0,0.5)",
          borderRadius: 5,
          display: "table",
          width: 300,
          backgroundColor: this.options.backgroundColor,
          position: "absolute",
          left: this.options.x,
          top: this.options.y,
          zIndex: 111,
          right: 0
        }, this.options.style);
        this.createArrowStyle();
      }
      setContent(content) {
        this.options.children = content;
        this.redraw();
      }
      getContent() {
        return UI.createElement("div", {
          style: Object.assign({
            padding: this.options.contentPadding
          }, this.options.contentStyle),
          ref: "contentArea"
        }, this.options.children);
      }
      createArrowStyle() {
        let baseArrowOutline = {
          "left": "50%",
          "z-index": "-3",
          "position": "absolute",
          "width": "0",
          "height": "0",
          "border-left": "10px solid transparent",
          "border-right": "10px solid transparent",
          marginLeft: "-11px"
        };
        this["arrow" + Direction.UP + "Outline"] = Object.assign({
          "border-bottom": "10px solid #C8C8C8",
          "margin-top": "-10.8px",
          marginLeft: "-11px"
        }, baseArrowOutline);
        this["arrow" + Direction.DOWN + "Outline"] = Object.assign({
          "border-top": "10px solid #C8C8C8",
          "margin-top": "2px"
        }, baseArrowOutline);
        let baseArrow = {
          "left": "50%",
          "position": "absolute",
          "width": "0",
          "height": "0",
          "border-left": "10px solid transparent",
          "border-right": "10px solid transparent"
        };
        this["arrow" + Direction.UP] = Object.assign({
          "margin-top": "-10px",
          "border-bottom": "10px solid " + this.options.arrowColor
        }, baseArrow);
        this["arrow" + Direction.DOWN] = Object.assign({
          "border-top": "10px solid " + this.options.arrowColor
        }, baseArrow);
      }
      getArrow() {
        let direction = this.options.arrowDirection;
        return [UI.createElement(Panel, {
          ref: "popupArrow",
          style: this["arrow" + direction]
        }), UI.createElement(Panel, {
          ref: "popupArrowOutline",
          style: this["arrow" + direction + "Outline"]
        })];
      }
      render() {
        return this.options.arrowDirection === Direction.UP ? [this.getArrow(), this.getContent()] : [this.getContent(), this.getArrow()];
      }
      bindInsideParent() {
        if (this.target) {
          this.options.x = this.target.offsetWidth / 2;
          this.options.y = this.options.arrowDirection === Direction.UP ? this.target.offsetHeight : 0;
        }
        let left = parseFloat(this.options.x);
        let top = parseFloat(this.options.y) + (this.options.arrowDirection === Direction.UP ? 11 : -this.getHeight() - 11);
        let arrowMargin = -11;
        left -= this.getWidth() / 2;
        if (this.options.bodyPlaced && this.target) {
          const rect = this.target.getBoundingClientRect();
          left += rect.left;
          top += rect.top;
        }
        if (this.target && !this.options.bodyPlaced) {
          if (this.node.offsetParent && !this.options.bodyPlaced) {
            let left2 = left + this.node.offsetParent.offsetLeft;
            if (left2 < 0) {
              left -= left2 - 2;
              arrowMargin += left2 + 2;
            } else if (left2 + this.getWidth() > this.node.offsetParent.offsetParent.offsetWidth) {
              let delta = this.node.offsetParent.offsetParent.offsetWidth - (left2 + this.getWidth());
              arrowMargin -= delta - 2;
              left += delta - 2;
            }
          }
        } else {
          if (left < 0) {
            arrowMargin += left + 2;
            left = 2;
          } else if (left + this.getWidth() > this.parentNode.offsetWidth) {
            let delta = left + this.getWidth() - this.parentNode.offsetWidth;
            arrowMargin += delta;
            left -= delta;
          }
        }
        this.popupArrow.setStyle("margin-left", arrowMargin + "px");
        this.popupArrowOutline.setStyle("margin-left", arrowMargin + "px");
        this.setStyle("left", left + "px");
        this.setStyle("top", top + "px");
      }
      setParent(parent) {
        let newParent;
        if (parent instanceof HTMLElement) {
          newParent = parent;
        } else {
          newParent = parent.node;
        }
        if (newParent === this.parentNode) {
          return;
        }
        if (this.isInDocument()) {
          this.parentNode.removeChild(this.node);
          newParent.appendChild(this.node);
          this.setParentNode(newParent);
        } else {
          this.setParentNode(newParent);
        }
      }
      setCenter(center, manual = false) {
        this.options.x = center.x;
        this.options.y = center.y;
        if (manual) {
          setTimeout(() => {
            this.bindInsideParent();
          }, 0);
        } else {
          this.bindInsideParent();
        }
      }
      static clearBodyPopups() {
        for (const popup of this.bodyPopups) {
          popup.hide();
        }
        this.bodyPopups.clear();
      }
      onUnmount() {
        super.onUnmount();
        if (this.options.bodyPlaced && this.target) {
          this.constructor.bodyPopups.delete(this);
        }
      }
      onMount() {
        if (this.options.target) {
          if (this.options.target instanceof HTMLElement) {
            this.target = this.options.target;
          } else {
            this.target = this.options.target.node;
          }
          this.options.x = this.target.offsetWidth / 2;
          this.options.y = this.target.offsetHeight;
        }
        super.onMount();
        // Set the Popup inside the parent
        this.bindInsideParent();
        if (this.options.bodyPlaced && this.target) {
          this.constructor.bodyPopups.add(this);
        }
      }
    }
    BasePopup.bodyPopups = new Set();
    class Popup extends BasePopup {
      constructor(...args) {
        super(...args);
        this.titleArea = void 0;
        this.closeButton = void 0;
      }
      getDefaultOptions() {
        let options = super.getDefaultOptions();
        options.titleFontSize = "12pt";
        options.contentFontSize = "10pt";
        options.arrowColor = "#F3F3F3";
        return options;
      }
      getContent() {
        let contentArea = super.getContent();
        contentArea.options.style = Object.assign({
          fontSize: this.options.contentFontSize
        }, contentArea.options.style || {});
        return [UI.createElement(Panel, {
          ref: "titleArea",
          style: {
            backgroundColor: "#F3F3F3",
            paddingLeft: "20px",
            fontSize: this.options.titleFontSize,
            fontWeight: "bold",
            paddingTop: "6px",
            paddingBottom: "6px",
            textAlign: "center",
            borderBottom: "1px solid #BEBEBE"
          }
        }, this.getTitleAreaContent()), contentArea];
      }
      setTitle(newTitle) {
        this.options.title = newTitle;
        this.redraw();
      }
      getTitleAreaContent() {
        return [UI.createElement(Button, {
          className: "pull-right",
          ref: "closeButton",
          style: {
            backgroundColor: "transparent",
            border: "none",
            color: "#888888",
            fontSize: "18pt",
            padding: "2px",
            marginRight: "3px",
            marginTop: "-12px"
          },
          label: "\xD7"
        }), UI.createElement("div", {
          style: {
            marginRight: "25px"
          }
        }, this.options.title)];
      }
      bindWindowListeners() {
        this.addClickListener(event => {
          event.stopPropagation();
        });
        let documentListener = () => {
          this.hide();
          if (!Device.supportsEvent("click")) {
            document.removeEventListener("touchstart", documentListener);
          } else {
            document.removeEventListener("click", documentListener);
          }
        };
        if (!Device.supportsEvent("click")) {
          document.addEventListener("touchstart", documentListener);
        } else {
          document.addEventListener("click", documentListener);
        }
      }
      show() {
        super.show();
        this.bindWindowListeners();
      }
      redraw() {
        if (this.isInDocument()) {
          this.bindInsideParent();
        }
        super.redraw();
      }
      onMount() {
        super.onMount();

        // fake a click event that will propagate to window and trigger
        // the events of any other popup, closing them
        let fakeClickEvent = document.createEvent("MouseEvents");
        fakeClickEvent.initEvent("click", true, false);
        document.body.dispatchEvent(fakeClickEvent);

        // Make the popup close when something else is clicked
        this.bindWindowListeners();

        // Close button behavior
        this.closeButton.addClickListener(() => {
          this.hide();
          this.closeButton.node.blur();
        });
        let closeButtonColor = this.closeButton.options.style.color;
        this.closeButton.addNodeListener("mouseover", () => {
          this.closeButton.setStyle("color", "#0082AD");
        });
        this.closeButton.addNodeListener("mouseout", () => {
          this.closeButton.setStyle("color", closeButtonColor);
        });
      }
    }

    //YOU CANNOT SET A NEW PARENT IN PLAYER POPUP!
    class PlayerPopup extends BasePopup {
      getDefaultOptions() {
        let options = super.getDefaultOptions();
        options.backgroundColor = "#F7F2CB";
        options.arrowColor = "#F7F2CB";
        options.arrowDirection = Direction.DOWN;
        options.className = (options.className || "") + " hidden";
        return options;
      }
      setContent(content) {
        this.contentArea.options.children = content;
        this.contentArea.redraw();
      }
      getPopupData() {
        return {
          panel: this.parentNode,
          content: this.options.children,
          center: {
            x: this.options.x,
            y: this.options.y
          }
        };
      }
      setPopupData(data) {
        this.setContent(data.content);
        this.setCenter(data.center);
      }
      show() {
        if (this.hasClass("hidden")) {
          this.removeClass("hidden");
        }
      }
      hide() {
        if (!this.hasClass("hidden")) {
          this.addClass("hidden");
        }
      }
      showPopupTransition(content, rawPosition, duration, dependsOn = [], startTime = 0, inMovie = true) {
        let position;
        if (typeof rawPosition === "function") {
          position = rawPosition();
        } else {
          position = rawPosition;
        }
        let result = new TransitionList();
        result.dependsOn = dependsOn;
        let showPopupModifier = new Modifier({
          func: (t, context) => {
            context.content = this.options.children;
            //context.parent = this.options.parentNode;
            context.center = {
              x: this.options.x,
              y: this.options.y
            };
            if (this.options.style) {
              context.opacity = this.options.style.opacity || 1;
            } else {
              context.opacity = 1;
            }
            this.setContent(content);
            this.setCenter(position, true);
            this.setStyle("opacity", 0);
            this.show();
          },
          reverseFunc: context => {
            this.setContent(context.content);
            this.setCenter(context.center, true);
            this.setStyle("opacity", context.opacity);
            this.hide();
          },
          context: {}
        });
        result.push(showPopupModifier, false);
        let changeOpacityTransition = new Transition$1({
          func: t => {
            this.setStyle("opacity", t);
          },
          duration: duration / 2,
          dependsOn: [showPopupModifier],
          inMovie: inMovie
        });
        result.push(changeOpacityTransition, false);
        result.push(new Transition$1({
          func: t => {},
          duration: duration / 2,
          inMovie: inMovie
        }), false);
        result.setStartTime(startTime);
        return result;
      }
      hidePopupTransition(duration, dependsOn = [], startTime = 0, inMovie = true) {
        let result = new TransitionList();
        result.dependsOn = dependsOn;
        let changeOpacityTransition = new Transition$1({
          func: t => {
            this.setStyle("opacity", 1 - t);
          },
          duration: duration,
          dependsOn: [],
          inMovie: inMovie
        });
        result.push(changeOpacityTransition, false);
        result.push(new Modifier({
          func: () => {
            this.hide();
          },
          reverseFunc: () => {
            this.show();
          },
          dependsOn: [changeOpacityTransition]
        }), false);
        result.setStartTime(startTime);
        return result;
      }
    }
    class PopupDefinition extends Popup {
      constructor(options) {
        super(options);
        this.stack = [{
          content: this.options.content,
          title: this.options.title
        }];
      }
      getTitleAreaContent() {
        return [UI$1.createElement(Button, {
          ref: "backButton",
          className: "pull-left",
          style: {
            border: "none",
            backgroundColor: "transparent",
            fontSize: "18pt",
            color: "#888888",
            padding: "2px",
            marginTop: "-12px",
            marginLeft: "-15px",
            marginRight: "-15px"
          },
          label: "<"
        }), ...super.getTitleAreaContent()];
      }
      getContent() {
        return [UI$1.createElement(Panel, {
          ref: "titleArea",
          style: {
            backgroundColor: "#F3F3F3",
            paddingLeft: "20px",
            fontSize: this.options.titleFontSize,
            fontWeight: "bold",
            paddingTop: "6px",
            paddingBottom: "6px",
            textAlign: "center",
            borderBottom: "1px solid #BEBEBE"
          }
        }, this.getTitleAreaContent()), UI$1.createElement(MarkupRenderer, {
          value: this.options.content,
          style: {
            padding: "8px"
          }
        })];
      }
      pushDefinition(definition) {
        this.stack.push(definition);
        this.setStyle("left", "0px");
        this.setStyle("top", "0px");
        this.options.content = definition.content;
        this.options.title = definition.title;
        this.redraw();
        //this.recalculatePosition();
        this.bindInsideParent();
        if (this.stack.length > 1) {
          this.backButton.removeClass("hidden");
        }
      }
      popDefinition() {
        this.stack.pop();
        this.setStyle("left", "0px");
        this.setStyle("top", "0px");
        this.options.content = this.stack[this.stack.length - 1].content;
        this.options.title = this.stack[this.stack.length - 1].title;
        this.redraw();
        //this.recalculatePosition();
        this.bindInsideParent();
        if (this.stack.length === 1) {
          this.backButton.addClass("hidden");
        }
      }
      recalculatePosition() {
        // Compute the x and y coordinates of the popup
        let element = this.options.definition.node;
        let x = element.offsetWidth / 2;
        let y = element.offsetHeight;
        while (element !== this.parentNode && element.style.position !== "relative") {
          x += element.offsetLeft - element.scrollLeft;
          y += element.offsetTop - element.scrollTop;
          element = element.offsetParent;
        }
        this.setCenter({
          x: x,
          y: y
        });
      }
      onMount() {
        //this.recalculatePosition();
        super.onMount();
        //Recompute position as it is not calculated properly

        //Back button behavior
        this.backButton.addClickListener(event => {
          event.stopPropagation();
          this.popDefinition();
          this.backButton.node.blur();
        });
        let backButtonColor = this.backButton.options.style.color;
        this.backButton.node.addEventListener("mouseover", () => {
          this.backButton.setStyle("color", "#0082AD");
        });
        this.backButton.node.addEventListener("mouseout", () => {
          this.backButton.setStyle("color", backButtonColor);
        });
        if (this.stack.length > 1) {
          this.backButton.removeClass("hidden");
        } else {
          this.backButton.addClass("hidden");
        }
      }
    }
    class Definition extends UI$1.Element {
      setOptions(options) {
        super.setOptions(options);
        this.options.term = this.options.term || this.options.value;
        if (this.options.term) {
          this.options.definition = TermDefinition.getDefinition(this.options.term.trim());
        }
        if (this.options.children.length == 0) {
          this.options.children = [this.options.value || this.options.term];
        }
      }
      getNodeType() {
        return "span";
      }
      getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.setStyle("position", "relative");
        return attr;
      }
      render() {
        return [UI$1.createElement("span", {
          ref: "termDefinition",
          style: {
            fontWeight: "bold",
            color: "#0082AD",
            cursor: "pointer"
          }
        }, this.options.children)];
      }
      onMount() {
        this.addClickListener(event => {
          event.stopPropagation();
          let element = this;
          let popupContained = false;
          while (element) {
            if (element instanceof PopupDefinition) {
              popupContained = true;
            }
            element = element.parent;
          }
          let title = this.options.definition.title;
          let definition = this.options.definition.definition;
          if (!popupContained) {
            if (this.constructor.activeDefinition === this) {
              this.constructor.Popup.hide();
              this.constructor.Popup = null;
              this.constructor.activeDefinition = null;
              return;
            }
            if (this.constructor.Popup && this.constructor.Popup.isInDocument()) {
              this.constructor.Popup.hide();
            }
            this.constructor.Popup = PopupDefinition.create(this, {
              target: this.termDefinition,
              definition: this,
              title: title,
              content: definition,
              width: "300px"
            });
          } else {
            this.constructor.Popup.pushDefinition({
              title: title,
              content: definition
            });
          }
          this.constructor.activeDefinition = this;
        });
      }
    }

    // Setting these attributes as styles in mozilla has no effect.
    // To maintain compatibility between moz and webkit, whenever
    // one of these attributes is set as a style, it is also set as a
    // node attribute.
    const MozStyleElements = new Set(["width", "height", "rx", "ry", "cx", "cy", "x", "y"]);
    class SVGNodeAttributes extends NodeAttributes {
      // SVG-specific attributes that may be set

      fixMozAttributes(node) {
        if (this.hasOwnProperty("style")) {
          for (let attributeName of MozStyleElements.values()) {
            if (this.style && typeof this.style === "object" && this.style.hasOwnProperty(attributeName) && !this.hasOwnProperty(attributeName)) {
              this.setAttribute(attributeName, this.style[attributeName], node);
            }
          }
        }
      }
      setStyle(attributeName, value, node) {
        super.setStyle(attributeName, value, node);
        if (typeof attributeName === "string" && MozStyleElements.has(attributeName)) {
          this.setAttribute(attributeName, value, node);
        }
      }

      // SVG elements have a different API for setting the className than regular DOM nodes
      applyClassName(node) {
        if (this.className) {
          const className = String(this.className);
          node.setAttribute("class", className);
        } else {
          node.removeAttribute("class");
        }
      }
      apply(node, attributesMap) {
        this.transform = this.transform || this.translate;
        super.apply(node, attributesMap);
        this.fixMozAttributes(node);
      }
    }

    // TODO Simplify this class
    class SVGUIElement extends UIElement {
      createNode() {
        this.node = document.createElementNS("http://www.w3.org/2000/svg", this.getNodeType());
        applyDebugFlags(this);
        return this.node;
      }
      getNodeType() {
        return this.options?.nodeType || "div";
      }
      getScreenCoordinatedForPoint(point) {
        const {
          node
        } = this;
        // TODO: this is a good argument to always keep a reference to the Stem element in the nodes
        const svgNode = node.ownerSVGElement || node;
        if (svgNode.createSVGPoint) {
          // Using native SVG transformations
          // See https://msdn.microsoft.com/en-us/library/hh535760(v=vs.85).aspx
          let svgPoint = svgNode.createSVGPoint();
          svgPoint.x = point.x;
          svgPoint.y = point.y;
          return svgPoint.matrixTransform(node.getScreenCTM().inverse());
        }
        const rect = this.getBoundingClientRect();
        return {
          x: point.x - rect.left - node.clientLeft,
          y: point.y - rect.top - node.clientTop
        };
      }
      getMouseCoordinatesForEvent(event = window.event) {
        return this.getScreenCoordinatedForPoint({
          x: Device.getEventX(event),
          y: Device.getEventY(event)
        });
      }
      saveState() {
        let state = {};
        state.options = Object.assign({}, this.options);
        return state;
      }
      setState(state) {
        debugger;
        this.setOptions(state.options);
      }

      // TODO @cleanup deprecate
      getOptionsAsNodeAttributes() {
        return setObjectPrototype(this.options, SVGNodeAttributes);
      }
      instantiateNodeAttributes() {
        return new SVGNodeAttributes(this.options);
      }
      translate(x = 0, y = 0) {
        this.options.translate = "translate(" + x + "," + y + ")";
      }

      //TODO(@all) : getBoundingClientRect is unreliable, reimplement it.
      getBoundingClientRect() {
        let element = this.node;
        let x = 0;
        let y = 0;
        while (element && element !== document.body) {
          x -= element.scrollLeft;
          y -= element.scrollTop;
          element = element.offsetParent || element.parentNode;
        }
        if (element) {
          x -= element.scrollLeft;
          y -= element.scrollTop;
        }
        let pos = this.node.getBoundingClientRect();
        return {
          top: pos.top - y,
          left: pos.left - x,
          width: pos.width,
          bottom: pos.bottom - y,
          height: pos.height,
          right: pos.right - x
        };
      }
      getBBox() {
        return this.node.getBBox();
      }
      getHeight() {
        return this.getBoundingClientRect().height;
      }
      getWidth() {
        return this.getBoundingClientRect().width;
      }
      toFront() {
        const parentNode = this.node?.parentElement;
        if (parentNode) {
          parentNode.removeChild(this.node);
          parentNode.appendChild(this.node);
        }
      }
      toBack() {}
      setOpacity(newOpacity) {
        this.options.opacity = newOpacity;
        if (this.node) {
          this.node.setAttribute("opacity", newOpacity);
        }
      }
      setColor(color) {
        this.options.color = color;
        if (this.node) {
          this.node.setAttribute("stroke", color);
          this.node.setAttribute("fill", color);
        }
      }
      remove() {}
      getSvg() {
        if (this.getNodeType() == "svg") {
          return this;
        }
        return this.parent.getSvg();
      }
    }
    SVGUIElement.domAttributesMap = new DOMAttributesMap(UI$1.Element.domAttributesMap, [["fill"], ["height"], ["opacity"], ["stroke"], ["strokeWidth", {
      domName: "stroke-width"
    }], ["clipPath", {
      domName: "clip-path"
    }], ["transform"], ["width"], ["cx"], ["cy"], ["rx"], ["ry"], ["x"], ["y"], ["x1"], ["y1"], ["x2"], ["y2"], ["offset"], ["stopColor", {
      domName: "stop-color"
    }], ["strokeDasharray", {
      domName: "stroke-dasharray"
    }], ["strokeLinecap", {
      domName: "stroke-linecap"
    }], ["viewBox", {
      domName: "viewBox"
    }]]);

    // Keep a map for every base class, and for each base class keep a map for each nodeType, to cache classes
    const svgPrimitiveMap = new WeakMap();
    function SVGPrimitive(nodeType, BaseClass = SVGUIElement) {
      let baseClassPrimitiveMap = svgPrimitiveMap.get(BaseClass);
      if (!baseClassPrimitiveMap) {
        baseClassPrimitiveMap = new Map();
        svgPrimitiveMap.set(BaseClass, baseClassPrimitiveMap);
      }
      let resultClass = baseClassPrimitiveMap.get(nodeType);
      if (resultClass) {
        return resultClass;
      }
      resultClass = class SVGPrimitive extends BaseClass {
        getNodeType() {
          return nodeType;
        }
        createNode() {
          this.node = document.createElementNS("http://www.w3.org/2000/svg", nodeType);
          applyDebugFlags(this);
          return this.node;
        }
      };
      baseClassPrimitiveMap.set(nodeType, resultClass);
      return resultClass;
    }
    const SVG = {
      Element: SVGUIElement};
    UI$1.SVGElement = SVGUIElement;

    class SVGRoot extends SVGPrimitive("svg") {}
    class RawSVG extends SVGRoot {
      redraw() {
        super.redraw();
        this.node.innerHTML = this.options.innerHTML;
        return true;
      }
    }
    class SVGGroup extends SVGPrimitive("g") {
      setColor(color) {
        for (let i = 0; i < this.children.length; i += 1) {
          this.children[i].setColor(color);
        }
      }
    }
    class SVGPath extends SVGPrimitive("path") {
      getDefaultOptions(options) {
        return {
          d: ""
        };
      }
      getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.setAttribute("d", this.getPath());
        return attr;
      }
      getPath() {
        return this.options.d;
      }
      setPath(newPath) {
        this.options.d = newPath;
        this.node.setAttribute("d", this.options.d);
      }
      getLength() {
        return this.node.getTotalLength();
      }
      getPointAtLength(len) {
        return this.node.getPointAtLength(len);
      }
      getPointAtLengthWithAngle(len) {
        let totalLength = this.getLength();
        let epsilon;
        if (totalLength <= 1) {
          epsilon = totalLength / 1000;
        } else {
          epsilon = Math.min(totalLength / 1000, Math.log(totalLength), 1);
        }
        let p1 = this.getPointAtLength(len);
        let p2 = this.getPointAtLength(Math.min(len + epsilon, totalLength));
        let p3 = this.getPointAtLength(Math.max(len - epsilon, 0));
        return {
          x: p1.x,
          y: p1.y,
          alpha: 180 * Math.atan2(p3.y - p2.y, p3.x - p2.x) / Math.PI
        };
      }
    }
    class SVGCircle extends SVGPrimitive("circle") {
      getDefaultOptions(options) {
        return {
          radius: 0,
          center: {
            x: 0,
            y: 0
          }
        };
      }
      getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.setAttribute("r", this.options.radius);
        attr.setAttribute("cx", this.options.center.x);
        attr.setAttribute("cy", this.options.center.y);
        return attr;
      }
      getRadius() {
        return this.options.radius;
      }
      setRadius(radius) {
        this.options.radius = radius;
        this.setAttribute("r", radius);
      }
      setCenter(x, y) {
        this.options.center.x = x;
        this.options.center.y = y;
        this.setAttribute("cx", x);
        this.setAttribute("cy", y);
      }
      getCenter() {
        return this.options.center;
      }
      toPath() {
        let r = this.options.radius;
        let cx = this.options.center.x;
        let cy = this.options.center.y;
        let pathString = "M" + (cx - r) + " " + cy +
        // Starting point is W
        "a" + r + " " + r + " 0 0 1 " + r + " " + -r +
        // Move to N
        "a" + r + " " + r + " 0 0 1 " + r + " " + r +
        // Move to E
        "a" + r + " " + r + " 0 0 1 " + -r + " " + r +
        // Move to S
        "a" + r + " " + r + " 0 0 1 " + -r + " " + -r; // Finally, move back to W
        return new SVGPath({
          d: pathString
        });
      }
    }
    class SVGCircleArc extends SVGPath {
      getPath() {
        let startAngle = this.options.startAngle;
        let endAngle = this.options.endAngle;
        let radius = this.options.radius;
        let center = this.options.center;
        var angleDiff = endAngle - startAngle + (endAngle < startAngle ? 2 * Math.PI : 0);
        var startPoint = polarToCartesian(startAngle, radius, center);
        var endPoint = polarToCartesian(endAngle, radius, center);
        var sweepFlag;
        var largeArcFlag;

        // Set largeArcFlag and sweepFlag
        if (angleDiff <= Math.PI) {
          largeArcFlag = 0;
          if (crossProduct(startPoint, endPoint, center) <= 0) {
            sweepFlag = 0;
          } else {
            sweepFlag = 1;
          }
        } else {
          largeArcFlag = 1;
          if (crossProduct(startPoint, endPoint, center) <= 0) {
            sweepFlag = 1;
          } else {
            sweepFlag = 0;
          }
        }
        return "M " + startPoint.x + " " + startPoint.y + " A " + radius + " " + radius + " 0 " + largeArcFlag + " " + sweepFlag + " " + endPoint.x + " " + endPoint.y;
      }
    }
    class SVGRect extends SVGPrimitive("rect") {
      getX() {
        return this.options.x;
      }
      setX(x) {
        this.options.x = x;
        this.node.setAttribute("x", this.options.x);
      }
      getY() {
        return this.options.y;
      }
      setY(y) {
        this.options.y = y;
        this.node.setAttribute("y", this.options.y);
      }
      getWidth() {
        return this.options.width;
      }
      setWidth(width) {
        this.options.width = width;
        this.node.setAttribute("width", this.options.width);
      }
      getHeight() {
        return this.options.height;
      }
      setHeight(height) {
        this.options.height = height;
        this.node.setAttribute("height", this.options.height);
      }
    }
    class SVGLine extends SVGPrimitive("line") {
      getDefaultOptions(options) {
        return {
          fill: "black",
          stroke: "black"
        };
      }

      //TODO(@all): Make the getters for x1, y1, x2, y2

      setLine(x1, y1, x2, y2) {
        this.options.x1 = x1;
        this.options.y1 = y1;
        this.options.x2 = x2;
        this.options.y2 = y2;
        this.setAttribute("x1", x1);
        this.setAttribute("y1", y1);
        this.setAttribute("x2", x2);
        this.setAttribute("y2", y2);
      }
    }
    class Polygon extends SVGPath {
      getDefaultOptions(options) {
        return {
          points: []
        };
      }
      getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.setAttribute("d", this.getPolygonPath());
        return attr;
      }
      getPolygonPath() {
        let pathString = "";
        for (let i = 0; i < this.options.points.length; ++i) {
          if (i == 0) {
            pathString += "M ";
          } else {
            pathString += "L ";
          }
          pathString += this.options.points[i].x + " " + this.options.points[i].y + " ";
        }
        pathString += "Z";
        return pathString;
      }
    }
    SVG.Circle = SVGCircle;
    SVG.Path = SVGPath;
    SVG.Group = SVGGroup;
    SVG.Line = SVGLine;
    SVG.Rect = SVGRect;

    const {
      EmojiData
    } = self;
    class EmojiModifier extends MarkupModifier {
      constructor(options) {
        super(options);

        // TODO should be probably build when needed
        this.emojiMap = new Map();
        this.unicodeToEmojiMap = new Map();
        for (let emoji in EmojiData.EMOJI) {
          this.emojiMap.set(EmojiData.EMOJI[emoji].key, emoji);
          this.unicodeToEmojiMap.set(EmojiData.EMOJI[emoji].unicode, emoji);
        }
        for (let emoticon in EmojiData.EMOTICONS) {
          let emoji = this.unicodeToEmojiMap.get(EmojiData.EMOTICONS[emoticon]);
          this.emojiMap.set(emoticon, emoji);
        }
      }
      modify(currentArray, originalString) {
        let newArray = [];
        let arrayLocation = 0;
        let currentElement = currentArray[arrayLocation];
        let lineStart = 0;
        let checkAndAddEmoji = (start, end) => {
          let substr = originalString.substring(start, end);
          if (this.emojiMap.has(substr)) {
            if (currentElement.start < start) {
              newArray.push({
                isString: true,
                start: currentElement.start,
                end: start
              });
            }
            newArray.push({
              content: {
                tag: "Emoji",
                value: this.emojiMap.get(substr)
              },
              start: start,
              end: end
            });
            currentElement = {
              isString: true,
              start: end,
              end: currentElement.end
            };
          }
        };
        for (let i = 0; i < originalString.length; i += 1) {
          if (i >= currentElement.end) {
            newArray.push(currentElement);
            arrayLocation += 1;
            currentElement = currentArray[arrayLocation];
          }
          if (currentElement.isJSX) {
            continue;
          }
          if (/\s/.test(originalString[i])) {
            checkAndAddEmoji(lineStart, i);
            lineStart = i + 1;
          }
        }
        if (lineStart < originalString.length) {
          checkAndAddEmoji(lineStart, originalString.length);
        }
        if (currentElement.start < originalString.length) {
          newArray.push(currentElement);
        }
        return newArray;
      }
    }
    MarkupParser.modifiers.push(new EmojiModifier());
    class Emoji extends UI$1.Element {
      setOptions(options) {
        options.height = options.height || "1.25em";
        options.width = options.width || "1.25em";
        super.setOptions(options);
      }
      getNodeType() {
        return "span";
      }
      render() {
        if (!EmojiData.isFull) {
          return [];
        }
        if (EmojiData.EMOJI[this.options.value]) {
          return UI$1.createElement(SVGRoot, {
            ref: "svg",
            height: this.options.height,
            width: this.options.width,
            style: {
              "display": "inline-block",
              "margin": "-.2ex .15em .2ex",
              "line-height": "normal",
              "vertical-align": "middle"
            }
          });
        } else {
          return [];
        }
      }
      getNodeAttributes() {
        const attr = super.getNodeAttributes();
        if (EmojiData.EMOJI[this.options.value]) {
          attr.setAttribute("title", ":" + this.options.value + ":");
        }
        if (this.options.title) {
          attr.setAttribute("title", this.options.title);
        }
        return attr;
      }
      updateEmojiContent() {
        if (EmojiData.EMOJI[this.options.value]) {
          this.svg.node.innerHTML = EmojiData.EMOJI[this.options.value].svgData;
          this.svg.node.setAttribute("viewBox", "0 0 64 64");
        } else {
          console.error("Invalid emoji value", this.options.value);
        }
      }
      redraw() {
        if (EmojiData.isFull) {
          super.redraw();
          this.updateEmojiContent();
          return;
        }
        // TODO add some configs to ensure, so just say ensure("Emoji", callback);
        ensure(`/static/js/Emoji.js?v=${JS_VERSION}`, () => {
          if (this.node) {
            this.redraw();
          }
        });
      }
    }

    var _class$2v, _descriptor$Z, _descriptor2$Q, _descriptor3$I, _descriptor4$C, _descriptor5$y, _dec$1g, _class2$1d;
    function cardPanelColorToStyle(color) {
      let colors = buildColors(color);
      return {
        borderColor: colors[4]
      };
    }
    let CardPanelStyle = (_class$2v = class CardPanelStyle extends BasicLevelStyleSheet(cardPanelColorToStyle) {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "heading", _descriptor$Z, this);
        _initializerDefineProperty(this, "LARGE", _descriptor2$Q, this);
        _initializerDefineProperty(this, "body", _descriptor3$I, this);
        _initializerDefineProperty(this, "container", _descriptor4$C, this);
        _initializerDefineProperty(this, "centered", _descriptor5$y, this);
      }
    }, _descriptor$Z = _applyDecoratedDescriptor(_class$2v.prototype, "heading", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          display: "flex",
          alignItems: "center",
          width: "100%",
          flexDirection: "row",
          padding: "5px",
          minHeight: this.themeProps.CARD_PANEL_HEADER_HEIGHT,
          textTransform: this.themeProps.CARD_PANEL_TEXT_TRANSFORM,
          paddingLeft: this.themeProps.CARD_PANEL_HEADING_PADDING,
          paddingRight: this.themeProps.CARD_PANEL_HEADING_PADDING,
          ...cardPanelHeaderColorToStyle(this.themeProps.COLOR_BACKGROUND)
        };
      }
    }), _descriptor2$Q = _applyDecoratedDescriptor(_class$2v.prototype, "LARGE", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          minHeight: this.themeProps.CARD_PANEL_HEADER_HEIGHT_LARGE,
          paddingLeft: this.themeProps.CARD_PANEL_HEADING_PADDING_LARGE,
          paddingRight: this.themeProps.CARD_PANEL_HEADING_PADDING_LARGE
        };
      }
    }), _descriptor3$I = _applyDecoratedDescriptor(_class$2v.prototype, "body", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {};
      }
    }), _descriptor4$C = _applyDecoratedDescriptor(_class$2v.prototype, "container", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return [{
          borderWidth: this.themeProps.BASE_BORDER_WIDTH,
          borderRadius: this.themeProps.BASE_BORDER_RADIUS,
          boxShadow: this.themeProps.BASE_BOX_SHADOW,
          borderStyle: this.themeProps.BASE_BORDER_STYLE,
          backgroundColor: this.themeProps.COLOR_BACKGROUND
        }, cardPanelColorToStyle(this.themeProps.COLOR_BACKGROUND)];
      }
    }), _descriptor5$y = _applyDecoratedDescriptor(_class$2v.prototype, "centered", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          textAlign: "center",
          justifyContent: "center"
        };
      }
    }), _class$2v);
    function cardPanelHeaderColorToStyle(color) {
      let colors = buildColors(color);
      return {
        color: colors[6],
        backgroundColor: colors[1],
        borderBottomColor: colors[4]
      };
    }
    const CardPanelHeaderStyle = BasicLevelStyleSheet(cardPanelHeaderColorToStyle);
    let CardPanel = (_dec$1g = registerStyle(CardPanelStyle), _dec$1g(_class2$1d = class CardPanel extends SimpleStyledElement {
      getTitle() {
        return this.options.title;
      }
      getHeaderStyleSheet() {
        return CardPanelHeaderStyle.getInstance();
      }
      getDefaultOptions() {
        return {
          headingCentered: true,
          bodyCentered: false,
          level: Level.PRIMARY
        };
      }
      getHeadingClasses() {
        const {
          styleSheet
        } = this;
        const {
          headingCentered
        } = this.options;
        const headingLevel = this.getHeaderStyleSheet().Level(this.getLevel());
        let headingClasses = styleSheet.heading;
        if (headingLevel) {
          headingClasses = headingClasses + headingLevel;
        }
        if (this.getSize()) {
          headingClasses = headingClasses + styleSheet.Size(this.getSize());
        }
        if (headingCentered) {
          headingClasses = headingClasses + styleSheet.centered;
        }
        return headingClasses;
      }
      getBodyClasses() {
        const {
          styleSheet
        } = this;
        const {
          bodyCentered
        } = this.options;
        let bodyClasses = styleSheet.body;
        if (bodyCentered) {
          bodyClasses = bodyClasses + styleSheet.centered;
        }
        return bodyClasses;
      }
      getChildrenToRender() {
        const headingClasses = this.getHeadingClasses();
        const bodyClasses = this.getBodyClasses();
        return [UI.createElement("div", {
          ref: "panelTitle",
          className: headingClasses
        }, this.getTitle()), UI.createElement("div", {
          ref: "panelBody",
          className: bodyClasses,
          style: this.options.bodyStyle
        }, this.render())];
      }
    }) || _class2$1d);

    var _class$2u, _descriptor$Y, _descriptor2$P, _descriptor3$H, _descriptor4$B, _descriptor5$x, _class2$1c, _descriptor6$s, _descriptor7$n, _descriptor8$k, _descriptor9$g;
    let CollapsibleStyle = (_class$2u = class CollapsibleStyle extends StyleSheet {
      constructor(...args) {
        super(...args);
        this.transitionDuration = 0.4;
        // TODO @theme use this.themeProps.DEFAULT_TRANSITION_DURATION_MS
        _initializerDefineProperty(this, "collapsing", _descriptor$Y, this);
        _initializerDefineProperty(this, "collapsed", _descriptor2$P, this);
        _initializerDefineProperty(this, "toggleButton", _descriptor3$H, this);
        _initializerDefineProperty(this, "toggleIcon", _descriptor4$B, this);
        _initializerDefineProperty(this, "toggleIconCollapsed", _descriptor5$x, this);
      }
    }, _descriptor$Y = _applyDecoratedDescriptor(_class$2u.prototype, "collapsing", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          marginTop: "0",
          transitionTimingFunction: "ease",
          transitionDuration: `${this.transitionDuration}s`,
          transitionProperty: "margin-top",
          transitionDelay: "-0.15s"
        };
      }
    }), _descriptor2$P = _applyDecoratedDescriptor(_class$2u.prototype, "collapsed", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          marginTop: "-100% !important",
          transitionDelay: "0s !important"
        };
      }
    }), _descriptor3$H = _applyDecoratedDescriptor(_class$2u.prototype, "toggleButton", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          cursor: "pointer"
        };
      }
    }), _descriptor4$B = _applyDecoratedDescriptor(_class$2u.prototype, "toggleIcon", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          transition: "0.3s ease",
          display: "inline-block"
        };
      }
    }), _descriptor5$x = _applyDecoratedDescriptor(_class$2u.prototype, "toggleIconCollapsed", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          transform: "rotate(-90deg) !important"
        };
      }
    }), _class$2u);
    let CollapsiblePanelStyle = (_class2$1c = class CollapsiblePanelStyle extends CardPanelStyle {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "container", _descriptor6$s, this);
        _initializerDefineProperty(this, "heading", _descriptor7$n, this);
        _initializerDefineProperty(this, "title", _descriptor8$k, this);
        _initializerDefineProperty(this, "content", _descriptor9$g, this);
      }
    }, _descriptor6$s = _applyDecoratedDescriptor(_class2$1c.prototype, "container", [styleRuleInherit], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          boxShadow: null,
          borderWidth: 1,
          borderColor: "#ccc !important",
          borderRadius: this.themeProps.BUTTON_BORDER_RADIUS
        };
      }
    }), _descriptor7$n = _applyDecoratedDescriptor(_class2$1c.prototype, "heading", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          padding: 10,
          cursor: "pointer",
          fontSize: 16,
          ...(this.themeProps.CARD_HEADER_HEIGHT ? {
            display: "flex",
            alignItems: "center"
          } : {}),
          height: this.themeProps.CARD_HEADER_HEIGHT,
          color: this.themeProps.CARD_HEADER_TEXT_COLOR,
          backgroundColor: this.themeProps.CARD_HEADER_BACKGROUND_COLOR,
          ":hover": {
            backgroundColor: enhance(this.themeProps.CARD_HEADER_BACKGROUND_COLOR, 0.1)
          }
        };
      }
    }), _descriptor8$k = _applyDecoratedDescriptor(_class2$1c.prototype, "title", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          padding: 4
        };
      }
    }), _descriptor9$g = _applyDecoratedDescriptor(_class2$1c.prototype, "content", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          padding: 8
        };
      }
    }), _class2$1c);

    // TODO @types should be an abstract class
    class BaseInputElement extends UIElement {
      constructor(...args) {
        super(...args);
        this.value = void 0;
      }
      getValue() {
        return this.value;
      }

      // TODO This should be an options object, not a list of bools
      setValue(value, dispatchChange = true, doRedraw = true) {
        if (this.isEqual(this.value, value)) {
          return;
        }
        this.value = value;
        if (doRedraw && this.node) {
          this.redraw();
        }
        if (dispatchChange) {
          this.dispatchChange(value);
        }
      }
      isEqual(valueA, valueB) {
        return valueA === valueB;
      }
      setOptions(options) {
        const oldInitialValue = this.options?.initialValue;
        super.setOptions(options);
        const {
          initialValue
        } = this.options;
        if (this.value === undefined || !this.node || !this.isEqual(initialValue, oldInitialValue)) {
          this.setValue(initialValue, false, false);
        }
        if (this.options.hasOwnProperty("value")) {
          this.setValue(this.options.value);
        }
      }
      focus() {
        this.node?.focus();
      }
      blur() {
        this.node?.blur();
      }
      dispatchChange(value) {
        // TODO @Mihai WAT? Implementation will be provided by subclasses or mixins
        if (this.options.onChange) {
          this.options.onChange(value, this);
        }
      }
    }

    var _class$2t, _descriptor$X, _descriptor2$O, _descriptor3$G, _dec$1f, _class2$1b;
    let SimpleCollapsibleStyle = (_class$2t = class SimpleCollapsibleStyle extends StyleSheet {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "container", _descriptor$X, this);
        _initializerDefineProperty(this, "iconCollapsed", _descriptor2$O, this);
        _initializerDefineProperty(this, "collapsed", _descriptor3$G, this);
      }
    }, _descriptor$X = _applyDecoratedDescriptor(_class$2t.prototype, "container", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          transition: "all 0.3s ease",
          display: "inline-block"
        };
      }
    }), _descriptor2$O = _applyDecoratedDescriptor(_class$2t.prototype, "iconCollapsed", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          transform: "rotate(-90deg) !important"
        };
      }
    }), _descriptor3$G = _applyDecoratedDescriptor(_class$2t.prototype, "collapsed", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          // transition: "all 0.3s ease",
          transform: "scaleY(0)",
          maxHeight: 0
        };
      }
    }), _class$2t); // If value is true, it means we're collapsed
    (_dec$1f = registerStyle(SimpleCollapsibleStyle), _dec$1f(_class2$1b = class CollapsibleControllerInput extends BaseInputElement {
      getTarget() {
        const {
          target
        } = this.options;
        return isFunction(target) ? target() : target;
      }
      expand() {
        this.setValue(false);
        const panel = this.getTarget();
        if (!panel) {
          return;
        }
        const {
          styleSheet
        } = this;
        panel.removeClass(styleSheet.collapsed);
        this.removeClass(styleSheet.iconCollapsed);
      }
      collapse() {
        this.setValue(true);
        const panel = this.getTarget();
        if (!panel) {
          return;
        }
        const {
          styleSheet
        } = this;
        panel.addClass(styleSheet.collapsed);
        // // TODO(@mihai): Implement a pattern for this
        // panel.addNodeListener("transitionend", () => {
        //     if (this.getValue()) {
        //         panel.addClass(GlobalStyle.hidden);
        //     }
        // });

        this.addClass(styleSheet.iconCollapsed);
      }
      toggle() {
        if (this.getValue()) {
          this.expand();
        } else {
          this.collapse();
        }
      }
      applyCollapsedState() {
        if (this.getValue()) {
          this.collapse();
        } else {
          this.expand();
        }
      }
      render() {
        return MakeIcon("chevron-down");
      }
      onMount() {
        super.onMount();
        this.addClickListener(() => {
          this.toggle();
        });
      }
    }) || _class2$1b);
    function CollapsibleMixin(BaseClass, CollapsibleClass = CollapsibleStyle) {
      class CollapsibleElement extends BaseClass {
        getDefaultOptions() {
          return {
            collapsed: true
          };
        }
        getCollapsibleStyleSheet() {
          return this.options.collapsibleStyleSheet || this.constructor.collapsibleStyleSheet;
        }
        getToggleIcon() {
          const collapsibleStyle = this.getCollapsibleStyleSheet();
          let iconClassName = collapsibleStyle.toggleIcon;
          if (this.options.collapsed) {
            iconClassName += collapsibleStyle.toggleIconCollapsed;
          }
          return UI.createElement("div", {
            ref: "toggleIcon",
            className: iconClassName
          }, MakeIcon("chevron-down"));
        }
        expand(panel = this.contentArea) {
          const collapsibleStyle = this.getCollapsibleStyleSheet();
          this.options.collapsed = false;
          panel.removeClass(GlobalStyle.hidden);
          panel.addClass(collapsibleStyle.collapsing);
          setTimeout(() => {
            panel.removeClass(collapsibleStyle.collapsed);
          }, 100); // TODO @branch take this from this.themeProps

          this.toggleIcon?.removeClass(this.getCollapsibleStyleSheet().toggleIconCollapsed);
        }
        collapse(panel = this.contentArea) {
          const collapsibleStyle = this.getCollapsibleStyleSheet();
          this.options.collapsed = true;
          panel.addClass(collapsibleStyle.collapsing);
          panel.addClass(collapsibleStyle.collapsed);
          // TODO(@mihai): Implement a pattern for this
          panel.addNodeListener("transitionend", () => {
            if (this.options.collapsed) {
              panel.addClass(GlobalStyle.hidden);
            }
          });
          this.toggleIcon?.addClass(this.getCollapsibleStyleSheet().toggleIconCollapsed);
        }
        toggle() {
          if (this.options.collapsed) {
            this.expand();
          } else {
            this.collapse();
          }
        }
      }
      CollapsibleElement.collapsibleStyleSheet = CollapsibleClass.getInstance();
      return CollapsibleElement;
    }

    var _dec$1e, _class$2s;
    let CollapsiblePanel = (_dec$1e = registerStyle(CollapsiblePanelStyle), _dec$1e(_class$2s = class CollapsiblePanel extends CollapsibleMixin(CardPanel) {
      getPreservedOptions() {
        return {
          collapsed: this.options.collapsed // TODO: rename to defaultCollapsed?
        };
      }
      getChildrenToRender() {
        let contentClassName = this.styleSheet.content;
        if (this.options.collapsed) {
          contentClassName += GlobalStyle.hidden;
        }
        return [UI.createElement("div", {
          onClick: () => this.toggle(),
          className: this.styleSheet.heading
        }, this.getToggleIcon(), UI.createElement("span", {
          className: this.styleSheet.title
        }, this.getTitle())), UI.createElement("div", {
          style: {
            overflow: "hidden"
          }
        }, UI.createElement("div", {
          ref: "contentArea",
          className: contentClassName
        }, this.render()))];
      }
    }) || _class$2s);

    var _class$2r, _descriptor$W, _descriptor2$N, _descriptor3$F, _descriptor4$A, _descriptor5$w, _descriptor6$r;
    let FormStyle = (_class$2r = class FormStyle extends StyleSheet {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "form", _descriptor$W, this);
        _initializerDefineProperty(this, "formGroup", _descriptor2$N, this);
        _initializerDefineProperty(this, "formField", _descriptor3$F, this);
        _initializerDefineProperty(this, "sameLine", _descriptor4$A, this);
        this.separatedLineInputStyle = {
          marginRight: "0.5em",
          width: "100%",
          height: "2.4em"
        };
        _initializerDefineProperty(this, "separatedLine", _descriptor5$w, this);
        _initializerDefineProperty(this, "hasError", _descriptor6$r, this);
      }
    }, _descriptor$W = _applyDecoratedDescriptor(_class$2r.prototype, "form", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          margin: "0 auto"
        };
      }
    }), _descriptor2$N = _applyDecoratedDescriptor(_class$2r.prototype, "formGroup", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          marginBottom: "10px"
        };
      }
    }), _descriptor3$F = _applyDecoratedDescriptor(_class$2r.prototype, "formField", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          ">label": {
            width: "100%"
          },
          display: "block",
          padding: "6px 0px",
          lineHeight: "1.42857143",
          color: "#555",
          maxWidth: "600px",
          margin: "0 auto",
          "[disabled]": {
            opacity: "1",
            cursor: "not-allowed"
          },
          "[readonly]": {
            opacity: "1"
          }
        };
      }
    }), _descriptor4$A = _applyDecoratedDescriptor(_class$2r.prototype, "sameLine", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          ">label>*:nth-child(1)": {
            display: "inline-block",
            textAlign: "right",
            paddingRight: "1em",
            width: "30%",
            verticalAlign: "middle"
          },
          ">label>*:nth-child(2)": {
            display: "inline-block",
            width: "70%",
            verticalAlign: "middle"
          }
        };
      }
    }), _descriptor5$w = _applyDecoratedDescriptor(_class$2r.prototype, "separatedLine", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          padding: "6px 10px",
          ">label>*:nth-child(1)": {
            verticalAlign: "sub"
          },
          ">label>input": this.separatedLineInputStyle,
          ">label>select": this.separatedLineInputStyle,
          ">label>textarea": this.separatedLineInputStyle,
          ">label>input[type='checkbox']": {
            marginLeft: "10px",
            verticalAlign: "middle"
          }
        };
      }
    }), _descriptor6$r = _applyDecoratedDescriptor(_class$2r.prototype, "hasError", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          color: "#a94442"
        };
      }
    }), _class$2r);

    var _dec$1d, _class$2q, _dec2$r, _class2$1a;
    let Form = (_dec$1d = registerStyle(FormStyle), _dec$1d(_class$2q = class Form extends UI$1.Primitive("form") {
      extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.form);
      }
      onMount() {
        // Form elements by default refresh the page when a button inside them is clicked, so we prevent that.
        this.addNodeListener("submit", event => event.preventDefault());
      }
    }) || _class$2q);
    let FormGroup = (_dec2$r = registerStyle(FormStyle), _dec2$r(_class2$1a = class FormGroup extends UI$1.Element {
      extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.formGroup);
      }
      setError(errorMessage) {
        this.errorField.node.textContent = errorMessage;
        this.addClass(this.styleSheet.hasError);
      }
      removeError() {
        this.errorField.node.textContent = "";
        this.removeClass(this.styleSheet.hasError);
      }
      getErrorField() {
        return UI$1.createElement("span", {
          ref: "errorField",
          style: {
            float: "right"
          }
        });
      }
      getChildrenToRender() {
        return [this.render(), this.getErrorField()];
      }
    }) || _class2$1a);
    class FormField extends FormGroup {
      inline() {
        return !(this.options.inline === false || this.parent && this.parent.options && this.parent.options.inline === false);
      }
      extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.formField);
        if (this.inline()) {
          attr.addClass(this.styleSheet.sameLine);
        } else {
          attr.addClass(this.styleSheet.separatedLine);
        }
      }
      getLabel() {
        if (this.options.label) {
          return UI$1.createElement("strong", null, this.options.label);
        }
        return null;
      }
      render() {
        if (this.options.contentFirst) {
          return [UI$1.createElement("label", null, [super.render(), this.getLabel()])];
        } else {
          return [UI$1.createElement("label", null, [this.getLabel(), super.render()])];
        }
      }
    }

    var _class$2p, _descriptor$V, _descriptor2$M, _descriptor3$E;
    let InputStyle = (_class$2p = class InputStyle extends StyleSheet {
      constructor(...args) {
        super(...args);
        _initializerDefineProperty(this, "inputElement", _descriptor$V, this);
        _initializerDefineProperty(this, "checkboxInput", _descriptor2$M, this);
        _initializerDefineProperty(this, "select", _descriptor3$E, this);
      }
    }, _descriptor$V = _applyDecoratedDescriptor(_class$2p.prototype, "inputElement", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          transition: "border-color ease-in-out .15s, box-shadow ease-in-out .15s",
          padding: "0.4em 0.54em",
          background: this.themeProps.INPUT_BACKGROUND,
          border: () => "1px solid " + this.themeProps.INPUT_BORDER_COLOR,
          borderRadius: this.themeProps.INPUT_BORDER_RADIUS,
          height: this.themeProps.INPUT_DEFAULT_HEIGHT,
          ":focus": {
            outline: "0",
            borderColor: "#66afe9"
          }
        };
      }
    }), _descriptor2$M = _applyDecoratedDescriptor(_class$2p.prototype, "checkboxInput", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {
          display: "inline-block"
        };
      }
    }), _descriptor3$E = _applyDecoratedDescriptor(_class$2p.prototype, "select", [styleRule], {
      configurable: true,
      enumerable: true,
      writable: true,
      initializer: function () {
        return {};
      }
    }), _class$2p);

    class TokenFormatter {
      constructor(tokens) {
        this.tokenMap = void 0;
        this.tokenMap = new Map();
        for (const [token, formatter] of tokens) {
          this.tokenMap.set(token, formatter);
        }
      }
      // TODO This is very old code, meh
      splitToTokens(str) {
        // TODO: "[HH]HH" will be split to ["HH", "HH"], so the escape does not solve the problem
        let tokens = [];
        let lastIsLetter = null;
        let escapeByCurlyBracket = false;
        let escapeBySquareBracket = false;
        for (let i = 0; i < str.length; i++) {
          const charCode = str.charCodeAt(i);
          if (charCode === 125 && escapeByCurlyBracket) {
            // '}' ending the escape
            escapeByCurlyBracket = false;
            lastIsLetter = null;
          } else if (charCode === 93 && escapeBySquareBracket) {
            // ']' ending the escape
            escapeBySquareBracket = false;
            lastIsLetter = null;
          } else if (escapeByCurlyBracket || escapeBySquareBracket) {
            // The character is escaped no matter what it is
            tokens[tokens.length - 1] += str[i];
          } else if (charCode === 123) {
            // '{' starts a new escape
            escapeByCurlyBracket = true;
            tokens.push("");
          } else if (charCode === 91) {
            // '[' starts a new escape
            escapeBySquareBracket = true;
            tokens.push("");
          } else {
            const isLetter = 65 <= charCode && charCode <= 90 || 97 <= charCode && charCode <= 122;
            if (isLetter === lastIsLetter) {
              tokens[tokens.length - 1] += str[i];
            } else {
              tokens.push(str[i]);
            }
            lastIsLetter = isLetter;
          }
        }
        if (escapeByCurlyBracket || escapeBySquareBracket) {
          console.warn("Unfinished escaped sequence!");
        }
        return tokens;
      }
      evalToken(value, token) {
        const func = this.tokenMap.get(token);
        if (!func) {
          return token;
        }
        const result = func(value);
        if (!isString(result)) {
          return String(result);
        }
        return result;
      }
      format(value, str) {
        let tokens = this.splitToTokens(str);
        tokens = tokens.map(token => this.evalToken(value, token));
        return tokens.join("");
      }
    }

    var _TimeUnit;
    class TimeUnit {
      constructor(name, baseUnit, multiplier, options = {}) {
        this.name = void 0;
        this.pluralName = void 0;
        this.baseUnit = void 0;
        this.multiplier = void 0;
        this.milliseconds = void 0;
        this.variableMultiplier = void 0;
        this.variableDuration = void 0;
        this.getterName = void 0;
        this.setterName = void 0;
        this.dateMethodSuffix = void 0;
        this.name = name;
        this.pluralName = name + "s";
        this.baseUnit = baseUnit;
        this.multiplier = multiplier;
        this.milliseconds = (baseUnit?.getMilliseconds() || 1) * multiplier;
        this.variableMultiplier = options.variableMultiplier || false;
        this.variableDuration = this.variableMultiplier || baseUnit && baseUnit.isVariable();
        let methodSuffix = name === "year" ? "FullYear" : name === "day" ? "Date" : capitalize(name);
        this.getterName = "get" + methodSuffix;
        this.setterName = "set" + methodSuffix;
        if (!Date.prototype[this.getterName] && Date.prototype[this.getterName + "s"]) {
          this.getterName += "s";
          this.setterName += "s";
        }
        // TODO Should dateMethodSuffix be deprecated? Looks like the getter and setter names are good enough
        if (options.dateMethodSuffix) {
          this.dateMethodSuffix = options.dateMethodSuffix;
        }
      }
      static toTimeUnit(timeUnit) {
        if (timeUnit instanceof TimeUnit) {
          return timeUnit;
        }
        return this.CANONICAL[timeUnit];
      }
      valueOf() {
        return this.milliseconds;
      }
      getName() {
        return this.name;
      }
      getPluralName() {
        return this.pluralName;
      }
      getFrequencyName() {
        if (this.name.toLowerCase() === "day") {
          return "daily";
        }
        return this.name + "ly";
      }
      formatCount(numTimeUnits, omitCountOnSingular) {
        if (numTimeUnits != 1) {
          return numTimeUnits + " " + this.getPluralName();
        } else {
