/* tslint:disable:no-parameter-reassignment */

export function handleKey(
  keyToBind: string,
  canInvoke: () => boolean,
  invoke: () => void) {

  (keyBinder as any).key(keyToBind, (event, handler) => {
    if (canInvoke()) {
      invoke();
    }
  });
}

export function unhandleKey(keyToUnbind: string) {
  (keyBinder as any).key.unbind(keyToUnbind);
}

//     keymaster.js
//     (c) 2011-2013 Thomas Fuchs
//     keymaster.js may be freely distributed under the MIT license.

const keyBinder = {};

const handlers = {};
const mods = { 16: false, 18: false, 17: false, 91: false };
const scope = 'all';

// modifier keys
const MODIFIERS = {
  '⇧': 16, shift: 16,
  '⌥': 18, alt: 18, option: 18,
  '⌃': 17, ctrl: 17, control: 17,
  '⌘': 91, command: 91,
};

// special keys
const KEYMAP = {
  backspace: 8, tab: 9, clear: 12,
  enter: 13, return: 13,
  esc: 27, escape: 27, space: 32,
  left: 37, up: 38,
  right: 39, down: 40,
  del: 46, delete: 46,
  home: 36, end: 35,
  pageup: 33, pagedown: 34,
  ',': 188, '.': 190, '/': 191,
  '`': 192, '-': 189, '=': 187,
  ';': 186, '\'': 222,
  '[': 219, ']': 221, '\\': 220,
};
const code = function (x) {
  return KEYMAP[x] || x.toUpperCase().charCodeAt(0);
};
const downKeys = [];

for (let k = 1; k < 20; k = k + 1) KEYMAP['f' + k] = 111 + k;

  // IE doesn't support Array#indexOf, so have a simple replacement
function index(array, item) {
  let i = array.length;
  while (i = i - 1) if (array[i] === item) return i;
  return -1;
}

  // for comparing mods before unassignment
function compareArray(a1, a2) {
  if (a1.length !== a2.length) return false;
  for (let i = 0; i < a1.length; i = i + 1) {
    if (a1[i] !== a2[i]) return false;
  }
  return true;
}

const modifierMap = {
  16:'shiftKey',
  18:'altKey',
  17:'ctrlKey',
  91:'metaKey',
};
function updateModifierKey(event) {
  for (const k in mods) mods[k] = event[modifierMap[k]];
}

  // handle keydown event
function dispatch(event) {
  let key;
  let handler;
  let modifiersMatch;
  let scope;
  key = event.keyCode;

  if (index(downKeys, key) === -1) {
    downKeys.push(key);
  }

    // if a modifier key, set the key.<modifierkeyname> property to true and return
  if (key === 93 || key === 224) key = 91; // right command on webkit, command on Gecko
  if (key in mods) {
    mods[key] = true;
      // 'assignKey' from inside this closure is exported to window.key
    for (const k in MODIFIERS) if (MODIFIERS[k] === key) assignKey[k] = true;
    return;
  }
  updateModifierKey(event);

    // see if we need to ignore the keypress (filter() can can be overridden)
    // by default ignore key presses if a select, textarea, or input is focused
  if (!(assignKey as any).filter.call(this, event)) return;

    // abort if no potentially matching shortcuts found
  if (!(key in handlers)) return;

  scope = getScope();

    // for each potential shortcut
  for (let i = 0; i < handlers[key].length; i = i + 1) {
    handler = handlers[key][i];

      // see if it's in the current scope
    if (handler.scope === scope || handler.scope === 'all') {
        // check if modifiers match if any
      modifiersMatch = handler.mods.length > 0;
      for (const k in mods)
        if ((!mods[k] && index(handler.mods, +k) > -1) ||
            (mods[k] && index(handler.mods, +k) === -1)) modifiersMatch = false;
        // call the handler and stop the event if neccessary
      if ((handler.mods.length === 0 && !mods[16]
        && !mods[18] && !mods[17] && !mods[91]) || modifiersMatch) {
        if (handler.method(event, handler) === false) {
          if (event.preventDefault) event.preventDefault();
          else event.returnValue = false;
          if (event.stopPropagation) event.stopPropagation();
          if (event.cancelBubble) event.cancelBubble = true;
        }
      }
    }
  }
}

  // unset modifier keys on keyup
function clearModifier(event) {
  let key = event.keyCode;
  const i = index(downKeys, key);

    // remove key from downKeys
  if (i >= 0) {
    downKeys.splice(i, 1);
  }

  if (key === 93 || key === 224) key = 91;
  if (key in mods) {
    mods[key] = false;
    for (const k in MODIFIERS) if (MODIFIERS[k] === key) assignKey[k] = false;
  }
}

