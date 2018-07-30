[@bs.module "./NumericMatchOptions.style"] external styles: Js.Dict.t(string) = "styles";

open ReactUtils;
open StyleUtils;

type inequalityOperator =
  | EQ
  | NE
  | GT
  | LT
  | GTE
  | LTE
  | Range
  | Unknown;

let isInequalityOp = (c: char) => switch (c) {
  | '=' => true
  | '<' => true
  | '>' => true
  | '!' => true
  | _ => false
};

let isRangeOp = (c: char) => switch (c) {
  | '(' => true
  | '[' => true
  | ')' => true
  | ']' => true
  | _ => false
};

let getInequalityOperator = (matchPattern: string) => {
  let operatorIndex = StringUtils.findIndex(matchPattern, c => isInequalityOp(c));

  switch (operatorIndex) {
    | Some(index) => switch (String.get(matchPattern, index)) {
        | '=' => EQ
        | '!' => switch (String.get(matchPattern, index + 1)) {
          | '=' => NE
          | exception Not_found => Unknown
          | _ => Unknown
        };
        | '>' => switch (String.get(matchPattern, index + 1)) {
            | '=' => GTE
            | exception Not_found => GT
            | _ => GT
          };
        | '<' => switch (String.get(matchPattern, index + 1)) {
          | '=' => LTE
          | exception Not_found => LT
          | _ => LT
        };
        | _ => Unknown
      };
    | None => EQ
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

    isRangeOp(first) && isRangeOp(last);
  }
  else {
    false
  }
};

let getConditionFromMatch = (matchPattern: string) => {
  switch (isRange(matchPattern)) {
    | true => Range
    | false => getInequalityOperator(matchPattern)
  };
};

let onTogglePrecision = (matchPattern: string, responseId: string, onEditMatch: (. string, string) => unit) => {
  let newMatchPattern = isPrecision(matchPattern)
    ? StringUtils.remove(matchPattern, String.index(matchPattern, '#'), String.length(matchPattern) - String.index(matchPattern, '#'))
    : matchPattern ++ "#";

  onEditMatch(. responseId, newMatchPattern);
};

let renderConditionSelect = (editMode, responseId, matchPattern, onEditMatch) => {
  <select className={classNames(["form-control-sm", "custom-select",
      "mb-2", "mr-sm-2", "mb-sm-0", "condition"])}
      disabled={!editMode}
      value={switch (getConditionFromMatch(matchPattern)) {
        | NE => "ne"
        | GT => "gt"
        | LT => "lt"
        | GTE => "gte"
        | LTE => "lte"
        | Range => "range"
        | (EQ | Unknown) => "eq"
      }}
      onChange={event => {
        let value = ReactDOMRe.domElementToObj(ReactEventRe.Form.target(event))##value;

        /* remove current operator(s) from matchPattern */
        let matchPattern = try(
          switch (String.get(matchPattern, 0)) {
            | c when isInequalityOp(c) =>
              StringUtils.substr(
                matchPattern,
                Option.valueOrThrow(StringUtils.findIndex(matchPattern, c => !isInequalityOp(c))),
                String.length(matchPattern)
              )
            | c when isRangeOp(c) =>
              StringUtils.substr(
                matchPattern,
                1,
                Option.valueOrThrow(StringUtils.findIndex(matchPattern, c => c === ',')) - 1
              )
            | _ => "0"
          }
        ) {
          | _ => "0"
        };

        let matchPattern = switch (value) {
          | "ne" => "!=" ++ matchPattern
          | "gt" => ">" ++ matchPattern
          | "lt" => "<" ++ matchPattern
          | "gte" => ">=" ++ matchPattern
          | "lte" => "<=" ++ matchPattern
          | "range" => "[" ++ matchPattern ++ "," ++ matchPattern ++ "]"
          | ("eq" | _) => "=" ++ matchPattern
        };

        onEditMatch(. responseId, matchPattern);
      }}>
    <option value="eq">{strEl("Equal to")}</option>
    <option value="ne">{strEl("Not Equal to")}</option>
    <option value="gt">{strEl("Greater than")}</option>
    <option value="lt">{strEl("Less than")}</option>
    <option value="gte">{strEl("Greater than Equal to")}</option>
    <option value="lte">{strEl("Less than Equal to")}</option>
    <option value="range">{strEl("Range")}</option>
  </select>
};

let renderValue = (jssClass, editMode, matchPattern, responseId, onEditMatch) => {

  /* separate matchPattern into value and precision parts */
  let hashIndex = StringUtils.findIndex(matchPattern, c => c === '#');
  let valueWithOp = switch (hashIndex) {
    | Some(hashIndex) => StringUtils.substr(matchPattern, 0, hashIndex)
    | None => matchPattern
  };
  let precisionValue = switch (hashIndex) {
    | Some(hashIndex) => StringUtils.substr(matchPattern, hashIndex + 1, String.length(matchPattern) - hashIndex + 1)
    | None => ""
  };

  /* separate operator and value */
  let operator = StringUtils.substr(
    valueWithOp,
    0,
    Option.valueOr(StringUtils.findIndex(matchPattern, c => !isInequalityOp(c)), 0),
  );
  let value = StringUtils.substr(
    valueWithOp,
    Option.valueOr(StringUtils.findIndex(matchPattern, c => !isInequalityOp(c)), 0),
    String.length(matchPattern)
  );

  <div className={jssClass("optionItem")}>
    <div className={jssClass("value")}>
      <input
        className="form-control input-sm form-control-sm"
        disabled={!editMode}
        value
        onChange={event => {
          let value = ReactDOMRe.domElementToObj(ReactEventRe.Form.target(event))##value;
          onEditMatch(. responseId, operator ++ value ++ (precisionValue !== "" ? "#" ++ precisionValue : ""));
        }} />
    </div>
  </div>
};

