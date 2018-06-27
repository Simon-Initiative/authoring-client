[@bs.module "styles/jss"] external classNames: list(string) => string = "classNames";
[@bs.module "styles/jss"] external injectSheetRE:
  (Js.Dict.t(string), ReasonReact.reactClass) => ReasonReact.reactClass = "injectSheetRE";
[@bs.module "./NumericMatchOptions.style"] external styles: Js.Dict.t(string) = "styles";

let componentName = "NumericMatchOptions";

/** useful for creating strings */
let str = ReasonReact.stringToElement;

/** create stateless component */
let component = ReasonReact.statelessComponent(componentName);

let make = (
  ~className: string,
  ~classes: Js.Dict.t(string),
  children
) => {
  ...component,
  render: _self => {
    let componentClass =
      switch (Js.Dict.get(classes, componentName)) {
        | Some(cn) => cn
        | None => ""
      };

    <div className={classNames([componentName, componentClass, className])}>
      children
    </div>
  }
};

let jsComponentUnstyled =
  ReasonReact.wrapReasonForJs(
    ~component,
    (jsProps) => make(
      ~className=jsProps##className,
      ~classes=jsProps##classes,
      jsProps##children
    )
  );

let jsComponent =  injectSheetRE(styles, jsComponentUnstyled);
