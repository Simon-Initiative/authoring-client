let rec findIndex = (~start=0, str: string, cb: char => bool) =>
  if (start >= String.length(str)) {
    None;
        /* we've gone passed the end of the string, index not found */
  } else if (cb(str.[start])) {
    /* predicate satified, return index of the current char */
    Some(start);
  } else {
    /* recursivly call findIndex on the next char in the string */
    findIndex(
      str,
      cb,
      ~start=start + 1,
    );
  };

let toList = (str: string) => {
  let charList = ref([]);
  String.iter(c => charList := List.append(charList^, [c]), str);

  charList^;
};

let fromList = (charList: list(char)) =>
  List.fold_left((acc, c) => acc ++ Char.escaped(c), "", charList);

let remove = (str: string, index: int, count: int) => {
  let i = ref(0);
  let newList =
    List.filter(
      _ =>
        if (i^ >= index && i^ < index + count) {
          i := i^ + 1;
          false;
        } else {
          i := i^ + 1;
          true;
        },
      toList(str),
    );

  fromList(newList);
};

let removeAll = (str: string, find: char) => {
  let newList = List.filter(c => c !== find, toList(str));

  fromList(newList);
};

let substr = (str: string, start: int, count: int) => {
  let i = ref(0);
  let newList =
    List.filter(
      _c =>
        if (i^ >= start && i^ < start + count) {
          i := i^ + 1;
          true;
        } else {
          i := i^ + 1;
          false;
        },
      toList(str),
    );

  fromList(newList);
};