[@bs.module "./NumericMatchOptions.style"] external styles: Js.Dict.t(string) = "styles";

open ReactUtils;
open StyleUtils;

type conditionType =
  | Value
  | Range
  | Unknown;

type inequalityOperator =
  | EQ
  | NE
  | GT
  | LT
  | GTE
  | LTE
  | Unknown;

/* checks if the char ascii code is within the numeric range */
let isNumeric = (char: char) => Char.code(char) >= 48 && Char.code(char) <= 57;

let isInequalityOp = (char: char) =>
  char === '='
  || char === '<'
  || char === '>'
  || char === '!';

let getInequalityOperator = (expression: string) => {
  let operatorIndex = StringUtils.findIndex(expression, c => isInequalityOp(c));

  switch (operatorIndex) {
    | Some(index) => switch (String.get(expression, index)) {
        | '=' => EQ
        | '!' => switch (String.get(expression, index + 1)) {
          | '=' => NE
          | exception Not_found => Unknown
          | _ => Unknown
        };
        | '>' => switch (String.get(expression, index + 1)) {
            | '=' => GTE
            | exception Not_found => GT
            | _ => Unknown
          };
        | '<' => switch (String.get(expression, index + 1)) {
          | '=' => LTE
          | exception Not_found => LT
          | _ => Unknown
        };
        | _ => Unknown
      };
    | None => Unknown
  };
};

let isPrecision = (matchPattern: string) => {
  switch (StringUtils.findIndex(matchPattern, c => c === '#')) {
    | Some(_) => true
    | None => false
  };
};

let isRange = (matchPattern: string) => {
  if (String.length(matchPattern) > 0) {
    let first = String.get(matchPattern, 0);
    let last = String.get(matchPattern, String.length(matchPattern) - 1);

    (first === '[' || first === '(') && (last === ']' || last === ')');
  }
  else {
    false
  }
};

let getConditionTypeFromMatch = (matchPattern: string) => {
  switch (isRange(matchPattern)) {
    | true => Range
    | false => Value
  };
};

let onTogglePrecision = (matchPattern: string, responseId: string, onEditMatch: (. string, string) => unit) => {
  let newMatchPattern = isPrecision(matchPattern)
    ? StringUtils.remove(matchPattern, String.index(matchPattern, '#'), String.length(matchPattern) - String.index(matchPattern, '#'))
    : matchPattern ++ "#1";

  onEditMatch(. responseId, newMatchPattern);
};

let renderConditionSelect = () => {
  <select className={classNames(["form-control-sm", "custom-select",
      "mb-2", "mr-sm-2", "mb-sm-0", "condition"])}>
    <option value="eq">{strEl("Equal to")}</option>
    <option value="ne">{strEl("Not Equal to")}</option>
    <option value="gt">{strEl("Greater than")}</option>
    <option value="lt">{strEl("Less than")}</option>
    <option value="gte">{strEl("Greater than Equal to")}</option>
    <option value="lte">{strEl("Less than Equal to")}</option>
  </select>
};

let renderValue = (jssClass, editMode, matchPattern, responseId, onEditMatch) => {
  let matchStr = Option.valueOr(matchPattern, "");
  /* let hashIndex = Option.valueOr(StringUtils.findIndex(matchStr, c => c === '#'), 0);
  let value = StringUtils.substr(matchStr, 0, hashIndex);
  let precisionValue = StringUtils.substr(matchStr, hashIndex + 1, String.length(matchStr) - hashIndex + 1); */

  let hashIndex = StringUtils.findIndex(matchStr, c => c === '#');
  let value = switch (hashIndex) {
    | Some(hashIndex) => StringUtils.substr(matchStr, 0, hashIndex)
    | None => matchStr
  };
  let precisionValue = switch (hashIndex) {
    | Some(hashIndex) => StringUtils.substr(matchStr, hashIndex + 1, String.length(matchStr) - hashIndex + 1)
    | None => ""
  };

  <div className={jssClass("optionItem")}>
    <div className={jssClass("condition")}>
      {renderConditionSelect()}
    </div>
    <div className={jssClass("value")}>
      <input
        _type="number"
        className="form-control input-sm form-control-sm"
        disabled={Js.Boolean.to_js_boolean(!editMode)}
        value=value
        onChange={event => {
          let value = ReactDOMRe.domElementToObj(ReactEventRe.Form.target(event))##value;
          onEditMatch(. responseId, value ++ "#" ++ precisionValue);
        }} />
    </div>
  </div>
};

