

export module viewActions {
  export type View = "allPages" | "allQuestions" | "page";

  export const CHANGE_VIEW = 'CHANGE_VIEW';

  export function changeView(view : View) {
    return {
      type: CHANGE_VIEW,
      view
    };
  }
}