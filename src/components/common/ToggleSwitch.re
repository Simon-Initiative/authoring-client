[@bs.module "./ToggleSwitch.tsx"] external toggleSwitch: ReasonReact.reactClass = "ToggleSwitch";

[@bs.deriving abstract]
type jsProps = {
  className: Js.nullable(string),
  editMode: Js.nullable(bool),
  style: Js.nullable(Js_json.t),
  checked: Js.nullable(bool),
  onClick: Js_json.t => unit,
  label: string,
};

let make = (
  ~editMode=?,
  ~className=?,
  ~style=?,
  ~checked=?,
  ~onClick,
  ~label,
  children
) => ReasonReact.wrapJsForReason(
  ~reactClass=toggleSwitch,
  ~props=jsProps(
    ~className=Js.Nullable.fromOption(className),
    ~editMode=Js.Nullable.fromOption(editMode),
    ~style=Js.Nullable.fromOption(style),
    ~checked=Js.Nullable.fromOption(checked),
    ~onClick,
    ~label,
  ),
  children,
);