function resetModifiers() {
  for (const k in mods) mods[k] = false;
  for (const k in MODIFIERS) assignKey[k] = false;
}

  // parse and assign shortcut
function assignKey(key, scope, method) {
  let keys;
  let mods;
  keys = getKeys(key);
  if (method === undefined) {
    method = scope;
    scope = 'all';
  }

    // for each shortcut
  for (let i = 0; i < keys.length; i = i + 1) {
      // set modifier keys if any
    mods = [];
    key = keys[i].split('+');
    if (key.length > 1) {
      mods = getMods(key);
      key = [key[key.length - 1]];
    }
      // convert to keycode and...
    key = key[0];
    key = code(key);
      // ...store handler
    if (!(key in handlers)) handlers[key] = [];
    handlers[key].push({ shortcut: keys[i], scope, method, key: keys[i], mods });
  }
}

  // unbind all handlers for given key in current scope
function unbindKey(key, scope) {
  let multipleKeys;
  let keys;
  let mods = [];
  multipleKeys = getKeys(key);

  for (let j = 0; j < multipleKeys.length; j = j + 1) {
    keys = multipleKeys[j].split('+');

    if (keys.length > 1) {
      mods = getMods(keys);
    }

    key = keys[keys.length - 1];
    key = code(key);

    if (scope === undefined) {
      scope = getScope();
    }
    if (!handlers[key]) {
      return;
    }
    for (let i = 0; i < handlers[key].length; i = i + 1) {
      const obj = handlers[key][i];
        // only clear handlers if correct scope and mods match
      if (obj.scope === scope && compareArray(obj.mods, mods)) {
        handlers[key][i] = {};
      }
    }
  }
}

  // Returns true if the key with code 'keyCode' is currently down
  // Converts strings into key codes.
function isPressed(keyCode) {
  if (typeof(keyCode) === 'string') {
    keyCode = code(keyCode);
  }
  return index(downKeys, keyCode) !== -1;
}

function getPressedKeyCodes() {
  return downKeys.slice(0);
}

function filter(event) {
  const tagName = (event.target || event.srcElement).tagName;
    // ignore keypressed in any elements that support keyboard data input
  return !(tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA');
}

  // initialize key.<modifier> to false
for (const k in MODIFIERS) assignKey[k] = false;

  // set current scope (default 'all')
function setScope(scope) { scope = scope || 'all'; }
function getScope() { return scope || 'all'; }

  // delete all handlers for a given scope
function deleteScope(scope) {
  let h;
  let i;

  for (const key in handlers) {
    h = handlers[key];
    for (i = 0; i < h.length;) {
      if (h[i].scope === scope) h.splice(i, 1);
      else i = i + 1;
    }
  }
}

  // abstract key logic for assign and unassign
function getKeys(key) {
  let keys;
  key = key.replace(/\s/g, '');
  keys = key.split(',');
  if ((keys[keys.length - 1]) === '') {
    keys[keys.length - 2] += ',';
  }
  return keys;
}

  // abstract mods logic for assign and unassign
function getMods(key) {
  const mods = key.slice(0, key.length - 1);
  for (let mi = 0; mi < mods.length; mi = mi + 1)
    mods[mi] = MODIFIERS[mods[mi]];
  return mods;
}

  // cross-browser events
function addEvent(object, event, method) {
  if (object.addEventListener)
    object.addEventListener(event, method, false);
  else if (object.attachEvent)
    object.attachEvent('on' + event, () => { method(window.event); });
}

// set the handlers globally on document
// Passing scope to a callback to ensure it remains the same by execution. Fixes #48
addEvent(document, 'keydown', (event) => { dispatch(event); });
addEvent(document, 'keyup', clearModifier);

  // reset modifiers to false whenever the window is (re)focused.
addEvent(window, 'focus', resetModifiers);

  // store previously defined key
const previousKey = (keyBinder as any).key;

  // restore previously defined key and return reference to our key object
function noConflict() {
  const k = (keyBinder as any).key;
  (keyBinder as any).key = previousKey;
  return k;
}

  // set window.key and window.key.set/get/deleteScope, and the default filter
(keyBinder as any).key = assignKey;
(keyBinder as any).key.setScope = setScope;
(keyBinder as any).key.getScope = getScope;
(keyBinder as any).key.deleteScope = deleteScope;
(keyBinder as any).key.filter = filter;
(keyBinder as any).key.isPressed = isPressed;
(keyBinder as any).key.getPressedKeyCodes = getPressedKeyCodes;
(keyBinder as any).key.noConflict = noConflict;
(keyBinder as any).key.unbind = unbindKey;

