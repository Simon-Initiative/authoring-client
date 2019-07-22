[@bs.module "./NumericMatchOptions.style"]
external styles : Js.Dict.t(string) = "styles";

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

let isInequalityOp = (c: char) =>
  switch (c) {
  | '=' => true
  | '<' => true
  | '>' => true
  | '!' => true
  | _ => false
  };

let isRangeOp = (c: char) =>
  switch (c) {
  | '(' => true
  | '[' => true
  | ')' => true
  | ']' => true
  | _ => false
  };

/* Valid input logic:

   1. If the input contains a variable reference, that is the only thing it can contain
   2. If there are no variable references, then the input has to be numeric only

   */

let isValidVariableRef = (s: string) =>
  switch (Js.String.match([%bs.re "/^@@[a-zA-Z0-9_]*@@$/g"], s)) {
  | Some(_) => true
  | None => false
  };

let isNumeric = (s: string) => ! Js.Float.isNaN(Js.Float.fromString(s));

let isValidInput = (s: string) =>
  switch (String.length(s) - 1) {
  | (-1) => false
  | n =>
    ! isInequalityOp(s.[n])
    && ! isRangeOp(s.[n])
    && (isValidVariableRef(s) || isNumeric(s))
  };

let getInequalityOperator = (matchPattern: string) => {
  let operatorIndex =
    StringUtils.findIndex(matchPattern, c => isInequalityOp(c));

  switch (operatorIndex) {
  | Some(index) =>
    switch (matchPattern.[index]) {
    | '=' => EQ
    | '!' =>
      if (String.length(matchPattern) > 1) {
        switch (matchPattern.[index + 1]) {
        | '=' => NE
        | exception Not_found => Unknown
        | _ => Unknown
        }
      }
      else
        Unknown
    | '>' =>
      if (String.length(matchPattern) > 1) {
        switch (matchPattern.[index + 1]) {
        | '=' => GTE
        | exception Not_found => GT
        | _ => GT
        }
      }
      else
        GT
    | '<' =>
      if (String.length(matchPattern) > 1) {
        switch (matchPattern.[index + 1]) {
        | '=' => LTE
        | exception Not_found => LT
        | _ => LT
        }
      }
      else
        LT
    | _ => Unknown
    }
  | None => EQ
  };
};

let isPrecision = (matchPattern: string) =>
  switch (StringUtils.findIndex(matchPattern, c => c === '#')) {
  | Some(_) => true
  | None => false
  };

let isRange = (matchPattern: string) =>
  if (String.length(matchPattern) > 0) {
    let first = matchPattern.[0];
    let last = matchPattern.[String.length(matchPattern) - 1];

    isRangeOp(first) && isRangeOp(last);
  } else {
    false;
  };

let getConditionFromMatch = (matchPattern: string) =>
  isRange(matchPattern) ? Range : getInequalityOperator(matchPattern);

let onTogglePrecision =
    (
      matchPattern: string,
      responseId: string,
      onEditMatch: (. string, string) => unit,
      updateState,
    ) => {
  let newMatchPattern =
    isPrecision(matchPattern) ?
      StringUtils.remove(
        matchPattern,
        String.index(matchPattern, '#'),
        String.length(matchPattern) - String.index(matchPattern, '#'),
      ) :
      matchPattern ++ "#";

  onEditMatch(. responseId, newMatchPattern);
  updateState(newMatchPattern);
};

