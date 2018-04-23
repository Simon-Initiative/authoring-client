

/* State declaration */
type state = Hovering(int, int) | Uninitialized;

/* Action declaration */
type action =
  | MouseEnter(int, int);

let initialState : state = Uninitialized;

let component = ReasonReact.reducerComponent("TableCreation");


let rows = ListUtils.range(1, 8) |> Array.of_list;
let cols = ListUtils.range(1, 6) |> Array.of_list;

let str = ReasonReact.stringToElement;

let cellStyle = (isHighlighted) => {

  let backgroundColor = isHighlighted ? "#81abef" : "#DDDDDD";
  let border = "1px solid #DDDDDD";
  let borderRadius = "3px";
  ReactDOMRe.Style.make
      (~backgroundColor, ~border, ~borderRadius, ~display="inline-block", ~cursor="pointer",
      ~height="15px", ~width="15px", ~marginLeft="2px", ~marginTop="1px", ());
};

let make = (~onTableCreate, ~onHide, _children) => {

  ...component,

  initialState: () => initialState,

  reducer: (action, _state: state) => {
    switch (action) {
    | MouseEnter(row, col) => ReasonReact.Update(Hovering(row, col))
    }
  },

  render: self => {

    let width = "108px";

    let state = self.state;
    let boxShadow = "1px 2px 4px rgba(0, 0, 0, .5)";
    let gridStyle = ReactDOMRe.Style.make
      (~backgroundColor="#EFEFEF", ~boxShadow, ~height="220px", ~width, ~padding="3px", ());

    let labelStyle = ReactDOMRe.Style.make(~color="#808080", ~width, ~textAlign="center", ());

    let isHighlighted = (row, col) => {
      switch (state) {
      | Hovering(r, c) => r >= row && c >= col
      | Uninitialized => false
      }
    };

    let mapRow = row =>
      <div>
        {Array.map(col => <div
          style=cellStyle(isHighlighted(row, col))
          onMouseEnter=(_e => self.send(MouseEnter(row, col)))
          onClick={_e => { onHide(); onTableCreate(row, col); }}/>, cols)
        |> ReasonReact.arrayToElement}
      </div>;

    let cells = Array.map(mapRow, rows);

    let sizeLabel = switch (state) {
    | Uninitialized => ""
    | Hovering(row, col) => string_of_int(row) ++ " by " ++ string_of_int(col);
    };

    <div style=gridStyle>
      <div style=labelStyle>{str("Create Table")}</div>
      {cells |> ReasonReact.arrayToElement}
      <div style=labelStyle>{str(sizeLabel)}</div>
    </div>
  }
};

let jsComponent =
  ReasonReact.wrapReasonForJs(
    ~component,
    (jsProps) => make(~onTableCreate=jsProps##onTableCreate, ~onHide=jsProps##onHide, [||])
  );