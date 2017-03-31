
export class IDRef {
  idRef:string="null";    
}

export default class OrgTreeNode {
  title:string="Something";
  scoring_mode : string ="default";
  resourceRef : IDRef;
  children:Array<OrgTreeNode>;
    
  constructor() {
    this.children = new Array ();
    this.resourceRef=new IDRef ();
  }
    
  addNode (aNode: OrgTreeNode) {
      this.children.push (aNode);
  }
}