let renderConditionSelect =
    (editMode, responseId, matchPattern, onEditMatch, updateState) => {

  <select
    className=(
      classNames([
        "form-control-sm",
        "custom-select",
        "mb-2",
        "mr-sm-2",
        "mb-sm-0",
        "condition",
      ])
    )
    disabled=(! editMode)
    value=(
      switch (getConditionFromMatch(matchPattern)) {
      | NE => "ne"
      | GT => "gt"
      | LT => "lt"
      | GTE => "gte"
      | LTE => "lte"
      | Range => "range"
      | EQ
      | Unknown => "eq"
      }
    )
    onChange=(
      event => {
        let value = ReactDOMRe.domElementToObj(
                      ReactEventRe.Form.target(event),
                    )##value;

        /* remove current operator(s) from matchPattern */
        let matchPattern =
          try (
            switch (matchPattern.[0]) {
            | c when isInequalityOp(c) =>
              StringUtils.substr(
                matchPattern,
                Option.valueOrThrow(
                  StringUtils.findIndex(matchPattern, c =>
                    ! isInequalityOp(c)
                  ),
                ),
                String.length(matchPattern),
              )
            | c when isRangeOp(c) =>
              StringUtils.substr(
                matchPattern,
                1,
                Option.valueOrThrow(
                  StringUtils.findIndex(matchPattern, c => c === ','),
                )
                - 1,
              )
            | _ => "0"
            }
          ) {
          | _ => "0"
          };

        let matchPattern =
          switch (value) {
          | "ne" => "!=" ++ matchPattern
          | "gt" => ">" ++ matchPattern
          | "lt" => "<" ++ matchPattern
          | "gte" => ">=" ++ matchPattern
          | "lte" => "<=" ++ matchPattern
          | "range" => "[" ++ matchPattern ++ "," ++ matchPattern ++ "]"
          | "eq"
          | _ => "=" ++ matchPattern
          };

        onEditMatch(. responseId, matchPattern);
        updateState(matchPattern);
      }
    )>
    <option value="eq"> (strEl("Equal to")) </option>
    <option value="ne"> (strEl("Not Equal to")) </option>
    <option value="gt"> (strEl("Greater than")) </option>
    <option value="lt"> (strEl("Less than")) </option>
    <option value="gte"> (strEl("Greater than Equal to")) </option>
    <option value="lte"> (strEl("Less than Equal to")) </option>
    <option value="range"> (strEl("Range")) </option>
  </select>;
}

let renderValue =
    (jssClass, editMode, matchPattern, isValid, responseId, onEditMatch, updateState, setValid) => {
  /* separate matchPattern into value and precision parts */

  let hashIndex = StringUtils.findIndex(matchPattern, c => c === '#');

  let valueWithOp =
    switch (hashIndex) {
    | Some(hashIndex) => StringUtils.substr(matchPattern, 0, hashIndex)
    | None => matchPattern
    };
  let precisionValue =
    switch (hashIndex) {
    | Some(hashIndex) =>
      StringUtils.substr(
        matchPattern,
        hashIndex + 1,
        String.length(matchPattern) - hashIndex + 1,
      )
    | None => ""
    };

  /* separate operator and value */
  let operator =
    StringUtils.substr(
      valueWithOp,
      0,
      Option.valueOr(
        StringUtils.findIndex(matchPattern, c => ! isInequalityOp(c)),
        0,
      ),
    );
  let value =
    StringUtils.substr(
      valueWithOp,
      Option.valueOr(
        StringUtils.findIndex(matchPattern, c => ! isInequalityOp(c)),
        0,
      ),
      String.length(matchPattern),
    );

  let inputClasses =
    "form-control input-sm form-control-sm "
    ++ (
      if (!isValid) {
        "is-invalid";
      } else {
        "";
      }
    );

  <div className=(jssClass("optionItem"))>
    <div className=(jssClass("value"))>
      <input
        className=inputClasses
        disabled=(! editMode)
        value
        onChange=(
          event => {
            let value = ReactDOMRe.domElementToObj(
                          ReactEventRe.Form.target(event),
                        )##value;

            let matchValue =
              operator
              ++ value
              ++ (precisionValue !== "" ? "#" ++ precisionValue : "");

            if (isValidInput(value)) {
              onEditMatch(. responseId, matchValue);
              setValid(true);
            } else {
              setValid(false);
            }

            updateState(matchValue);
          }
        )
      />
    </div>
  </div>;
};

