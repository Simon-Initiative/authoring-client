export interface Func<T> {
  ([...args]: any): T;
}

export function returnType<T>(func: Func<T>) {
  return null as T;
}

export type Nothing = '$Nothing$';
export const Nothing : Nothing = '$Nothing$';
export type Maybe<T> = T | Nothing;

