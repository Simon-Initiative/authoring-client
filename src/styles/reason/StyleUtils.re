[@bs.module "styles/jss"] external injectSheetRE:
  (Js.Dict.t(string), ReasonReact.reactClass) => ReasonReact.reactClass = "injectSheetRE";

let classNames = (names: list(string)) => {
  List.filter(name => name != "", names)
    |> List.fold_left((a, b) => a ++ " " ++ b, "");
};

let jssClass = (classes: Js.Dict.t(string), name: string) => {
  Option.valueOr(Js.Dict.get(classes, name), "")
};

let injectSheet = injectSheetRE;