let renderPrecision = (jssClass, editMode, matchPattern, responseId, onEditMatch) => {
  let hashIndex = StringUtils.findIndex(matchPattern, c => c === '#');
  let value = switch (hashIndex) {
    | Some(hashIndex) => StringUtils.substr(matchPattern, 0, hashIndex)
    | None => matchPattern
  };
  let precisionValue = switch (hashIndex) {
    | Some(hashIndex) => StringUtils.substr(matchPattern, hashIndex + 1, String.length(matchPattern) - hashIndex + 1)
    | None => ""
  };

  <div className={classNames([jssClass("optionsRow"), jssClass("precision")])}>
    <ToggleSwitch
      className={classNames([jssClass("precisionToggle")])}
      editMode
      label="Precision"
      checked=isPrecision(matchPattern)
      onClick={_ => onTogglePrecision(matchPattern, responseId, onEditMatch)} />
    <input
      _type="number"
      className={classNames([jssClass("precisionValue"), "form-control input-sm form-control-sm"])}
      disabled={!editMode || !isPrecision(matchPattern)}
      value=precisionValue
      onChange={event => {
        let newPrecisionValue = ReactDOMRe.domElementToObj(ReactEventRe.Form.target(event))##value;
        onEditMatch(. responseId, value ++ "#" ++ newPrecisionValue);
      }} />
    <div className={classNames([
      jssClass("precisionLabel"),
      switch {hashIndex} {
        | Some(_) => ""
        | None => jssClass("precisionLabelDisabled")
      }])}>
      {strEl("Decimals")}
    </div>
    <div className={classNames([jssClass("precisionSpacer")])} />
  </div>
};

let renderRangeInstructions = (jssClass) => {
  <div className={classNames([jssClass("optionsRow"), jssClass("rangeInstr")])}>
    {strEl("Range includes lower and upper bounds")}
    <div className={classNames([jssClass("precisionSpacer")])} />
  </div>
};

let renderRange = (jssClass, editMode, matchPattern, responseId, onEditMatch) => {
  let rangeStart = try (StringUtils.substr(
    matchPattern,
    1,
    Option.valueOrThrow(StringUtils.findIndex(matchPattern, c => c === ',')) - 1,
  )) {
    | Not_found => "0"
  };

  let rangeEnd = try (StringUtils.substr(
    matchPattern,
    Option.valueOrThrow(StringUtils.findIndex(matchPattern, c => c === ',')) + 1,
    String.length(matchPattern) - Option.valueOrThrow(StringUtils.findIndex(matchPattern, c => c === ',')) - 2,
  )) {
    | Not_found => "0"
  };

  <div className={jssClass("optionItem")}>
    <div className={jssClass("range")}>
      <div className={jssClass("rangeLabel")}>{strEl("from")}</div>
      <input
        className={classNames([jssClass("rangeInput"), "form-control", "input-sm", "form-control-sm"])}
        disabled={!editMode}
        value=rangeStart
        onChange={event => {
          let value = ReactDOMRe.domElementToObj(ReactEventRe.Form.target(event))##value;
          onEditMatch(. responseId, "[" ++ value ++ "," ++ rangeEnd ++ "]");
        }} />
      <div className={jssClass("rangeLabel")}>{strEl("to")}</div>
      <input
        className={classNames([jssClass("rangeInput"), "form-control", "input-sm", "form-control-sm"])}
        disabled={!editMode}
        value=rangeEnd
        onChange={event => {
          let value = ReactDOMRe.domElementToObj(ReactEventRe.Form.target(event))##value;
          onEditMatch(. responseId, "[" ++ rangeStart ++ "," ++ value ++ "]");
        }} />
    </div>
  </div>
};

let renderUnknown = (jssClass) => {
  <div className={jssClass("optionItem")}>
    <div className="alert alert-danger" role="alert">
      {strEl("Could not determine matching condition. Please check the original XML.")}
    </div>
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
      {
        switch (getConditionFromMatch(Option.valueOr(matchPattern, ""))) {
          | (EQ | NE | GT | LT | GTE | LTE) =>
            <div>
              <div className={jssClass("optionsRow")}>
                  <div className={jssClass("condition")}>
                    {renderConditionSelect(editMode, responseId, Option.valueOr(matchPattern, ""), onEditMatch)}
                  </div>
                  {renderValue(jssClass, editMode, Option.valueOr(matchPattern, ""), responseId, onEditMatch)}
              </div>
              {renderPrecision(jssClass, editMode, Option.valueOr(matchPattern, ""), responseId, onEditMatch)}
            </div>
          | Range =>
            <div>
              <div className={jssClass("optionsRow")}>
                <div className={jssClass("condition")}>
                  {renderConditionSelect(editMode, responseId, Option.valueOr(matchPattern, ""), onEditMatch)}
                </div>
                {renderRange(jssClass, editMode, Option.valueOr(matchPattern, ""), responseId, onEditMatch)}
              </div>
              {renderRangeInstructions(jssClass)}
            </div>
          | Unknown =>
            <div className={jssClass("optionsRow")}>
              {renderUnknown(jssClass)}
            </div>
        }
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