let renderPrecision = (jssClass, editMode, matchPattern, responseId, onEditMatch) => {
  let matchStr = Option.valueOr(matchPattern, "");
  let hashIndex = StringUtils.findIndex(matchStr, c => c === '#');
  let value = switch (hashIndex) {
    | Some(hashIndex) => StringUtils.substr(matchStr, 0, hashIndex)
    | None => matchStr
  };
  let precisionValue = switch (hashIndex) {
    | Some(hashIndex) => StringUtils.substr(matchStr, hashIndex + 1, String.length(matchStr) - hashIndex + 1)
    | None => ""
  };

  <div className={classNames([jssClass("optionsRow"), jssClass("precision")])}>
    <ToggleSwitch
      className={classNames([jssClass("precisionToggle")])}
      label="Precision"
      checked=isPrecision(matchStr)
      onClick={_ => onTogglePrecision(matchStr, responseId, onEditMatch)} />
    <input
      _type="number"
      className={classNames([jssClass("precisionValue"), "form-control input-sm form-control-sm"])}
      disabled={Js.Boolean.to_js_boolean(!editMode) || !isPrecision(matchStr)}
      value=precisionValue
      onChange={event => {
        let newPrecisionValue = ReactDOMRe.domElementToObj(ReactEventRe.Form.target(event))##value;
        onEditMatch(. responseId, value ++ "#" ++ newPrecisionValue);
      }} />
    <div className={classNames([jssClass("precisionLabel"), switch {hashIndex} {
      | Some(_) => ""
      | None => jssClass("precisionLabelDisabled")
    }])}>
      {strEl("Decimals")}
    </div>
    <div className={classNames([jssClass("precisionSpacer")])} />
  </div>
};

let renderRange = (jssClass) => {
  <div className={jssClass("optionItem")}>
  </div>
};

let renderUnknown = (jssClass) => {
  <div className={jssClass("optionItem")}>
  </div>
};

let componentName = "NumericMatchOptions";
let component = ReasonReact.statelessComponent(componentName);

let make = (
  ~classes: Js.Dict.t(string),
  ~className: option(string),
  ~editMode: bool,
  ~responseId: string,
  ~matchPattern: option(string),
  ~onEditMatch: (. string, string) => unit
) => {
  ...component,
  render: _self => {
    let jssClass = jssClass(classes);

    <div className={classNames([
      componentName,
      jssClass(componentName),
      Option.valueOr(className, "")
    ])}>
      <div className={jssClass("optionsRow")}>
        <div className={jssClass("conditionType")}>
          <select className="form-control-sm custom-select mb-2 mr-sm-2 mb-sm-0">
            <option value="value">{strEl("Value")}</option>
            <option value="range">{strEl("Range")}</option>
          </select>
        </div>
        {
          switch (getConditionTypeFromMatch(Option.valueOr(matchPattern, ""))) {
            | Value => renderValue(jssClass, editMode, matchPattern, responseId, onEditMatch)
            | Range => renderRange(jssClass)
            | Unknown => renderUnknown(jssClass)
          };
        }
        </div>
      {
        switch (getConditionTypeFromMatch(Option.valueOr(matchPattern, ""))) {
          | Value => renderPrecision(jssClass, editMode, matchPattern, responseId, onEditMatch)
          | Range => <div />
          | Unknown => <div />
        };
      }
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
        ~matchPattern=Js.Nullable.toOption(jsProps##matchPattern),
        ~onEditMatch=jsProps##onEditMatch
      )
    }
  );

let jsComponent =  injectSheet(styles, jsComponentUnstyled);
