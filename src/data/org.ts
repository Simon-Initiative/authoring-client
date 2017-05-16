import * as Immutable from 'immutable';
import * as types from './types';
import guid from '../utils/guid';
import Linkable from './linkable';

export const OrgContentTypes = types.strEnum([
  'Item',
  'Section',
  'Sequence',
  'Module',
  'Organization'
]);

export type OrgContentTypes = keyof typeof OrgContentTypes;

export class IDRef {
  idRef:string="null";
}

export class OrgItem extends Linkable {
  orgType:OrgContentTypes=OrgContentTypes.Item;
  scoringMode : string ="default";
  children:Array<OrgItem>;
  resourceRef : IDRef;

  constructor() {
    super();
    this.children = new Array ();
    this.resourceRef=new IDRef ();
  }

  static addTextObject (aText,aValue)
  {
    let newTextObject:Object=new Object ();
    newTextObject [aText]=new Object ();
    newTextObject [aText]["#text"]=aValue;
    return (newTextObject);
  }

  addNode (aNode: OrgItem) {
      this.children.push (aNode);
  }

  isLeaf ():boolean {
    if (this.children.length==0) {
          return (true);
    }

    return (false);
  }

  /**
  * You can only call this if the node is a leaf node, or in other words
  * an OLI item
  */
  toJSONObject (anObject?:OrgItem): Object {
      var ephemeral:Object=new Object ();

      ephemeral ["item"]=new Object ();

      if (anObject) {
        ephemeral ["item"]["@expanded"]=anObject.expanded;
        ephemeral ["item"]["@scoring_mode"]=anObject.scoringMode;
        ephemeral ["item"]["resourceref"]=new Object ();
        ephemeral ["item"]["resourceref"]["@idref"]=anObject.resourceRef.idRef;
      } else {
        ephemeral ["item"]["@expanded"]=anObject.expanded;
        ephemeral ["item"]["@scoring_mode"]=this.scoringMode;
        ephemeral ["item"]["resourceref"]=new Object ();
        ephemeral ["item"]["resourceref"]["@idref"]=this.resourceRef.idRef;
      }

      return (ephemeral);
  }
}

export class OrgSection extends OrgItem {
  constructor() {
      super ();
      this.orgType=OrgContentTypes.Section;
  }

  toJSONObject (anObject?:OrgSection): Object {
    let ephemeral:Object=new Object ();
    if (anObject) {
      ephemeral ["@id"]=anObject.id;
      ephemeral ["@expanded"]=anObject.expanded;
      ephemeral ["#array"]=new Array ();
      ephemeral ["#annotations"]=Linkable.toJSON (this.annotations);
    } else {
      ephemeral ["@id"]=this.id;
      ephemeral ["@expanded"]=this.expanded;
      ephemeral ["#array"]=new Array ();
      ephemeral ["#annotations"]=Linkable.toJSON (this.annotations);
    }
    return (ephemeral);
  }
}

export class OrgModule extends OrgItem {

  constructor() {
    super ();
    this.orgType=OrgContentTypes.Module;
  }

  toJSONObject (anObject?:OrgModule): Object {
    let ephemeral:Object=new Object ();
    if (anObject) {
      ephemeral ["@id"]=anObject.id;
      ephemeral ["@expanded"]=anObject.expanded;
      ephemeral ["#array"]=new Array ();
      ephemeral ["#annotations"]=Linkable.toJSON (this.annotations);
    } else {
      ephemeral ["@id"]=this.id;
      ephemeral ["@expanded"]=this.expanded;
      ephemeral ["#array"]=new Array ();
      ephemeral ["#annotations"]=Linkable.toJSON (this.annotations);
    }
    return (ephemeral);
  }
}

export class OrgSequence extends OrgItem{

  category:string="unassigned";
  audience:string="unassigned";

  constructor() {
   super ();
   this.orgType=OrgContentTypes.Sequence;
  }

  toJSONObject (anObject?:OrgSequence): Object {
    let ephemeral:Object=new Object ();

    if (anObject) {
      ephemeral ["@id"]=anObject.id;
      ephemeral ["@expanded"]=anObject.expanded;
      ephemeral ["@category"]=anObject.category;
      ephemeral ["@audience"]=anObject.audience;
      ephemeral ["#array"]=new Array ();
      ephemeral ["#annotations"]=Linkable.toJSON (this.annotations);
    } else {
      ephemeral ["@id"]=this.id;
      ephemeral ["@expanded"]=this.expanded;
      ephemeral ["@category"]=this.category;
      ephemeral ["@audience"]=this.audience;
      ephemeral ["#array"]=new Array ();
      ephemeral ["#annotations"]=Linkable.toJSON (this.annotations);
    }
    return (ephemeral);
  }
}

export class OrgOrganization extends OrgSequence {

  version:string="unassigned";
  description:string="unassgined";

  constructor() {
    super ();
    this.orgType=OrgContentTypes.Organization;
  }

  toJSONObject (anObject?: OrgOrganization): Object {
    let ephemeral:Object=new Object ();
    if (anObject) {
      ephemeral ["organization"]=new Object ();
      ephemeral ["organization"]["@id"]=anObject.id;
      ephemeral ["organization"]["@expanded"]=anObject.expanded;
      ephemeral ["organization"]["@version"]=anObject.version;
      ephemeral ["organization"]["#array"]=new Array ();
      ephemeral ["organization"]["#array"].push (OrgItem.addTextObject ("title",anObject.title));
      ephemeral ["organization"]["#array"].push (OrgItem.addTextObject ("description",anObject.description));
      ephemeral ["organization"]["#array"].push (OrgItem.addTextObject ("audience",anObject.audience));
      ephemeral ["organization"]["#annotations"]=Linkable.toJSON (anObject.annotations);
    } else {
      ephemeral ["organization"]=new Object ();
      ephemeral ["organization"]["@id"]=this.id;
      ephemeral ["organization"]["@expanded"]=this.expanded;
      ephemeral ["organization"]["@version"]=this.version;
      ephemeral ["organization"]["#array"]=new Array ();
      ephemeral ["organization"]["#array"].push (OrgItem.addTextObject ("title",this.title));
      ephemeral ["organization"]["#array"].push (OrgItem.addTextObject ("description",this.description));
      ephemeral ["organization"]["#array"].push (OrgItem.addTextObject ("audience",this.audience));
      //ephemeral ["#annotations"]=Linkable.toJSON (this.annotations);
      ephemeral ["organization"]["#annotations"]=Linkable.toJSON (this.annotations);
    }
    return (ephemeral);
  }
}
