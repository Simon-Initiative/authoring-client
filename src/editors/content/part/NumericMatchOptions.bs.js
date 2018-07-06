// Generated by BUCKLESCRIPT VERSION 3.1.5, PLEASE EDIT WITH CARE
'use strict';

var Curry = require("bs-platform/lib/js/curry.js");
var React = require("react");
var $$String = require("bs-platform/lib/js/string.js");
var Caml_string = require("bs-platform/lib/js/caml_string.js");
var ReasonReact = require("reason-react/src/ReasonReact.js");
var Js_primitive = require("bs-platform/lib/js/js_primitive.js");
var Option$CourseEditor = require("../../../utils/reason/Option.bs.js");
var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions.js");
var ReactUtils$CourseEditor = require("../../../utils/reason/ReactUtils.bs.js");
var StyleUtils$CourseEditor = require("../../../styles/reason/StyleUtils.bs.js");
var StringUtils$CourseEditor = require("../../../utils/reason/StringUtils.bs.js");
var ToggleSwitch$CourseEditor = require("../../../components/common/ToggleSwitch.bs.js");
var NumericMatchOptionsStyle = require("./NumericMatchOptions.style");

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

function getInequalityOperator(matchPattern) {
  var operatorIndex = StringUtils$CourseEditor.findIndex(/* None */0, matchPattern, isInequalityOp);
  if (operatorIndex) {
    var index = operatorIndex[0];
    var match = Caml_string.get(matchPattern, index);
    if (match >= 60) {
      if (match >= 63) {
        return /* Unknown */7;
      } else {
        switch (match - 60 | 0) {
          case 0 : 
              var exit = 0;
              var val;
              try {
                val = Caml_string.get(matchPattern, index + 1 | 0);
                exit = 1;
              }
              catch (exn){
                if (exn === Caml_builtin_exceptions.not_found) {
                  return /* LT */3;
                } else {
                  throw exn;
                }
              }
              if (exit === 1) {
                if (val !== 61) {
                  return /* LT */3;
                } else {
                  return /* LTE */5;
                }
              }
              break;
          case 1 : 
              return /* EQ */0;
          case 2 : 
              var exit$1 = 0;
              var val$1;
              try {
                val$1 = Caml_string.get(matchPattern, index + 1 | 0);
                exit$1 = 1;
              }
              catch (exn$1){
                if (exn$1 === Caml_builtin_exceptions.not_found) {
                  return /* GT */2;
                } else {
                  throw exn$1;
                }
              }
              if (exit$1 === 1) {
                if (val$1 !== 61) {
                  return /* GT */2;
                } else {
                  return /* GTE */4;
                }
              }
              break;
          
        }
      }
    } else if (match !== 33) {
      return /* Unknown */7;
    } else {
      var exit$2 = 0;
      var val$2;
      try {
        val$2 = Caml_string.get(matchPattern, index + 1 | 0);
        exit$2 = 1;
      }
      catch (exn$2){
        if (exn$2 === Caml_builtin_exceptions.not_found) {
          return /* Unknown */7;
        } else {
          throw exn$2;
        }
      }
      if (exit$2 === 1) {
        if (val$2 !== 61) {
          return /* Unknown */7;
        } else {
          return /* NE */1;
        }
      }
      
    }
  } else {
    return /* EQ */0;
  }
}

function isPrecision(matchPattern) {
  var match = StringUtils$CourseEditor.findIndex(/* None */0, matchPattern, (function (c) {
          return c === /* "#" */35;
        }));
  if (match) {
    return true;
  } else {
    return false;
  }
}

