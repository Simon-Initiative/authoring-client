import { EditorState } from 'draft-js';

import { Toolbar } from '../common/toolbar/Toolbar';
import { ToolbarButton } from '../common/toolbar/ToolbarButton';

export const HtmlToolbarButton: new() => ToolbarButton<EditorState> = ToolbarButton as any;
export const HtmlToolbar: new() => Toolbar<EditorState> = Toolbar as any;
