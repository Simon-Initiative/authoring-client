import * as React from 'react';

import { HtmlToolbarButton as Button } from '../../html/TypedToolbar';
import { Separator } from './Separator';
import { EntityTypes } from '../../../../data/content/html/common';
import { CodeBlock } from '../../../../data/content/html/codeblock';
import { Table } from '../../../../data/content/html/table';
import { YouTube } from '../../../../data/content/html/youtube';
import { Audio } from '../../../../data/content/html/audio';
import { Image as ImageData } from '../../../../data/content/html/image';
import { Video } from '../../../../data/content/html/video';
import { IFrame } from '../../../../data/content/html/iframe';
import { Link } from '../../../../data/content/html/link';
import { ActivityLink } from '../../../../data/content/html/activity_link';
import { Xref } from '../../../../data/content/html/xref';



import * as commands from '../draft/commands';
const formula 
  = '<math xmlns=\'http://www.w3.org/1998/Math/MathML\' display=\'inline\'><mo>&sum;</mo></math>';
const defaultFormula = { '#cdata': formula };

const style = style => new commands.ToggleStyleCommand(style);
const block = type => new commands.ToggleBlockTypeCommand(type);
const insertBlock 
  = (type, mutability, data) => new commands.InsertBlockEntityCommand(type, mutability, data);
const insertInline 
  = (type, mutability, data) => new commands.InsertInlineEntityCommand(type, mutability, data);


export function flowInline() {
  return [
    <Button key="bold" command={style('BOLD')} tooltip="Bold" icon="bold"/>,
    <Button key="italic" command={style('ITALIC')} tooltip="Italic" icon="italic"/>,
    <Button 
      key="superscript" command={style('SUPERSCRIPT')} 
      tooltip="Superscript" icon="superscript"/>,
    <Button key="subscript" command={style('SUBSCRIPT')} 
      tooltip="Subscript" icon="subscript"/>,
    <Button key="code" command={style('CODE')} 
      tooltip="Code" icon="code"/>,
    <Button key="term" command={style('TERM')} 
      tooltip="Term" icon="book"/>,
    <Button key="foreign" command={style('FOREIGN')} 
      tooltip="Foreign" icon="globe"/>,
    
    <Separator key="sep5"/>,
    
    <Button key="link" 
      command={insertInline(EntityTypes.link, 'MUTABLE', { link: new Link() })} 
      tooltip="External hyperlink" icon="link"/>,
    <Button key="activity_link" 
      command={insertInline(
        EntityTypes.activity_link, 
        'MUTABLE', { activity_link: new ActivityLink() })} 
      tooltip="High stakes assessment link" icon="check"/>,
    <Button key="xref" 
      command={insertInline(EntityTypes.xref, 'MUTABLE', { xref: new Xref() })} 
      tooltip="Cross reference link" icon="sitemap"/>,
    
    <Separator key="sep2"/>,
    <Button key="ordered" command={block('ordered-list-item')} 
      tooltip="Ordered list" icon="list-ol"/>,
    <Button key="undordered" command={block('unordered-list-item')} 
      tooltip="Unordered list" icon="list-ul"/>,
    <Separator key="sep3"/>,

    <Button key="math" 
      command={insertInline(EntityTypes.formula, 'IMMUTABLE', defaultFormula)} 
      tooltip="Math expression" icon="etsy"/>,
  ];
}

export function flowBlock() {
  return [
    <Button key="codeblock" 
      command={
        insertBlock(
          EntityTypes.codeblock, 'IMMUTABLE', 
          { codeblock: new CodeBlock({ source: 'Your code here...' }) })} 
      tooltip="Code block" icon="code"/>,
    <Button key="table" 
      command={insertBlock(EntityTypes.table, 'IMMUTABLE', { table: new Table() })} 
      tooltip="Insert table" icon="table"/>,
    <Button key="image" 
      command={insertBlock(EntityTypes.image, 'IMMUTABLE', { image: new ImageData() })} 
      tooltip="Insert image" icon="image"/>,
    <Button key="audio" 
      command={insertBlock(EntityTypes.audio, 'IMMUTABLE', { audio: new Audio() })} 
      tooltip="Insert audio clip" icon="music"/>,
    <Button key="video" 
      command={insertBlock(EntityTypes.video, 'IMMUTABLE', { video: new Video() })} 
      tooltip="Insert video clip" icon="video-camera"/>,
    <Button key="youtube" 
      command={insertBlock(EntityTypes.youtube, 'IMMUTABLE', { youtube: new YouTube() })} 
      tooltip="Insert YouTube Video" icon="youtube"/>,
    <Button key="iframe" 
      command={insertBlock(EntityTypes.iframe, 'IMMUTABLE', { iframe: new IFrame() })} 
      tooltip="Insert page in iframe" icon="html5"/>,
  ];
}

export function bodyBlock() {
  return [
    <Button key="pullout" command={new commands.InsertPulloutCommand()} 
      tooltip="Insert pullout" icon="external-link-square"/>,
    <Button key="example" command={new commands.InsertExampleCommand()} 
      tooltip="Insert example" icon="bar-chart"/>,
    <Button key="definition" command={new commands.InsertDefinitionCommand()} 
      tooltip="Insert definition" icon="book"/>,
    <Button key="section" command={new commands.InsertSectionCommand()} 
      tooltip="Insert section" icon="list-alt"/>,
    <Separator key="sep1"/>,
    <Button key="wbinline" command={new commands.InsertAssessmentCommand()} 
      tooltip="Insert inline assessment" icon="flask"/>,
  ]; 
}


