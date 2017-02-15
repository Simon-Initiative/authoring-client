

export module viewActions {

  export type View = 'allPages' | 'allQuestions' | 'page';

  export type CHANGE_VIEW = 'CHANGE_VIEW'
  export const CHANGE_VIEW : CHANGE_VIEW = 'CHANGE_VIEW';

  export type changeViewAction = {
    type: CHANGE_VIEW,
    view: View
  }

  export function changeView(view : View) : changeViewAction {
    return {
      type: CHANGE_VIEW,
      view
    };
  }
}