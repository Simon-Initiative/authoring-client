
export class IDRef {
  idRef:string="null";    
}

export class OrgTreeNode {  
  title:string="unassigned";
  scoringMode : string ="default";
  children:Array<OrgTreeNode>;
  resourceRef : IDRef;    
    
  constructor() {
    this.children = new Array ();
    this.resourceRef=new IDRef ();
  }
    
  addNode (aNode: OrgTreeNode) {
      this.children.push (aNode);
  }
    
  isLeaf ():boolean {      
    if (this.children.length==0) {
          return (true);
    }
      
    return (false);
  }
    
  toExternalObject (): Object {
      var nodeObj=new Object ();
      
      nodeObj ["item"]=new Object ();
      nodeObj ["item"]["@scoring_mode"]=this.scoringMode;
      nodeObj ["item"]["resourceref"]=new Object ();
      nodeObj ["item"]["resourceref"]["@idref"]=this.resourceRef.idRef;
      
      return (nodeObj);
  }  
}


export class SimonModule {
    title:string="Default";
}


export class SimonOrganization extends OrgTreeNode {
    description:string="unassgined";
    audience:string="unassigned";
}
