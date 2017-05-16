let pendingScripts = [];
let pendingCallbacks = [];
let needsProcess = false;

/**
 * Process math in a script node using MathJax
 * @param {MathJax}  MathJax
 * @param {DOMNode}  script
 * @param {Function} callback
 */
export function process(mathJax, script, callback) {
  pendingScripts.push(script);
  pendingCallbacks.push(callback);
  if (!needsProcess) {
    needsProcess = true;
    setTimeout(() => doProcess(mathJax), 0);
  }
}

function doProcess(mathJax) {
  mathJax.Hub.Queue(() => {
    const oldElementScripts = mathJax.Hub.elementScripts;
    mathJax.Hub.elementScripts = element => pendingScripts;

    try {
      return mathJax.Hub.Process(null, () => {
        // Trigger all of the pending callbacks before clearing them
        // out.
        for (const callback of pendingCallbacks) {
          callback();
        }

        pendingScripts = [];
        pendingCallbacks = [];
        needsProcess = false;
      });
    } catch (e) {
      // IE8 requires `catch` in order to use `finally`
      throw e;
    } finally {
      mathJax.Hub.elementScripts = oldElementScripts;
    }
  });
}

