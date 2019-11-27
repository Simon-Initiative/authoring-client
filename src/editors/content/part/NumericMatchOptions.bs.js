// Generated by BUCKLESCRIPT, PLEASE EDIT WITH CARE
'use strict';

var Block = require("bs-platform/lib/js/block.js");
var Curry = require("bs-platform/lib/js/curry.js");
var React = require("react");
var $$String = require("bs-platform/lib/js/string.js");
var Caml_format = require("bs-platform/lib/js/caml_format.js");
var Caml_option = require("bs-platform/lib/js/caml_option.js");
var Caml_string = require("bs-platform/lib/js/caml_string.js");
var ReasonReact = require("reason-react/src/ReasonReact.js");
var Caml_js_exceptions = require("bs-platform/lib/js/caml_js_exceptions.js");
var Option$CourseEditor = require("../../../utils/reason/Option.bs.js");
var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions.js");
var ReactUtils$CourseEditor = require("../../../utils/reason/ReactUtils.bs.js");
var StyleUtils$CourseEditor = require("../../../styles/reason/StyleUtils.bs.js");
var StringUtils$CourseEditor = require("../../../utils/reason/StringUtils.bs.js");
var ToggleSwitch$CourseEditor = require("../../../components/common/ToggleSwitch.bs.js");
var NumericMatchOptionsStyle = require("./NumericMatchOptions.style");

var styles = NumericMatchOptionsStyle.styles;

function isInequalityOp(c) {
  if (c >= 60) {
    return c < 63;
  } else {
    return c === 33;
  }
}

function isRangeOp(c) {
  var switcher = c - 40 | 0;
  if (switcher > 51 || switcher < 0) {
    return switcher === 53;
  } else {
    return switcher > 50 || switcher < 2;
  }
}

function isValidVariableRef(s) {
  var match = s.match((/^@@[a-zA-Z0-9_]*@@$/g));
  return match !== null;
}

function isNumeric(s) {
  return !isNaN(Number(s));
}

function isValidInput(s) {
  var n = s.length - 1 | 0;
  if (n !== -1 && !isInequalityOp(Caml_string.get(s, n)) && !isRangeOp(Caml_string.get(s, n))) {
    if (isValidVariableRef(s)) {
      return true;
    } else {
      return !isNaN(Number(s));
    }
  } else {
    return false;
  }
}

function getInequalityOperator(matchPattern) {
  var operatorIndex = StringUtils$CourseEditor.findIndex(undefined, matchPattern, isInequalityOp);
  if (operatorIndex !== undefined) {
    var index = operatorIndex;
    var match = Caml_string.get(matchPattern, index);
    if (match >= 60) {
      if (match >= 63) {
        return /* Unknown */7;
      } else {
        switch (match - 60 | 0) {
          case 0 :
              if (matchPattern.length > 1) {
                var val;
                try {
                  val = Caml_string.get(matchPattern, index + 1 | 0);
                }
                catch (exn){
                  if (exn === Caml_builtin_exceptions.not_found) {
                    return /* LT */3;
                  } else {
                    throw exn;
                  }
                }
                if (val !== 61) {
                  return /* LT */3;
                } else {
                  return /* LTE */5;
                }
              } else {
                return /* LT */3;
              }
              break;
          case 1 :
              return /* EQ */0;
          case 2 :
              if (matchPattern.length > 1) {
                var val$1;
                try {
                  val$1 = Caml_string.get(matchPattern, index + 1 | 0);
                }
                catch (exn$1){
                  if (exn$1 === Caml_builtin_exceptions.not_found) {
                    return /* GT */2;
                  } else {
                    throw exn$1;
                  }
                }
                if (val$1 !== 61) {
                  return /* GT */2;
                } else {
                  return /* GTE */4;
                }
              } else {
                return /* GT */2;
              }
              break;
          
        }
      }
    } else if (match !== 33 || matchPattern.length <= 1) {
      return /* Unknown */7;
    } else {
      var val$2;
      try {
        val$2 = Caml_string.get(matchPattern, index + 1 | 0);
      }
      catch (exn$2){
        if (exn$2 === Caml_builtin_exceptions.not_found) {
          return /* Unknown */7;
        } else {
          throw exn$2;
        }
      }
      if (val$2 !== 61) {
        return /* Unknown */7;
      } else {
        return /* NE */1;
      }
    }
  } else {
    return /* EQ */0;
  }
}

