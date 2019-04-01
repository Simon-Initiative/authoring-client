// Generated by BUCKLESCRIPT VERSION 4.0.18, PLEASE EDIT WITH CARE
'use strict';

var Curry = require("bs-platform/lib/js/curry.js");
var Caml_option = require("bs-platform/lib/js/caml_option.js");
var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions.js");

function valueOr(opt, $$default) {
  if (opt !== undefined) {
    return Caml_option.valFromOption(opt);
  } else {
    return $$default;
  }
}

function valueOrCompute(opt, fn) {
  if (opt !== undefined) {
    return Caml_option.valFromOption(opt);
  } else {
    return Curry._1(fn, /* () */0);
  }
}

function valueOrThrow(opt) {
  if (opt !== undefined) {
    return Caml_option.valFromOption(opt);
  } else {
    throw Caml_builtin_exceptions.not_found;
  }
}

function lift(opt, fn) {
  if (opt !== undefined) {
    return Curry._1(fn, Caml_option.valFromOption(opt));
  } else {
    return opt;
  }
}

exports.valueOr = valueOr;
exports.valueOrCompute = valueOrCompute;
exports.valueOrThrow = valueOrThrow;
exports.lift = lift;
/* No side effect */