function isRange(matchPattern) {
  if (matchPattern.length) {
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

function onTogglePrecision(matchPattern, responseId, onEditMatch) {
  var match = isPrecision(matchPattern);
  var newMatchPattern = match ? StringUtils$CourseEditor.remove(matchPattern, $$String.index(matchPattern, /* "#" */35), matchPattern.length - $$String.index(matchPattern, /* "#" */35) | 0) : matchPattern + "#1";
  return onEditMatch(responseId, newMatchPattern);
}

function renderConditionSelect(editMode, responseId, matchPattern, onEditMatch) {
  var match = getConditionFromMatch(matchPattern);
  var tmp;
  switch (match) {
    case 1 : 
        tmp = "ne";
        break;
    case 2 : 
        tmp = "gt";
        break;
    case 3 : 
        tmp = "lt";
        break;
    case 4 : 
        tmp = "gte";
        break;
    case 5 : 
        tmp = "lte";
        break;
    case 6 : 
        tmp = "range";
        break;
    case 0 : 
    case 7 : 
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
                  var c = Caml_string.get(matchPattern, 0);
                  var matchPattern$1 = isInequalityOp(c) ? StringUtils$CourseEditor.substr(matchPattern, Option$CourseEditor.valueOr(StringUtils$CourseEditor.findIndex(/* None */0, matchPattern, (function (c) {
                                    return !isInequalityOp(c);
                                  })), 0), matchPattern.length) : (
                      isRangeOp(c) ? StringUtils$CourseEditor.substr(matchPattern, 1, Option$CourseEditor.valueOr(StringUtils$CourseEditor.findIndex(/* None */0, matchPattern, (function (c) {
                                        return c === /* "," */44;
                                      })), 1)) : matchPattern
                    );
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
                  return onEditMatch(responseId, matchPattern$2);
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

function renderValue(jssClass, editMode, matchPattern, responseId, onEditMatch) {
  var hashIndex = StringUtils$CourseEditor.findIndex(/* None */0, matchPattern, (function (c) {
          return c === /* "#" */35;
        }));
  var valueWithOp = hashIndex ? StringUtils$CourseEditor.substr(matchPattern, 0, hashIndex[0]) : matchPattern;
  var precisionValue;
  if (hashIndex) {
    var hashIndex$1 = hashIndex[0];
    precisionValue = StringUtils$CourseEditor.substr(matchPattern, hashIndex$1 + 1 | 0, (matchPattern.length - hashIndex$1 | 0) + 1 | 0);
  } else {
    precisionValue = "";
  }
  var operator = StringUtils$CourseEditor.substr(valueWithOp, 0, Option$CourseEditor.valueOr(StringUtils$CourseEditor.findIndex(/* None */0, matchPattern, (function (c) {
                  return !isInequalityOp(c);
                })), 0));
  var value = StringUtils$CourseEditor.substr(valueWithOp, Option$CourseEditor.valueOr(StringUtils$CourseEditor.findIndex(/* None */0, matchPattern, (function (c) {
                  return !isInequalityOp(c);
                })), 0), matchPattern.length);
  return React.createElement("div", {
              className: Curry._1(jssClass, "optionItem")
            }, React.createElement("div", {
                  className: Curry._1(jssClass, "value")
                }, React.createElement("input", {
                      className: "form-control input-sm form-control-sm",
                      disabled: !editMode,
                      type: "number",
                      value: value,
                      onChange: (function ($$event) {
                          var value = $$event.target.value;
                          var match = precisionValue !== "";
                          return onEditMatch(responseId, operator + (value + (
                                        match ? "#" + precisionValue : ""
                                      )));
                        })
                    })));
}

function renderPrecision(jssClass, editMode, matchPattern, responseId, onEditMatch) {
  var hashIndex = StringUtils$CourseEditor.findIndex(/* None */0, matchPattern, (function (c) {
          return c === /* "#" */35;
        }));
  var value = hashIndex ? StringUtils$CourseEditor.substr(matchPattern, 0, hashIndex[0]) : matchPattern;
  var precisionValue;
  if (hashIndex) {
    var hashIndex$1 = hashIndex[0];
    precisionValue = StringUtils$CourseEditor.substr(matchPattern, hashIndex$1 + 1 | 0, (matchPattern.length - hashIndex$1 | 0) + 1 | 0);
  } else {
    precisionValue = "";
  }
  return React.createElement("div", {
              className: StyleUtils$CourseEditor.classNames(/* :: */[
                    Curry._1(jssClass, "optionsRow"),
                    /* :: */[
                      Curry._1(jssClass, "precision"),
                      /* [] */0
                    ]
                  ])
            }, ReasonReact.element(/* None */0, /* None */0, ToggleSwitch$CourseEditor.make(/* Some */[editMode], /* Some */[StyleUtils$CourseEditor.classNames(/* :: */[
                            Curry._1(jssClass, "precisionToggle"),
                            /* [] */0
                          ])], /* None */0, /* Some */[isPrecision(matchPattern)], (function () {
                        return onTogglePrecision(matchPattern, responseId, onEditMatch);
                      }), "Precision", /* array */[])), React.createElement("input", {
                  className: StyleUtils$CourseEditor.classNames(/* :: */[
                        Curry._1(jssClass, "precisionValue"),
                        /* :: */[
                          "form-control input-sm form-control-sm",
                          /* [] */0
                        ]
                      ]),
                  disabled: !editMode || !isPrecision(matchPattern),
                  type: "number",
                  value: precisionValue,
                  onChange: (function ($$event) {
                      var newPrecisionValue = $$event.target.value;
                      return onEditMatch(responseId, value + ("#" + newPrecisionValue));
                    })
                }), React.createElement("div", {
                  className: StyleUtils$CourseEditor.classNames(/* :: */[
                        Curry._1(jssClass, "precisionLabel"),
                        /* :: */[
                          hashIndex ? "" : Curry._1(jssClass, "precisionLabelDisabled"),
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

function renderRange(jssClass) {
  return React.createElement("div", {
              className: Curry._1(jssClass, "optionItem")
            });
}

function renderUnknown(jssClass) {
  return React.createElement("div", {
              className: Curry._1(jssClass, "optionItem")
            });
}

var componentName = "NumericMatchOptions";

var component = ReasonReact.statelessComponent(componentName);

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
          /* render */(function () {
              var jssClass = function (param) {
                return StyleUtils$CourseEditor.jssClass(classes, param);
              };
              var match = getConditionFromMatch(Option$CourseEditor.valueOr(matchPattern, ""));
              var match$1 = getConditionFromMatch(Option$CourseEditor.valueOr(matchPattern, ""));
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
                        }, React.createElement("div", {
                              className: StyleUtils$CourseEditor.jssClass(classes, "optionsRow")
                            }, React.createElement("div", {
                                  className: StyleUtils$CourseEditor.jssClass(classes, "condition")
                                }, renderConditionSelect(editMode, responseId, Option$CourseEditor.valueOr(matchPattern, ""), onEditMatch)), match !== 6 ? (
                                match >= 7 ? renderUnknown(jssClass) : renderValue(jssClass, editMode, Option$CourseEditor.valueOr(matchPattern, ""), responseId, onEditMatch)
                              ) : renderRange(jssClass)), match$1 !== 6 && match$1 < 7 ? renderPrecision(jssClass, editMode, Option$CourseEditor.valueOr(matchPattern, ""), responseId, onEditMatch) : React.createElement("div", undefined));
            }),
          /* initialState */component[/* initialState */10],
          /* retainedProps */component[/* retainedProps */11],
          /* reducer */component[/* reducer */12],
          /* subscriptions */component[/* subscriptions */13],
          /* jsElementWrapped */component[/* jsElementWrapped */14]
        ];
}

var jsComponentUnstyled = ReasonReact.wrapReasonForJs(component, (function (jsProps) {
        return make(jsProps.classes, Js_primitive.null_undefined_to_opt(jsProps.className), jsProps.editMode, jsProps.responseId, Js_primitive.null_undefined_to_opt(jsProps.matchPattern), jsProps.onEditMatch);
      }));

var jsComponent = StyleUtils$CourseEditor.injectSheet(NumericMatchOptionsStyle.styles, jsComponentUnstyled);

exports.isInequalityOp = isInequalityOp;
exports.isRangeOp = isRangeOp;
exports.getInequalityOperator = getInequalityOperator;
exports.isPrecision = isPrecision;
exports.isRange = isRange;
exports.getConditionFromMatch = getConditionFromMatch;
exports.onTogglePrecision = onTogglePrecision;
exports.renderConditionSelect = renderConditionSelect;
exports.renderValue = renderValue;
exports.renderPrecision = renderPrecision;
exports.renderRange = renderRange;
exports.renderUnknown = renderUnknown;
exports.componentName = componentName;
exports.component = component;
exports.make = make;
exports.jsComponentUnstyled = jsComponentUnstyled;
exports.jsComponent = jsComponent;
/* component Not a pure module */