let renderPrecision =
    (jssClass, editMode, matchPattern, isValid, responseId, onEditMatch, updateState, setValid) => {

  let hashIndex = StringUtils.findIndex(matchPattern, c => c === '#');
  let value =
    switch (hashIndex) {
    | Some(hashIndex) => StringUtils.substr(matchPattern, 0, hashIndex)
    | None => matchPattern
    };
  let precisionValue =
    switch (hashIndex) {
    | Some(hashIndex) =>
      StringUtils.substr(
        matchPattern,
        hashIndex + 1,
        String.length(matchPattern) - hashIndex + 1,
      )
    | None => ""
    };

  let inputClasses =
    "form-control input-sm form-control-sm "
    ++ (
      if (!isValid) {
        "is-invalid";
      } else {
        "";
      }
    );


  <div
    className=(classNames([jssClass("optionsRow"), jssClass("precision")]))>
    <ToggleSwitch
      className=(classNames([jssClass("precisionToggle")]))
      editMode
      label="Precision"
      checked=(isPrecision(matchPattern))
      onClick=(_ => onTogglePrecision(matchPattern, responseId, onEditMatch, updateState))
    />
    <input
      _type="number"
      className=(
        classNames([
          jssClass("precisionValue"),
          inputClasses,
        ])
      )
      disabled=(! editMode || ! isPrecision(matchPattern))
      value=precisionValue
      onChange=(
        event => {
          let newPrecisionValue = ReactDOMRe.domElementToObj(
                                    ReactEventRe.Form.target(event),
                                  )##value;

          let matchValue = value ++ "#" ++ newPrecisionValue;

          if (newPrecisionValue > 0) {
            onEditMatch(. responseId, matchValue);
            setValid(true);
          } else {
            setValid(false);
          }

          updateState(matchValue);
        }
      )
    />
    <div
      className=(
        classNames([
          jssClass("precisionLabel"),
          switch (hashIndex) {
          | Some(_) => ""
          | None => jssClass("precisionLabelDisabled")
          },
        ])
      )>
      (strEl("Decimals"))
    </div>
    <div className=(classNames([jssClass("precisionSpacer")])) />
  </div>;
};

let renderRangeInstructions = jssClass =>
  <div
    className=(classNames([jssClass("optionsRow"), jssClass("rangeInstr")]))>
    (strEl("Range includes lower and upper bounds"))
    <div className=(classNames([jssClass("precisionSpacer")])) />
  </div>;

let renderRange =
    (jssClass, editMode, matchPattern, isValid1, isValid2, responseId, onEditMatch, updateState, setValid1, setValid2) => {

  let rangeStart =
    try (
      StringUtils.substr(
        matchPattern,
        1,
        Option.valueOrThrow(
          StringUtils.findIndex(matchPattern, c => c === ','),
        )
        - 1,
      )
    ) {
    | Not_found => "0"
    };

  let rangeEnd =
    try (
      StringUtils.substr(
        matchPattern,
        Option.valueOrThrow(
          StringUtils.findIndex(matchPattern, c => c === ','),
        )
        + 1,
        String.length(matchPattern)
        - Option.valueOrThrow(
            StringUtils.findIndex(matchPattern, c => c === ','),
          )
        - 2,
      )
    ) {
    | Not_found => "0"
    };

  let inputClass1 =
     (
      if (!isValid1) {
        "is-invalid";
      } else {
        "";
      }
    );
    let inputClass2 =
    (
     if (!isValid2) {
       "is-invalid";
     } else {
       "";
     }
   );


  <div className=(jssClass("optionItem"))>
    <div className=(jssClass("range"))>
      <div className=(jssClass("rangeLabel"))> (strEl("from")) </div>
      <input
        className=(
          classNames([
            jssClass("rangeInput"),
            "form-control",
            "input-sm",
            "form-control-sm",
            inputClass1,
          ])
        )
        disabled=(! editMode)
        value=rangeStart
        onChange=(
          event => {
            let value = ReactDOMRe.domElementToObj(
                          ReactEventRe.Form.target(event),
                        )##value;

            let matchValue = "[" ++ value ++ "," ++ rangeEnd ++ "]";

            if (isValidInput(value)) {
              onEditMatch(. responseId, matchValue);
              setValid1(true);
            } else {
              setValid1(false);
            };

            updateState(matchValue);
          }
        )
      />
      <div className=(jssClass("rangeLabel"))> (strEl("to")) </div>
      <input
        className=(
          classNames([
            jssClass("rangeInput"),
            "form-control",
            "input-sm",
            "form-control-sm",
            inputClass2,
          ])
        )
        disabled=(! editMode)
        value=rangeEnd
        onChange=(
          event => {
            let value = ReactDOMRe.domElementToObj(
                          ReactEventRe.Form.target(event),
                        )##value;

            let matchValue = "[" ++ rangeStart ++ "," ++ value ++ "]";

            if (isValidInput(value)) {
              onEditMatch(. responseId, matchValue);
              setValid2(true);
            } else {
              setValid2(false);
            }

            updateState(matchValue);
          }
        )
      />
    </div>
  </div>;
};

