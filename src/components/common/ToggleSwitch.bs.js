// Generated by BUCKLESCRIPT VERSION 3.1.5, PLEASE EDIT WITH CARE
'use strict';

var ReasonReact = require("reason-react/src/ReasonReact.js");
var Js_null_undefined = require("bs-platform/lib/js/js_null_undefined.js");
var ToggleSwitchTsx = require("./ToggleSwitch.tsx");

function make(editMode, className, style, checked, onClick, label, children) {
  return ReasonReact.wrapJsForReason(ToggleSwitchTsx.ToggleSwitch, {
              className: Js_null_undefined.fromOption(className),
              editMode: Js_null_undefined.fromOption(editMode),
              style: Js_null_undefined.fromOption(style),
              checked: Js_null_undefined.fromOption(checked),
              onClick: onClick,
              label: label
            }, children);
}

exports.make = make;
/* ReasonReact Not a pure module */