export function pipe(...args) {
  return input => args.reduce((acc, f) => f(acc), input);
}
