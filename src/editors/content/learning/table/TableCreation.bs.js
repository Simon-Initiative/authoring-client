// Generated by BUCKLESCRIPT VERSION 2.2.3, PLEASE EDIT WITH CARE
'use strict';

var $$Array = require("bs-platform/lib/js/array.js");
var Block = require("bs-platform/lib/js/block.js");
var Curry = require("bs-platform/lib/js/curry.js");
var React = require("react");
var ReasonReact = require("reason-react/src/ReasonReact.js");
var ListUtils$CourseEditor = require("../../../../utils/reason/ListUtils.bs.js");

var component = ReasonReact.reducerComponent("TableCreation");

var rows = $$Array.of_list(ListUtils$CourseEditor.range(1, 8));

var cols = $$Array.of_list(ListUtils$CourseEditor.range(1, 6));

function str(prim) {
  return prim;
}

function cellStyle(isHighlighted) {
  var backgroundColor = isHighlighted !== 0 ? "#81abef" : "#DDDDDD";
  return {
          backgroundColor: backgroundColor,
          border: "1px solid #DDDDDD",
          cursor: "pointer",
          display: "inline-block",
          height: "15px",
          marginTop: "1px",
          marginLeft: "2px",
          width: "15px",
          borderRadius: "3px"
        };
}

function make(onTableCreate, onHide, _) {
  var newrecord = component.slice();
  newrecord[/* render */9] = (function (self) {
      var width = "108px";
      var state = self[/* state */2];
      var gridStyle = {
        height: "220px",
        padding: "0px",
        width: width
      };
      var labelStyle = {
        color: "#808080",
        textAlign: "center",
        width: width
      };
      var isHighlighted = function (row, col) {
        if (state && state[0] >= row) {
          return +(state[1] >= col);
        } else {
          return /* false */0;
        }
      };
      var mapRow = function (row) {
        return React.createElement("div", {
                    key: "row" + String(row)
                  }, $$Array.map((function (col) {
                          return React.createElement("div", {
                                      key: "col" + String(col),
                                      style: cellStyle(isHighlighted(row, col)),
                                      onClick: (function () {
                                          Curry._1(onHide, /* () */0);
                                          return Curry._2(onTableCreate, row, col);
                                        }),
                                      onMouseEnter: (function () {
                                          return Curry._1(self[/* send */4], /* MouseEnter */[
                                                      row,
                                                      col
                                                    ]);
                                        })
                                    });
                        }), cols));
      };
      var cells = $$Array.map(mapRow, rows);
      var sizeLabel = state ? String(state[0]) + (" by " + String(state[1])) : "";
      return React.createElement("div", {
                  style: gridStyle
                }, React.createElement("div", {
                      style: labelStyle
                    }, "Create Table"), cells, React.createElement("div", {
                      style: labelStyle
                    }, sizeLabel));
    });
  newrecord[/* initialState */10] = (function () {
      return /* Uninitialized */0;
    });
  newrecord[/* reducer */12] = (function (action, _) {
      return /* Update */Block.__(0, [/* Hovering */[
                  action[0],
                  action[1]
                ]]);
    });
  return newrecord;
}

var jsComponent = ReasonReact.wrapReasonForJs(component, (function (jsProps) {
        return make(jsProps.onTableCreate, jsProps.onHide, /* array */[]);
      }));

var initialState = /* Uninitialized */0;

exports.initialState = initialState;
exports.component = component;
exports.rows = rows;
exports.cols = cols;
exports.str = str;
exports.cellStyle = cellStyle;
exports.make = make;
exports.jsComponent = jsComponent;
/* component Not a pure module */
