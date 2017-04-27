import * as React from 'react';

import { HtmlToolbarButton as Button } from '../../html/TypedToolbar';
import { EntityTypes } from '../../../../data/content/html/common';
import { ToggleStyleCommand, ToggleBlockTypeCommand } from '../draft/commands/toggle';
import { InsertInlineEntityCommand, InsertBlockEntityCommand } from '../draft/commands/insert';
import { InsertPulloutCommand } from '../draft/commands/pullout';
import { InsertMediaCommand } from '../draft/commands/media';
const formula = "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"inline\"><mo>&sum;</mo></math>"
const defaultFormula = { '#cdata': formula};

const style = (style) => new ToggleStyleCommand(style);
const block = (type) => new ToggleBlockTypeCommand(type);
const insertBlock = (type, mutability, data) => new InsertBlockEntityCommand(type, mutability, data);
const insertInline = (type, mutability, data) => new InsertInlineEntityCommand(type, mutability, data);


export function flowInline() {
  return [
    <Button key='bold' command={style('BOLD')} tooltip='Bold' icon="bold"/>,
    <Button key='italic' command={style('ITALIC')} tooltip='Italic' icon="italic"/>,
    <Button key='superscript' command={style('SUPERSCRIPT')} tooltip='Superscript' icon="superscript"/>,
    <Button key='subscript' command={style('SUBSCRIPT')} tooltip='Subscript' icon="subscript"/>,
    <Button key='code' command={style('CODE')} tooltip='Code' icon="code"/>,

    <Button key='ordered' command={block('ordered-list-item')} tooltip='Ordered list' icon="list-ol"/>,
    <Button key='undordered' command={block('unordered-list-item')} tooltip='Unordered list' icon="list-ul"/>,
    
    <Button key='math' command={insertInline(EntityTypes.formula, 'IMMUTABLE', defaultFormula)} 
      tooltip='Math expression' icon="etsy"/>
  ]
}

export function flowBlock() {
  return [
    <Button key='codeblock' command={insertBlock(EntityTypes.codeblock, 'IMMUTABLE', {src: 'Your code here...'})} 
      tooltip='Code block' icon="code"/>,

    <Button key='image' command={new InsertMediaCommand(EntityTypes.image, 'image', 'image/*')} tooltip='Insert image' icon="image"/>
  ]
}

export function bodyBlock() {
  return [
    <Button key='pullout' command={new InsertPulloutCommand()} tooltip='Insert pullout' icon="external-link-square"/>
  ];  // TODO add section, pullout, example, etc support
}


