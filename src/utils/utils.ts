import { List, OrderedMap } from 'immutable';

export function pipe(...args) {
  return input => args.reduce((acc, f) => f(acc), input);
}

type Fn<T> = () => T;

type Cases<T> = {
  [key: string]: (T | Fn<T>),
};

/**
 * Helper function for caseOf. If parameter f is a function, it calls f()
 * and returns it's value. Otherwise, it simply returns f.
 *
 * @param f function or value
 */
function executeIfFunction<T>(f: (T | Fn<T>)): T {
  if (f instanceof Function) {
    return f();
  }
  return f;
}

/**
 * Helper function for caseOf. Returns a function that expects to be called with a
 * cases object which returns another function. This 3nd function expects to be called
 * with a defaultCase parameter which will return the value (or function) of
 * the given key in the 1st function call, from the given parameter cases in the 2nd
 * function call, and finally if that value does not exist, will return the defaultCase
 * value given in the 3rd function call.
 *
 * @param key value to switch on
 */
function caseOrDefault<T>(key: string):
  (cases: Cases<T>) => (defaultCase: (T | Fn<T>)) => (T | Fn<T>) {
  return (cases: Cases<T>) => (defaultCase: (T | Fn<T>)) => cases.hasOwnProperty(key)
    ? cases[key]
    : defaultCase;
}

/**
 * This function is used for cases when you want to use a switch statement, but you
 * need it to return a value directly. This is useful for setting a const value or
 * defining switch logic directly in a paramter of a function call, inline JSX, etc...
 *
 * Example Usage:
 *  const organism = {
 *    species: 'hippo',
 *    ...
 *  };
 *  const organismKingdom = caseOf<string>(organism.species)({
 *    'frog': 'Animal',
 *    'hippo': 'Animal',
 *    'mushroom': 'Fungi',
 *    'single-cell': () => {
 *      if (organismHasNuclearEnvelop(organism)) {
 *        return 'Protists';
 *      }
 *      return 'Bacteria';
 *    },
 *  })('Unknown');
 *
 * // organismKingdom = 'Animal'
 *
 * Notes:
 *  1. The generic given to caseOf<generic> specifies the return value.
 *  2. As seen in the 'single-cell' case, if a function is provided it will
 *     be evaluated and the return value will be the result. This is important
 *     in situations where lazy evaluation is required, e.g. when a property
 *     should only be accessed on some object under that specific case.
 *
 * This function works by returning a function that returns another function
 * which is finally called with the default value which finally runs through the cases
 * and returns the corresponding value or default value given. (still with me?) To use this,
 * first call this function with a single parameter (the value you wish to switch on).
 * It returns another function that expects to be called with the Cases parameter (an
 * object that maps the string value 'key' to another value or function that computes
 * the return value for). It returns another function which is finally called with a
 * default value which will then run through the cases and return the value if it exists
 * or return the default value provided.
 *
 * @param key value to switch on
 */
export function caseOf<T>(key: string): (cases: Cases<T>) => (defaultCase: (T | Fn<T>)) => T {
  return (cases: Cases<T>) => (defaultCase: T | Fn<T>) =>
    executeIfFunction<T>(caseOrDefault<T>(key)(cases)(defaultCase));
}

/**
 * Removes duplicate items from an array
 * @param arr Array to remove duplicates
 * @param keyFn Optional function to map unique keys when performing deduplication on items
 */
export function dedupeArray<T>(arr: T[], keyFn?: (item: T) => string | number): T[] {
  return arr
    .map(item => ({
      key: keyFn ? keyFn(item) : item,
      val: item,
    }))
    .reduce((acc, { key, val }) => acc.set(key, val), OrderedMap<string | number | T, T>())
    .valueSeq().toArray();
}
