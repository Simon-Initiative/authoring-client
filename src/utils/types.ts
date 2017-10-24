export interface Func<T> {
  ([...args]: any): T;
}

export function returnType<T>(func: Func<T>) {
  return null as T;
}

// Do not continue to use these, instead use Maybe from the 'tsmonad' lib
export type Nothing = '$Nothing$';
export const Nothing : Nothing = '$Nothing$';
export type Maybe<T> = T | Nothing;