function isPrecision(matchPattern) {
  return StringUtils$CourseEditor.findIndex(undefined, matchPattern, (function (c) {
                return c === /* "#" */35;
              })) !== undefined;
}

function isRange(matchPattern) {
  if (matchPattern.length !== 0) {
    var first = Caml_string.get(matchPattern, 0);
    var last = Caml_string.get(matchPattern, matchPattern.length - 1 | 0);
    if (isRangeOp(first)) {
      return isRangeOp(last);
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function getConditionFromMatch(matchPattern) {
  var match = isRange(matchPattern);
  if (match) {
    return /* Range */6;
  } else {
    return getInequalityOperator(matchPattern);
  }
}

function onTogglePrecision(matchPattern, responseId, onEditMatch, updateState) {
  var match = isPrecision(matchPattern);
  var newMatchPattern = match ? StringUtils$CourseEditor.remove(matchPattern, $$String.index(matchPattern, /* "#" */35), matchPattern.length - $$String.index(matchPattern, /* "#" */35) | 0) : matchPattern + "#";
  onEditMatch(responseId, newMatchPattern);
  return Curry._1(updateState, newMatchPattern);
}

function renderConditionSelect(editMode, responseId, matchPattern, onEditMatch, updateState) {
  var match = getConditionFromMatch(matchPattern);
  var tmp;
  switch (match) {
    case /* NE */1 :
        tmp = "ne";
        break;
    case /* GT */2 :
        tmp = "gt";
        break;
    case /* LT */3 :
        tmp = "lt";
        break;
    case /* GTE */4 :
        tmp = "gte";
        break;
    case /* LTE */5 :
        tmp = "lte";
        break;
    case /* Range */6 :
        tmp = "range";
        break;
    case /* EQ */0 :
    case /* Unknown */7 :
        tmp = "eq";
        break;
    
  }
  return React.createElement("select", {
              className: StyleUtils$CourseEditor.classNames(/* :: */[
                    "form-control-sm",
                    /* :: */[
                      "custom-select",
                      /* :: */[
                        "mb-2",
                        /* :: */[
                          "mr-sm-2",
                          /* :: */[
                            "mb-sm-0",
                            /* :: */[
                              "condition",
                              /* [] */0
                            ]
                          ]
                        ]
                      ]
                    ]
                  ]),
              disabled: !editMode,
              value: tmp,
              onChange: (function ($$event) {
                  var value = $$event.target.value;
                  var matchPattern$1;
                  try {
                    var c = Caml_string.get(matchPattern, 0);
                    matchPattern$1 = isInequalityOp(c) ? StringUtils$CourseEditor.substr(matchPattern, Option$CourseEditor.valueOrThrow(StringUtils$CourseEditor.findIndex(undefined, matchPattern, (function (c) {
                                      return !isInequalityOp(c);
                                    }))), matchPattern.length) : (
                        isRangeOp(c) ? StringUtils$CourseEditor.substr(matchPattern, 1, Option$CourseEditor.valueOrThrow(StringUtils$CourseEditor.findIndex(undefined, matchPattern, (function (c) {
                                          return c === /* "," */44;
                                        }))) - 1 | 0) : "0"
                      );
                  }
                  catch (exn){
                    matchPattern$1 = "0";
                  }
                  var matchPattern$2;
                  switch (value) {
                    case "eq" :
                        matchPattern$2 = "=" + matchPattern$1;
                        break;
                    case "gt" :
                        matchPattern$2 = ">" + matchPattern$1;
                        break;
                    case "gte" :
                        matchPattern$2 = ">=" + matchPattern$1;
                        break;
                    case "lt" :
                        matchPattern$2 = "<" + matchPattern$1;
                        break;
                    case "lte" :
                        matchPattern$2 = "<=" + matchPattern$1;
                        break;
                    case "ne" :
                        matchPattern$2 = "!=" + matchPattern$1;
                        break;
                    case "range" :
                        matchPattern$2 = "[" + (matchPattern$1 + ("," + (matchPattern$1 + "]")));
                        break;
                    default:
                      matchPattern$2 = "=" + matchPattern$1;
                  }
                  onEditMatch(responseId, matchPattern$2);
                  return Curry._1(updateState, matchPattern$2);
                })
            }, React.createElement("option", {
                  value: "eq"
                }, ReactUtils$CourseEditor.strEl("Equal to")), React.createElement("option", {
                  value: "ne"
                }, ReactUtils$CourseEditor.strEl("Not Equal to")), React.createElement("option", {
                  value: "gt"
                }, ReactUtils$CourseEditor.strEl("Greater than")), React.createElement("option", {
                  value: "lt"
                }, ReactUtils$CourseEditor.strEl("Less than")), React.createElement("option", {
                  value: "gte"
                }, ReactUtils$CourseEditor.strEl("Greater than Equal to")), React.createElement("option", {
                  value: "lte"
                }, ReactUtils$CourseEditor.strEl("Less than Equal to")), React.createElement("option", {
                  value: "range"
                }, ReactUtils$CourseEditor.strEl("Range")));
}

function renderValue(jssClass, editMode, matchPattern, isValid, responseId, onEditMatch, updateState, setValid) {
  var hashIndex = StringUtils$CourseEditor.findIndex(undefined, matchPattern, (function (c) {
          return c === /* "#" */35;
        }));
  var valueWithOp = hashIndex !== undefined ? StringUtils$CourseEditor.substr(matchPattern, 0, hashIndex) : matchPattern;
  var precisionValue;
  if (hashIndex !== undefined) {
    var hashIndex$1 = hashIndex;
    precisionValue = StringUtils$CourseEditor.substr(matchPattern, hashIndex$1 + 1 | 0, (matchPattern.length - hashIndex$1 | 0) + 1 | 0);
  } else {
    precisionValue = "";
  }
  var operator = StringUtils$CourseEditor.substr(valueWithOp, 0, Option$CourseEditor.valueOr(StringUtils$CourseEditor.findIndex(undefined, matchPattern, (function (c) {
                  return !isInequalityOp(c);
                })), 0));
  var value = StringUtils$CourseEditor.substr(valueWithOp, Option$CourseEditor.valueOr(StringUtils$CourseEditor.findIndex(undefined, matchPattern, (function (c) {
                  return !isInequalityOp(c);
                })), 0), matchPattern.length);
  var inputClasses = "form-control input-sm form-control-sm " + (
    isValid ? "" : "is-invalid"
  );
  return React.createElement("div", {
              className: Curry._1(jssClass, "optionItem")
            }, React.createElement("div", {
                  className: Curry._1(jssClass, "value")
                }, React.createElement("input", {
                      className: inputClasses,
                      disabled: !editMode,
                      value: value,
                      onChange: (function ($$event) {
                          var value = $$event.target.value;
                          var match = precisionValue !== "";
                          var matchValue = operator + (value + (
                              match ? "#" + precisionValue : ""
                            ));
                          if (isValidInput(value)) {
                            onEditMatch(responseId, matchValue);
                            Curry._1(setValid, true);
                          } else {
                            Curry._1(setValid, false);
                          }
                          return Curry._1(updateState, matchValue);
                        })
                    })));
}

function renderPrecision(jssClass, editMode, matchPattern, isValid, responseId, onEditMatch, updateState, setValid) {
  var hashIndex = StringUtils$CourseEditor.findIndex(undefined, matchPattern, (function (c) {
          return c === /* "#" */35;
        }));
  var value = hashIndex !== undefined ? StringUtils$CourseEditor.substr(matchPattern, 0, hashIndex) : matchPattern;
  var precisionValue;
  if (hashIndex !== undefined) {
    var hashIndex$1 = hashIndex;
    precisionValue = StringUtils$CourseEditor.substr(matchPattern, hashIndex$1 + 1 | 0, (matchPattern.length - hashIndex$1 | 0) + 1 | 0);
  } else {
    precisionValue = "";
  }
  var inputClasses = "form-control input-sm form-control-sm " + (
    isValid ? "" : "is-invalid"
  );
  return React.createElement("div", {
              className: StyleUtils$CourseEditor.classNames(/* :: */[
                    Curry._1(jssClass, "optionsRow"),
                    /* :: */[
                      Curry._1(jssClass, "precision"),
                      /* [] */0
                    ]
                  ])
            }, ReasonReact.element(undefined, undefined, ToggleSwitch$CourseEditor.make(editMode, StyleUtils$CourseEditor.classNames(/* :: */[
                          Curry._1(jssClass, "precisionToggle"),
                          /* [] */0
                        ]), undefined, isPrecision(matchPattern), (function (param) {
                        return onTogglePrecision(matchPattern, responseId, onEditMatch, updateState);
                      }), "Precision", /* array */[])), React.createElement("input", {
                  className: StyleUtils$CourseEditor.classNames(/* :: */[
                        Curry._1(jssClass, "precisionValue"),
                        /* :: */[
                          inputClasses,
                          /* [] */0
                        ]
                      ]),
                  disabled: !editMode || !isPrecision(matchPattern),
                  type: "number",
                  value: precisionValue,
                  onChange: (function ($$event) {
                      var newPrecisionValue = $$event.target.value;
                      var matchValue = value + ("#" + newPrecisionValue);
                      if (newPrecisionValue > 0) {
                        onEditMatch(responseId, matchValue);
                        Curry._1(setValid, true);
                      } else {
                        Curry._1(setValid, false);
                      }
                      return Curry._1(updateState, matchValue);
                    })
                }), React.createElement("div", {
                  className: StyleUtils$CourseEditor.classNames(/* :: */[
                        Curry._1(jssClass, "precisionLabel"),
                        /* :: */[
                          hashIndex !== undefined ? "" : Curry._1(jssClass, "precisionLabelDisabled"),
                          /* [] */0
                        ]
                      ])
                }, ReactUtils$CourseEditor.strEl("Decimals")), React.createElement("div", {
                  className: StyleUtils$CourseEditor.classNames(/* :: */[
                        Curry._1(jssClass, "precisionSpacer"),
                        /* [] */0
                      ])
                }));
}

function renderRangeInstructions(jssClass) {
  return React.createElement("div", {
              className: StyleUtils$CourseEditor.classNames(/* :: */[
                    Curry._1(jssClass, "optionsRow"),
                    /* :: */[
                      Curry._1(jssClass, "rangeInstr"),
                      /* [] */0
                    ]
                  ])
            }, ReactUtils$CourseEditor.strEl("Range includes lower and upper bounds"), React.createElement("div", {
                  className: StyleUtils$CourseEditor.classNames(/* :: */[
                        Curry._1(jssClass, "precisionSpacer"),
                        /* [] */0
                      ])
                }));
}

function renderRange(jssClass, editMode, matchPattern, isValid1, isValid2, responseId, onEditMatch, updateState, setValid1, setValid2) {
  var rangeStart;
  try {
    rangeStart = StringUtils$CourseEditor.substr(matchPattern, 1, Option$CourseEditor.valueOrThrow(StringUtils$CourseEditor.findIndex(undefined, matchPattern, (function (c) {
                    return c === /* "," */44;
                  }))) - 1 | 0);
  }
  catch (exn){
    if (exn === Caml_builtin_exceptions.not_found) {
      rangeStart = "0";
    } else {
      throw exn;
    }
  }
  var rangeEnd;
  try {
    rangeEnd = StringUtils$CourseEditor.substr(matchPattern, Option$CourseEditor.valueOrThrow(StringUtils$CourseEditor.findIndex(undefined, matchPattern, (function (c) {
                    return c === /* "," */44;
                  }))) + 1 | 0, (matchPattern.length - Option$CourseEditor.valueOrThrow(StringUtils$CourseEditor.findIndex(undefined, matchPattern, (function (c) {
                      return c === /* "," */44;
                    }))) | 0) - 2 | 0);
  }
  catch (exn$1){
    if (exn$1 === Caml_builtin_exceptions.not_found) {
      rangeEnd = "0";
    } else {
      throw exn$1;
    }
  }
  var inputClass1 = isValid1 ? "" : "is-invalid";
  var inputClass2 = isValid2 ? "" : "is-invalid";
  return React.createElement("div", {
              className: Curry._1(jssClass, "optionItem")
            }, React.createElement("div", {
                  className: Curry._1(jssClass, "range")
                }, React.createElement("div", {
                      className: Curry._1(jssClass, "rangeLabel")
                    }, ReactUtils$CourseEditor.strEl("from")), React.createElement("input", {
                      className: StyleUtils$CourseEditor.classNames(/* :: */[
                            Curry._1(jssClass, "rangeInput"),
                            /* :: */[
                              "form-control",
                              /* :: */[
                                "input-sm",
                                /* :: */[
                                  "form-control-sm",
                                  /* :: */[
                                    inputClass1,
                                    /* [] */0
                                  ]
                                ]
                              ]
                            ]
                          ]),
                      disabled: !editMode,
                      value: rangeStart,
                      onChange: (function ($$event) {
                          var value = $$event.target.value;
                          var validRangeEnd;
                          var exit = 0;
                          var val;
                          var val$1;
                          try {
                            val = Caml_format.caml_float_of_string(value);
                            val$1 = Caml_format.caml_float_of_string(rangeEnd);
                            exit = 1;
                          }
                          catch (raw_exn){
                            var exn = Caml_js_exceptions.internalToOCamlException(raw_exn);
                            if (exn[0] === Caml_builtin_exceptions.failure) {
                              validRangeEnd = rangeEnd;
                            } else {
                              throw exn;
                            }
                          }
                          if (exit === 1) {
                            var match = val > val$1;
                            validRangeEnd = match ? value : rangeEnd;
                          }
                          var matchValue = "[" + (value + ("," + (validRangeEnd + "]")));
                          if (isValidInput(value)) {
                            onEditMatch(responseId, matchValue);
                            Curry._1(setValid1, true);
                          } else {
                            Curry._1(setValid1, false);
                          }
                          return Curry._1(updateState, matchValue);
                        })
                    }), React.createElement("div", {
                      className: Curry._1(jssClass, "rangeLabel")
                    }, ReactUtils$CourseEditor.strEl("up to")), React.createElement("input", {
                      className: StyleUtils$CourseEditor.classNames(/* :: */[
                            Curry._1(jssClass, "rangeInput"),
                            /* :: */[
                              "form-control",
                              /* :: */[
                                "input-sm",
                                /* :: */[
                                  "form-control-sm",
                                  /* :: */[
                                    inputClass2,
                                    /* [] */0
                                  ]
                                ]
                              ]
                            ]
                          ]),
                      disabled: !editMode,
                      value: rangeEnd,
                      onChange: (function ($$event) {
                          var value = $$event.target.value;
                          var validRangeStart;
                          var exit = 0;
                          var val;
                          var val$1;
                          try {
                            val = Caml_format.caml_float_of_string(value);
                            val$1 = Caml_format.caml_float_of_string(rangeStart);
                            exit = 1;
                          }
                          catch (raw_exn){
                            var exn = Caml_js_exceptions.internalToOCamlException(raw_exn);
                            if (exn[0] === Caml_builtin_exceptions.failure) {
                              validRangeStart = rangeStart;
                            } else {
                              throw exn;
                            }
                          }
                          if (exit === 1) {
                            var match = val < val$1;
                            validRangeStart = match ? value : rangeStart;
                          }
                          var matchValue = "[" + (validRangeStart + ("," + (value + "]")));
                          if (isValidInput(value)) {
                            onEditMatch(responseId, matchValue);
                            Curry._1(setValid2, true);
                          } else {
                            Curry._1(setValid2, false);
                          }
                          return Curry._1(updateState, matchValue);
                        })
                    })));
}

function renderUnknown(jssClass) {
  return React.createElement("div", {
              className: Curry._1(jssClass, "optionItem")
            }, React.createElement("div", {
                  className: "alert alert-danger",
                  role: "alert"
                }, ReactUtils$CourseEditor.strEl("Could not determine matching condition. Please check the original XML.")));
}

var componentName = "NumericMatchOptions";

var component = ReasonReact.reducerComponent(componentName);

function make(classes, className, editMode, responseId, matchPattern, onEditMatch) {
  return /* record */[
          /* debugName */component[/* debugName */0],
          /* reactClassInternal */component[/* reactClassInternal */1],
          /* handedOffState */component[/* handedOffState */2],
          /* willReceiveProps */component[/* willReceiveProps */3],
          /* didMount */component[/* didMount */4],
          /* didUpdate */component[/* didUpdate */5],
          /* willUnmount */component[/* willUnmount */6],
          /* willUpdate */component[/* willUpdate */7],
          /* shouldUpdate */component[/* shouldUpdate */8],
          /* render */(function (self) {
              var state = self[/* state */1];
              var jssClass = function (param) {
                return StyleUtils$CourseEditor.jssClass(classes, param);
              };
              var updateState = function (s) {
                return Curry._1(self[/* send */3], /* EditMatch */Block.__(0, [s]));
              };
              var setValidValue = function (v) {
                return Curry._1(self[/* send */3], /* SetInput */Block.__(1, [v]));
              };
              var setValidRange1 = function (v) {
                return Curry._1(self[/* send */3], /* SetRange1 */Block.__(2, [v]));
              };
              var setValidRange2 = function (v) {
                return Curry._1(self[/* send */3], /* SetRange2 */Block.__(3, [v]));
              };
              var setValidPrecision = function (v) {
                return Curry._1(self[/* send */3], /* SetPrecision */Block.__(4, [v]));
              };
              var match = getConditionFromMatch(Option$CourseEditor.valueOr(state[/* matchPattern */4], ""));
              return React.createElement("div", {
                          className: StyleUtils$CourseEditor.classNames(/* :: */[
                                componentName,
                                /* :: */[
                                  StyleUtils$CourseEditor.jssClass(classes, componentName),
                                  /* :: */[
                                    Option$CourseEditor.valueOr(className, ""),
                                    /* [] */0
                                  ]
                                ]
                              ])
                        }, match !== 6 ? (
                            match >= 7 ? React.createElement("div", {
                                    className: StyleUtils$CourseEditor.jssClass(classes, "optionsRow")
                                  }, renderUnknown(jssClass)) : React.createElement("div", undefined, React.createElement("div", {
                                        className: StyleUtils$CourseEditor.jssClass(classes, "optionsRow")
                                      }, React.createElement("div", {
                                            className: StyleUtils$CourseEditor.jssClass(classes, "condition")
                                          }, renderConditionSelect(editMode, responseId, Option$CourseEditor.valueOr(state[/* matchPattern */4], ""), onEditMatch, updateState)), renderValue(jssClass, editMode, Option$CourseEditor.valueOr(state[/* matchPattern */4], ""), state[/* input */0], responseId, onEditMatch, updateState, setValidValue)), renderPrecision(jssClass, editMode, Option$CourseEditor.valueOr(state[/* matchPattern */4], ""), state[/* precision */3], responseId, onEditMatch, updateState, setValidPrecision))
                          ) : React.createElement("div", undefined, React.createElement("div", {
                                    className: StyleUtils$CourseEditor.jssClass(classes, "optionsRow")
                                  }, React.createElement("div", {
                                        className: StyleUtils$CourseEditor.jssClass(classes, "condition")
                                      }, renderConditionSelect(editMode, responseId, Option$CourseEditor.valueOr(state[/* matchPattern */4], ""), onEditMatch, updateState)), renderRange(jssClass, editMode, Option$CourseEditor.valueOr(state[/* matchPattern */4], ""), state[/* range1 */1], state[/* range2 */2], responseId, onEditMatch, updateState, setValidRange1, setValidRange2)), renderRangeInstructions(jssClass)));
            }),
          /* initialState */(function (param) {
              return /* record */[
                      /* input */true,
                      /* range1 */true,
                      /* range2 */true,
                      /* precision */true,
                      /* matchPattern */matchPattern
                    ];
            }),
          /* retainedProps */component[/* retainedProps */11],
          /* reducer */(function (action, current) {
              switch (action.tag | 0) {
                case /* EditMatch */0 :
                    return /* Update */Block.__(0, [/* record */[
                                /* input */current[/* input */0],
                                /* range1 */current[/* range1 */1],
                                /* range2 */current[/* range2 */2],
                                /* precision */current[/* precision */3],
                                /* matchPattern */action[0]
                              ]]);
                case /* SetInput */1 :
                    return /* Update */Block.__(0, [/* record */[
                                /* input */action[0],
                                /* range1 */current[/* range1 */1],
                                /* range2 */current[/* range2 */2],
                                /* precision */current[/* precision */3],
                                /* matchPattern */current[/* matchPattern */4]
                              ]]);
                case /* SetRange1 */2 :
                    return /* Update */Block.__(0, [/* record */[
                                /* input */current[/* input */0],
                                /* range1 */action[0],
                                /* range2 */current[/* range2 */2],
                                /* precision */current[/* precision */3],
                                /* matchPattern */current[/* matchPattern */4]
                              ]]);
                case /* SetRange2 */3 :
                    return /* Update */Block.__(0, [/* record */[
                                /* input */current[/* input */0],
                                /* range1 */current[/* range1 */1],
                                /* range2 */action[0],
                                /* precision */current[/* precision */3],
                                /* matchPattern */current[/* matchPattern */4]
                              ]]);
                case /* SetPrecision */4 :
                    return /* Update */Block.__(0, [/* record */[
                                /* input */current[/* input */0],
                                /* range1 */current[/* range1 */1],
                                /* range2 */current[/* range2 */2],
                                /* precision */action[0],
                                /* matchPattern */current[/* matchPattern */4]
                              ]]);
                
              }
            }),
          /* subscriptions */component[/* subscriptions */13],
          /* jsElementWrapped */component[/* jsElementWrapped */14]
        ];
}

var jsComponentUnstyled = ReasonReact.wrapReasonForJs(component, (function (jsProps) {
        return make(jsProps.classes, Caml_option.nullable_to_opt(jsProps.className), jsProps.editMode, jsProps.responseId, Caml_option.nullable_to_opt(jsProps.matchPattern), jsProps.onEditMatch);
      }));

var jsComponent = StyleUtils$CourseEditor.injectSheet(styles, jsComponentUnstyled);

exports.styles = styles;
exports.isInequalityOp = isInequalityOp;
exports.isRangeOp = isRangeOp;
exports.isValidVariableRef = isValidVariableRef;
exports.isNumeric = isNumeric;
exports.isValidInput = isValidInput;
exports.getInequalityOperator = getInequalityOperator;
exports.isPrecision = isPrecision;
exports.isRange = isRange;
exports.getConditionFromMatch = getConditionFromMatch;
exports.onTogglePrecision = onTogglePrecision;
exports.renderConditionSelect = renderConditionSelect;
exports.renderValue = renderValue;
exports.renderPrecision = renderPrecision;
exports.renderRangeInstructions = renderRangeInstructions;
exports.renderRange = renderRange;
exports.renderUnknown = renderUnknown;
exports.componentName = componentName;
exports.component = component;
exports.make = make;
exports.jsComponentUnstyled = jsComponentUnstyled;
exports.jsComponent = jsComponent;
/* styles Not a pure module */
