export function pipe(...args) {
  return input => args.reduce((acc, f) => f(acc), input);
}

function executeIfFunction<T>(f: (T | Fn<T>)): T {
  if (f instanceof Function) {
    return f();
  }
  return f;
}

type Fn<T> = () => T;

type Cases<T> = {
  [key: string]: (T | Fn<T>),
};

function caseOrDefault<T>(key: string):
  (cases: Cases<T>) => (defaultCase: (T | Fn<T>)) => (T | Fn<T>) {
  return (cases: Cases<T>) => (defaultCase: (T | Fn<T>)) => cases.hasOwnProperty(key)
    ? cases[key]
    : defaultCase;
}

export function caseOf<T>(key: string): (cases: Cases<T>) => (defaultCase: (T | Fn<T>)) => T {
  return (cases: Cases<T>) => (defaultCase: T | Fn<T>) =>
    executeIfFunction<T>(caseOrDefault<T>(key)(cases)(defaultCase));
}