let renderUnknown = jssClass =>
  <div className=(jssClass("optionItem"))>
    <div className="alert alert-danger" role="alert">
      (
        strEl(
          "Could not determine matching condition. Please check the original XML.",
        )
      )
    </div>
  </div>;

let componentName = "NumericMatchOptions";

type state = {
  input: bool,
  range1: bool,
  range2: bool,
  precision: bool,
  matchPattern: option(string),
};

/* Action declaration */
type action =
  | EditMatch(string)
  | SetInput(bool)
  | SetRange1(bool)
  | SetRange2(bool)
  | SetPrecision(bool);

let component = ReasonReact.reducerComponent(componentName);

let make =
    (
      ~classes: Js.Dict.t(string),
      ~className: option(string),
      ~editMode: bool,
      ~responseId: string,
      ~matchPattern: option(string),
      ~onEditMatch: (. string, string) => unit,
    ) => {
  ...component,
  initialState: () => (
    {input: true, range1: true, range2: true, precision: true, matchPattern}: state
  ),
  reducer: (action, current) =>
    switch (action) {
    | EditMatch(s) => ReasonReact.Update({...current, matchPattern: Some(s)})
    | SetInput(v) => ReasonReact.Update({...current, input: v})
    | SetRange1(v) => ReasonReact.Update({...current, range1: v})
    | SetRange2(v) => ReasonReact.Update({...current, range2: v})
    | SetPrecision(v) => ReasonReact.Update({...current, precision: v})
    },
  render: self => {
    let state = self.state;
    let jssClass = jssClass(classes);

    let updateState = s => self.send(EditMatch(s));
    let setValidValue = v => self.send(SetInput(v));
    let setValidRange1 = v => self.send(SetRange1(v));
    let setValidRange2 = v => self.send(SetRange2(v));
    let setValidPrecision = v => self.send(SetPrecision(v));

    <div
      className=(
        classNames([
          componentName,
          jssClass(componentName),
          Option.valueOr(className, ""),
        ])
      )>
      (
        switch (getConditionFromMatch(Option.valueOr(state.matchPattern, ""))) {
        | EQ
        | NE
        | GT
        | LT
        | GTE
        | LTE =>
          <div>
            <div className=(jssClass("optionsRow"))>
              <div className=(jssClass("condition"))>
                (
                  renderConditionSelect(
                    editMode,
                    responseId,
                    Option.valueOr(state.matchPattern, ""),
                    onEditMatch,
                    updateState,
                  )
                )
              </div>
              (
                renderValue(
                  jssClass,
                  editMode,
                  Option.valueOr(state.matchPattern, ""),
                  state.input,
                  responseId,
                  onEditMatch,
                  updateState,
                  setValidValue,
                )
              )
            </div>
            (
              renderPrecision(
                jssClass,
                editMode,
                Option.valueOr(state.matchPattern, ""),
                state.precision,
                responseId,
                onEditMatch,
                updateState,
                setValidPrecision,
              )
            )
          </div>
        | Range =>
          <div>
            <div className=(jssClass("optionsRow"))>
              <div className=(jssClass("condition"))>
                (
                  renderConditionSelect(
                    editMode,
                    responseId,
                    Option.valueOr(state.matchPattern, ""),
                    onEditMatch,
                    updateState,
                  )
                )
              </div>
              (
                renderRange(
                  jssClass,
                  editMode,
                  Option.valueOr(state.matchPattern, ""),
                  state.range1,
                  state.range2,
                  responseId,
                  onEditMatch,
                  updateState,
                  setValidRange1,
                  setValidRange2,
                )
              )
            </div>
            (renderRangeInstructions(jssClass))
          </div>
        | Unknown =>
          <div className=(jssClass("optionsRow"))>
            (renderUnknown(jssClass))
          </div>
        }
      )
    </div>;
  },
};

let jsComponentUnstyled =
  ReasonReact.wrapReasonForJs(~component, jsProps =>
    make(
      ~classes=jsProps##classes,
      ~className=Js.Nullable.toOption(jsProps##className),
      ~editMode=jsProps##editMode,
      ~responseId=jsProps##responseId,
      ~matchPattern=Js.Nullable.toOption(jsProps##matchPattern),
      ~onEditMatch=jsProps##onEditMatch,
    )
  );

let jsComponent = injectSheet(styles, jsComponentUnstyled);