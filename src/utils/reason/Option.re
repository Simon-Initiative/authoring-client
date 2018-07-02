let valueOr = (opt: option('a), default: 'a) => {
  switch opt {
    | Some(value) => value
    | None => default
  }
};

let valueOrCompute = (opt: option('a), fn) => {
  switch opt {
    | Some(value) => value
    | None => fn()
  }
};

let lift = (opt: option('a), fn) => {
  switch opt {
    | Some(value) => fn(value)
    | None => opt
  }
};
