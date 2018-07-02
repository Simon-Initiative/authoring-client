[@bs.module "./NumericMatchOptions.style"] external styles: Js.Dict.t(string) = "styles";

open ReactUtils;
open StyleUtils;

let componentName = "NumericMatchOptions";

let component = ReasonReact.statelessComponent(componentName);

let make = (
  ~classes: Js.Dict.t(string),
  ~className: option(string),
  ~editMode: bool,
  ~responseId: string,
  ~match: string,
  ~onEditMatch: (string, string) => unit
) => {
  ...component,
  render: _self => {
    let jssClass = jssClass(classes);

    <div className={classNames([
      componentName,
      jssClass(componentName),
      Option.valueOr(className, "")
    ])}>
      <div className={jssClass("condition")}>
        <select className="form-control-sm custom-select mb-2 mr-sm-2 mb-sm-0">
          <option value="eq">{strEl("Equal to")}</option>
          <option value="ne">{strEl("Not Equal to")}</option>
          <option value="gt">{strEl("Greater than")}</option>
          <option value="lt">{strEl("Less than")}</option>
          <option value="gteq">{strEl("Greater than Equal to")}</option>
          <option value="lteq">{strEl("Less than Equal to")}</option>
          <option value="precision">{strEl("Precision")}</option>
          <option value="range">{strEl("Range")}</option>
        </select>
      </div>
      <div className={jssClass("value")}>
        <input
          className="form-control input-sm form-control-sm"
          disabled={Js.Boolean.to_js_boolean(!editMode)}
          value=match
          onChange={event => onEditMatch(
            responseId, ReactDOMRe.domElementToObj(ReactEventRe.Form.target(event))##value)} />
      </div>
    </div>
  }
};

let jsComponentUnstyled =
  ReasonReact.wrapReasonForJs(
    ~component,
    (jsProps) => {
      make(
        ~classes=jsProps##classes,
        ~className=Js.Nullable.toOption(jsProps##className),
        ~editMode=jsProps##editMode,
        ~responseId=jsProps##responseId,
        ~match=jsProps##match,
        ~onEditMatch=jsProps##onEditMatch
      )
    }
  );

let jsComponent =  injectSheet(styles, jsComponentUnstyled);
