import * as React from 'react';

import { ToolbarButton } from './ToolbarButton';
import { ToolbarActionProvider } from './Toolbar';
import { EntityTypes } from '../../../../data/content/html/common';

const formula = "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"inline\"><mo>&sum;</mo></math>"
const defaultFormula = { '#cdata': formula};

export function flowInline() {
  return [
    <ToolbarButton key='bold' action={(action) => action.toggleInlineStyle('BOLD')} icon="bold"/>,
    <ToolbarButton key='italic' action={(action) => action.toggleInlineStyle('ITALIC')} icon="italic"/>,
    <ToolbarButton key='super' action={(action) => action.toggleInlineStyle('SUPERSCRIPT')} icon="superscript"/>,
    <ToolbarButton key='sub' action={(action) => action.toggleInlineStyle('SUBSCRIPT')} icon="subscript"/>,
    <ToolbarButton key='code' action={(action) => action.toggleInlineStyle('CODE')} icon="code"/>,
    <ToolbarButton key='ol' action={(action) => action.toggleBlockType('ordered-list-item')} icon="list-ol"/>,
    <ToolbarButton key='ul' action={(action) => action.toggleBlockType('unordered-list-item')} icon="list-ul"/>,
    <ToolbarButton key='math' action={(action) => action.insertInlineEntity(EntityTypes.formula, 'IMMUTABLE', defaultFormula)} icon="etsy"/>
  ]
}

export function flowBlock() {
  return [
    <ToolbarButton key='codeblock' 
          action={(action : ToolbarActionProvider) => action.insertAtomicBlock(EntityTypes.codeblock, {src: 'Your code here...'})} 
          icon="code"/>,
    <ToolbarButton key='image' action={(action : ToolbarActionProvider) => action.insertImage()} icon="image"/>
  ]
}

export function bodyBlock() {
  return [];  // TODO add section, pullout, example, etc support
}


