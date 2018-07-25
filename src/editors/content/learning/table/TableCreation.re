/* State declaration */
type state = Hovering(int, int) | Uninitialized;

/* Action declaration */
type action =
  | MouseEnter(int, int)
  | Clear;

let initialState : state = Uninitialized;

let component = ReasonReact.reducerComponent("TableCreation");

let str = ReasonReact.string;

let minRows = 6;
let maxRows = 16;
let minCols = 6;
let maxCols = 16;

let rowStyle = () => {
  ReactDOMRe.Style.make(~whiteSpace="nowrap", ());
};

let cellContainerStyle = () => {
  ReactDOMRe.Style.make(~padding="2px", ~display="inline-block", ~cursor="pointer", ());
};

let cellStyle = (isHighlighted) => {
  let backgroundColor = isHighlighted ? "#81abef" : "#DDDDDD";
  let border = "1px solid #DDDDDD";
  let borderRadius = "3px";
  ReactDOMRe.Style.make
      (~backgroundColor, ~border, ~padding="0px", ~margin="0px", ~borderRadius,
      ~display="inline-block", ~height="15px", ~width="15px", ());
};

let make = (~onTableCreate, ~onHide, _children) => {

  ...component,

  initialState: () => initialState,

  reducer: (action, _state: state) => {
    switch (action) {
    | MouseEnter(row, col) => ReasonReact.Update(Hovering(row, col))
    | Clear => ReasonReact.Update(Uninitialized)
    }
  },

  render: self => {
    let state = self.state;

    let numRows = switch (state) {
    | Hovering(r, _c) => min(max(r + 2, minRows), maxRows)
    | Uninitialized => minRows
    };

    let numCols = switch (state) {
    | Hovering(_r, c) => min(max(c + 2, minCols), maxCols)
    | Uninitialized => minCols
    };

    let rows = ListUtils.range(1, numRows) |> Array.of_list;
    let cols = ListUtils.range(1, numCols) |> Array.of_list;

    let width = string_of_int((Array.length(cols) * 19) + 10) ++ "px";
    let height = string_of_int((Array.length(rows) * 28) + 50) ++ "px";

    let gridStyle = ReactDOMRe.Style.make
      (~height, ~width, ~padding="0px", ());

    let labelStyle = ReactDOMRe.Style.make(~color="#808080", ~width, ~textAlign="center", ());

    let isHighlighted = (row, col) => {
      switch (state) {
      | Hovering(r, c) => r >= row && c >= col
      | Uninitialized => false
      }
    };

    let mapRow = row =>
      <div key={"row" ++ string_of_int(row)}>
        {Array.map(col =>
          <div
            key={"col" ++ string_of_int(col)}
            style={cellContainerStyle()}
            onMouseEnter=(_e => self.send(MouseEnter(row, col)))
            onClick={_e => { onHide(); self.send(Clear); onTableCreate(row, col); }}>

            <div style={cellStyle(isHighlighted(row, col))} />
          </div>
        , cols)
        |> ReasonReact.array}
      </div>;

    let cells = Array.map(mapRow, rows);

    let sizeLabel = switch (state) {
    | Uninitialized => ""
    | Hovering(row, col) => string_of_int(row) ++ " by " ++ string_of_int(col);
    };

    <div style=gridStyle>
      <div style=labelStyle>{str("Create Table")}</div>
      {cells |> ReasonReact.array}
      <div style=labelStyle>{str(sizeLabel)}</div>
    </div>
  }
};

let jsComponent =
  ReasonReact.wrapReasonForJs(
    ~component,
    (jsProps) => make(~onTableCreate=jsProps##onTableCreate, ~onHide=jsProps##onHide, [||])
  );