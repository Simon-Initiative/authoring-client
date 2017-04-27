import * as React from 'react';

import { HtmlToolbarButton as Button } from '../../html/TypedToolbar';
import { EntityTypes } from '../../../../data/content/html/common';
import { CodeBlock } from '../../../../data/content/html/codeblock';
import * as commands from '../draft/commands';
const formula = "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"inline\"><mo>&sum;</mo></math>"
const defaultFormula = { '#cdata': formula};

const style = (style) => new commands.ToggleStyleCommand(style);
const block = (type) => new commands.ToggleBlockTypeCommand(type);
const insertBlock = (type, mutability, data) => new commands.InsertBlockEntityCommand(type, mutability, data);
const insertInline = (type, mutability, data) => new commands.InsertInlineEntityCommand(type, mutability, data);


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
    <Button key='codeblock' command={insertBlock(EntityTypes.codeblock, 'IMMUTABLE', {codeblock: new CodeBlock({source: 'Your code here...'})} )} 
      tooltip='Code block' icon="code"/>,

    <Button key='image' command={new commands.InsertMediaCommand(EntityTypes.image, 'image', 'image/*')} tooltip='Insert image' icon="image"/>
  ]
}

export function bodyBlock() {
  return [
    <Button key='pullout' command={new commands.InsertPulloutCommand()} tooltip='Insert pullout' icon="external-link-square"/>,
    <Button key='example' command={new commands.InsertExampleCommand()} tooltip='Insert example' icon="bar-chart"/>,
    <Button key='section' command={new commands.InsertSectionCommand()} tooltip='Insert section' icon="list-alt"/>,
    <Button key='wbinline' command={new commands.InsertAssessmentCommand()} tooltip='Insert inline assessment' icon="flask"/>
  ]; 
}


