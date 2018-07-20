let rec range = (start: int, end_: int) =>
  if (start > end_) {
    [];
  } else {
    [start, ...range(start + 1, end_)];
  };