
export const EditorRegistry = {};

export type RegisteredEditor = {
  name: string;
  editor: Object;
}

export function register(editor: RegisteredEditor) {
  EditorRegistry[editor.name] = editor
}

export function getEditorByName(name: string) : Object {
  return EditorRegistry[name].editor;
}



