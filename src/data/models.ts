import * as Immutable from 'immutable';
import * as types from './types';
import * as contentTypes from './contentTypes';
import { getKey } from './common';
import guid from '../utils/guid';
import {Skill} from './skills';
import {LearningObjective} from './los';
import {Title} from './contentTypes';

export type EmptyModel = 'EmptyModel';
export const EmptyModel : EmptyModel = 'EmptyModel';

export const ModelTypes = types.strEnum([
  'CourseModel',
  'CoursePermissionModel',
  'WorkbookPageModel',
  'AssessmentModel',
  'MediaModel',
  'OrganizationModel',
  'LearningObjectiveModel',
  'SkillModel'  
])

// Create an actual type
export type ModelTypes = keyof typeof ModelTypes;

export function isLockable(model: ContentModel) {
  return model.has('lock');
}

export function createModel(object: any) : ContentModel {
  switch (object.modelType) {
    case ModelTypes.CourseModel: 
      return CourseModel.fromPersistence(object);
    case ModelTypes.WorkbookPageModel: 
      return WorkbookPageModel.fromPersistence(object);
    case ModelTypes.CoursePermissionModel: 
      return CoursePermissionModel.fromPersistence(object);
    case ModelTypes.AssessmentModel:
      return AssessmentModel.fromPersistence(object);
    case ModelTypes.MediaModel:
      return MediaModel.fromPersistence(object);
    case ModelTypes.OrganizationModel:
      return OrganizationModel.fromPersistence(object);
    case ModelTypes.LearningObjectiveModel:
      return LearningObjectiveModel.fromPersistence(object);
    case ModelTypes.SkillModel:
      return SkillModel.fromPersistence(object);                    
  }
}

export type CourseModelParams = {
  title?: contentTypes.Title,
  organizations?: Immutable.List<types.DocumentId>,
  learningobjectives?: Immutable.List<types.DocumentId>,
  skills?: Immutable.List<types.DocumentId>
};

const defaultCourseModel = {
  modelType: 'CourseModel',
  title: new contentTypes.Title(),
  organizations: Immutable.List<types.DocumentId>(),
  learningobjectives: Immutable.List<types.DocumentId>(),
  skills: Immutable.List<types.DocumentId>()
}

export class CourseModel extends Immutable.Record(defaultCourseModel) {
    
  modelType: 'CourseModel';

  title: contentTypes.Title;
  organizations: Immutable.List<types.DocumentId>;
  learningobjectives: Immutable.List<types.DocumentId>;
  skills: Immutable.List<types.DocumentId>;

  constructor(params?: CourseModelParams) {
      params ? super(params) : super();
  }

  with(values: CourseModelParams) {
      return this.merge(values) as this;
  }

  static fromPersistence(json: Object) : CourseModel {
    let model = new CourseModel();
    const c = json as any;
    model = model.with({ title: new contentTypes.Title(c.title) });
    model = model.with({ organizations: Immutable.List<types.DocumentId>(c.organizations) });
    model = model.with({ learningobjectives: Immutable.List<types.DocumentId>(c.learningobjectives) });
    model = model.with({ skills: Immutable.List<types.DocumentId>(c.skills) });
    return model;
  }

  toPersistence() : Object {
    let title = this.title.toPersistence();
    const values = {
      modelType: 'CourseModel',
      organizations: this.organizations.toArray(),
      learningobjectives: this.learningobjectives.toArray(),
      skills: this.skills.toArray(),
    }
    return Object.assign({}, title, values);
  }
}

export type OrganizationModelParams = {
  title?: contentTypes.Title
};

const defaultOrganizationModel = {
  modelType: 'OrganizationModel',
  title: new contentTypes.Title(),
}

export class OrganizationModel extends Immutable.Record(defaultOrganizationModel) {    
  modelType: 'OrganizationModel';
  title: contentTypes.Title;
  
  constructor(params?: OrganizationModelParams) {
      params ? super(params) : super();
  }

  with(values: OrganizationModelParams) {
      return this.merge(values) as this;
  }

  static fromPersistence(json: Object) : OrganizationModel {
    return new OrganizationModel();
  }

  toPersistence() : Object {
    return {};
  }
}

export type MediaModelParams = {
  name?: string,
  _attachments?: any,
  referencingDocuments?: Immutable.List<types.DocumentId>
};
const defaultMediaModelParams = {
  modelType: 'MediaModel',
  name: '',
  _attachments: {},
  referencingDocuments: Immutable.List<types.DocumentId>()
}

export class MediaModel extends Immutable.Record(defaultMediaModelParams) {
    
  modelType: 'MediaModel';

  name: string;
  _attachments: any;
  referencingDocuments: Immutable.List<types.DocumentId>

  constructor(params?: MediaModelParams) {
      params ? super(params) : super();
  }

  with(values: MediaModelParams) {
      return this.merge(values) as this;
  }

  static fromPersistence(json: Object) : MediaModel {
    let model = new MediaModel();
    let m = json as any;
    model = model.with({ name: m.name});
    model = model.with({ _attachments: m._attachments});
    model = model.with({ referencingDocuments: Immutable.List<types.DocumentId>(m.referencingDocuments)});
    
    return model;
  }

  toPersistence() : Object {
    return {
      modelType: 'MediaModel',
      name: this.name,
      _attachments: this._attachments,
      referencingDocuments: this.referencingDocuments.toArray()
    };
  }
}


export type CoursePermissionModelParams = {
  userId: types.UserId,
  courseId: types.DocumentId
};
const defaultCoursePermissionModelParams = {
  modelType: 'CoursePermissionModel',
  userId: '',
  courseId: ''
}

export class CoursePermissionModel extends Immutable.Record(defaultCoursePermissionModelParams) {
    
  modelType: 'CoursePermissionModel';

  userId: types.UserId;
  courseId: types.DocumentId; 

  constructor(params?: CoursePermissionModelParams) {
      params ? super(params) : super();
  }

  with(values: CoursePermissionModelParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object) : CoursePermissionModel {
    const model = new CoursePermissionModel();
    const p = json as any;
    return model.with({ userId: p.userId, courseId: p.courseId });
  }

  toPersistence() : Object {
    return {
      modelType: 'CoursePermissionModel',
      userId: this.userId,
      courseId: this.courseId
    };
  }
}

export type WorkbookPageModelParams = {
  courseId?: types.DocumentId,
  head?: contentTypes.Head,
  body?: contentTypes.Html,
  lock?: contentTypes.Lock
};

const defaultWorkbookPageModelParams = {
  modelType: 'WorkbookPageModel',
  courseId: '',
  head: new contentTypes.Head(),
  body: new contentTypes.Html(),
  lock: new contentTypes.Lock()
}

export class WorkbookPageModel extends Immutable.Record(defaultWorkbookPageModelParams) {
    
  modelType: 'WorkbookPageModel';

  courseId: types.DocumentId;
  head: contentTypes.Head;
  body: contentTypes.Html;
  lock: contentTypes.Lock;

  constructor(params?: WorkbookPageModelParams) {
      params ? super(params) : super();
  }

  with(values: WorkbookPageModelParams) {
      return this.merge(values) as this;
  }

  static fromPersistence(json: Object) : WorkbookPageModel {
    let model = new WorkbookPageModel();

    let wb = (json as any);

    if (wb.lock !== undefined) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(wb.lock)});
    }
    if (wb.courseId !== undefined) {
      model = model.with({ courseId: wb.courseId});
    }

    wb.workbook_page['#array'].forEach(item => {
      
      const key = getKey(item);
      const id = guid();

      switch (key) {
        case 'head':
          model = model.with({ head: contentTypes.Head.fromPersistence(item, id)})
          break;
        case 'body':
          model = model.with({ body: contentTypes.Html.fromPersistence(item, id)})
          break;
        default:
      }
    });

    return model;
  }

  toPersistence() : Object {
    
    const root = {
      "courseId": this.courseId,
      "modelType": "WorkbookPageModel",
      "workbook_page": {
        "#array": [
          this.head.toPersistence(),
          { body: this.body.toPersistence() }
        ]
      }
    };

    return Object.assign({}, root, this.lock.toPersistence());
  }
}

export type AssessmentModelParams = {
  courseId?: types.DocumentId,
  lock?: contentTypes.Lock,
  title?: contentTypes.Title,
  nodes?: Immutable.OrderedMap<string, Node>
};
const defaultAssessmentModelParams = {
  modelType: 'AssessmentModel',
  courseId: '',
  lock: new contentTypes.Lock(),
  title: new contentTypes.Title(),
  nodes: Immutable.OrderedMap<string, Node>()
}


export type Node = contentTypes.Question | contentTypes.Content | contentTypes.Unsupported;

export class AssessmentModel extends Immutable.Record(defaultAssessmentModelParams) {
    
  modelType: 'AssessmentModel';

  courseId: types.DocumentId;
  lock: contentTypes.Lock;
  title: contentTypes.Title;
  nodes: Immutable.OrderedMap<string, Node>;
  
  constructor(params?: AssessmentModelParams) {
    params ? super(params) : super();
  }

  with(values: AssessmentModelParams) : AssessmentModel {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object) : AssessmentModel {

    let model = new AssessmentModel();

    let a = (json as any);
    
    if (a.lock !== undefined) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(a.lock)});
    }
    if (a.courseId !== undefined) {
      model = model.with({ courseId: a.courseId});
    }
    
    a.assessment['#array'].forEach(item => {
      
      const key = getKey(item);
      const id = guid();

      switch (key) {
        case 'title':
          model = model.with({ title: contentTypes.Title.fromPersistence(item, id)})
          break;
        case 'question':
          model = model.with({ nodes: model.nodes.set(id, contentTypes.Question.fromPersistence(item, id))})
          break;
        case 'content':
          model = model.with({ nodes: model.nodes.set(id, contentTypes.Content.fromPersistence(item, id))})
          break;
        default:
          model = model.with({ nodes: model.nodes.set(id, contentTypes.Unsupported.fromPersistence(item, id))})
      }
    });

    return model;
  }

  toPersistence() : Object {
    const children = [
      this.title.toPersistence(),
      ...this.nodes.toArray().map(node => node.toPersistence()),
    ]
    const root = {
      "courseId": this.courseId,
      "modelType": "AssessmentModel",
      "assessment": {
        "@id": "id",
        "#array": children
      }
    };

    return Object.assign({}, root, this.lock.toPersistence());
  }
}

export type ContentModel = 
  AssessmentModel |
  CourseModel | 
  CoursePermissionModel | 
  MediaModel |
  WorkbookPageModel |
  OrganizationModel |
  LearningObjectiveModel |
  SkillModel;

// A pure function that takes a content model as 
// input and returns a changed content model
export type ChangeRequest = (input: ContentModel) => ContentModel;

//>------------------------------------------------------------------

export type LearningObjectiveModelParams = {
  id?: string,
  title?: string,
  los: Array<LearningObjective>
};

const defaultLearningObjectiveModel = {
  modelType: 'LearningObjectiveModel',
  los: []
}

export class LearningObjectiveModel extends Immutable.Record(defaultLearningObjectiveModel) {    
  modelType: 'LearningObjectiveModel';
  los: Array <LearningObjective>;
  id: string;
  title: string;
  
  constructor(params?: LearningObjectiveModelParams) {
      params ? super(params) : super();
  }

  with(values: LearningObjectiveModelParams) {
      return this.merge(values) as this;
  }

  /**
   * 
   */    
  static parseLearningObjective (anObjective:Object): LearningObjective {

    var newLO:LearningObjective=new LearningObjective ();
        
    newLO.id=anObjective ["@id"];
    newLO.category=anObjective ["@category"];
    newLO.parent=anObjective ["@parent"];
    newLO.title=anObjective ["#text"];
   
      
    for (let i=0;i<anObjective ["#skills"].length;i++) {
        newLO.annotations.push (anObjective ["#skills"][i]);
    }  

    return (newLO);
  }

  static updateModel (treeData:any): LearningObjectiveModel {
      console.log ("updateModel ()");
      var newModel=new LearningObjectiveModel ({'los': treeData});      
      return newModel;
  }    

  static addTextObject (aText,aValue)
  {
    let newTextObject:Object=new Object ();
    newTextObject [aText]=new Object ();
    newTextObject [aText]["#text"]=aValue;
    return (newTextObject);
  } 
        
  static reparent (fromSet:Array<LearningObjective>) : Array<LearningObjective> {
    console.log ("reparent ()");
       
    let toSet:Array<LearningObjective>=new Array ();  
      
    //let clean:boolean=false;  
    //let loIndex:number=0;  

    //while (clean==false)
    for (let i=0;i<fromSet.length;i++)
    {
       // clean=true;
       //loIndex=0;
         
       let testLO:LearningObjective=fromSet [i];
       
       // This LO has a parent, reparent ... 
       if ((testLO.parent!="") && (testLO.parent!="unassigned")) {
         console.log ("We have an LO with a parent: " +  testLO.parent );
         
         //clean=false;
           
         //let tempRemoved:LearningObjective=fromSet.splice (loIndex,1)[0];
           
         // this should be valid since we essentially have a clean fromSet  
         for (let j=0;j<fromSet.length;j++) {
           let tempLO:LearningObjective=fromSet [j];
             
           if (tempLO.id==testLO.parent) {
             tempLO.children.push (testLO);  
           }  
         }         

         //loIndex=0; 
       } // This LO doesn't have a parent, just add it to the top-level array
       else { 
        //loIndex++;
        toSet.push (testLO);   
       }      
    }

    return (toSet);
  }    

  pushLO (anLO:LearningObjective,anArray:Array<Object>):void {
    console.log ("pushLO ()");
    
    // First add the object we're given directly to the array ...  
      
    var testLOContainer:Object=new Object();
    var ephemeral:Object=new Object ();
              
    ephemeral ["@id"]=anLO.id;
    ephemeral ["@category"]=anLO.category;
    ephemeral ["@parent"]=anLO.parent;
    ephemeral ["#text"]=anLO.title;
        
    // Add all the annotations of type skill to the skill list. Currently
    // we do not define a type on annotations so for now we will assume
    // that all annotations are skills
        
    ephemeral ["#skills"]=new Array<string>();
                          
    for (let i=0;i<anLO.annotations.length;i++) {
      //console.log ("Adding annotation: " + JSON.stringify (anLO.annotations [i]));  
          
      ephemeral ["#skills"].push (anLO.annotations [i]);
    }            
            
    anArray.push ({"objective" : ephemeral});
      
    // Then we add any children this LO might have ...  
      
    console.log ("Adding " + anLO.children.length + " children ...");  
      
    for (let j=0;j<anLO.children.length;j++) {
        this.pushLO(anLO.children [j],anArray);
    }  
  }

  toPersistence() : Object {
    console.log ("toPersistence ()");

    let flatLOs:Array<Object>=new Array ();  
      
    var newData:Object=new Object ();
    newData ["objectives"]=new Object();
    newData ["objectives"]["@id"]=this.id;
    newData ["objectives"]["#array"]=flatLOs;
    newData ["objectives"]["#array"].push (LearningObjectiveModel.addTextObject ("title",this.title));
        
    for (var i=0;i<this.los.length;i++)
    {
      let tempLO=this.los [i];

      this.pushLO (tempLO,flatLOs);  
    }
       
    console.log ("To: " + JSON.stringify (newData));

    const root = {
      "modelType": "LearningObjectiveModel",
      "learningobjectives": newData
    };

    return (root);
  }

  static fromPersistence(json: Object) : LearningObjectiveModel {

    console.log ("LearningObjectiveModel.fromPersistence: " + JSON.stringify (json));

    let loObject:Array<Object>=json ["learningobjectives"];
   
    let newData:Array<LearningObjective> = new Array ();
    let newTitle: string ="";
    let newId: string =loObject ["@id"];

    for (var i in loObject) {
      if (i=="title") {
        newTitle = loObject ["title"]["#text"];
      }

      if (i=="objectives") {       
        console.log ("Found objectives, parsing ...");         
        let loRoot=loObject [i];
                
        for (var j=0;j<loRoot ["#array"].length;j++) {
          let lObjectiveTest=loRoot ["#array"][j];
                    
          for (var k in lObjectiveTest) {
            if (k=="objective") {
              newData.push (LearningObjectiveModel.parseLearningObjective (lObjectiveTest [k]));                            
            }                        
          }
        }
      }
    }

    return new LearningObjectiveModel({'los': LearningObjectiveModel.reparent (newData)});
    //return new LearningObjectiveModel({'los': newData});
  }
}

//>------------------------------------------------------------------

export type SkillModelParams = {
  title?: contentTypes.Title,
  skills: any
};

const defaultSkillModel = {
  modelType: 'SkillModel',
  title: new contentTypes.Title(),
  skillDefaults: Skill,
  skills: []
}

export class SkillModel extends Immutable.Record(defaultSkillModel) {
  modelType: 'SkillModel';
  title: contentTypes.Title;
  skillDefaults: Skill;
  skills: Array <Skill>;
  
  constructor(params?: SkillModelParams) {
      console.log ("constructor ()");
      params ? super(params) : super();
      //super();
  }

  /*  
  with(values: SkillModelParams) {
      return this.merge(values) as this;
  }
  */

  static updateModel (newSkillModel:any): SkillModel {
      console.log ("updateModel ()");
      var newModel=new SkillModel ({'skills' : newSkillModel});      
      return newModel;
  }
    
  toPersistence() : Object {
    console.log ("toPersistence ()");
    const root = {
      "modelType": "SkillModel",
      "title" : this.title,
      "skills": this.skills
    };

    return (root);
  }

  static fromPersistence(json: Object) : SkillModel {
    
    var replacementSkills:Array<Skill>=new Array<Skill>();

    let skillData:Array<Skill>=json ["skills"];
            
    for (let i=0;i<skillData.length;i++) {  
      let newSkill:Skill=new Skill ();
      newSkill.fromJSONObject (skillData [i]);
        
      replacementSkills.push (newSkill);
    }        
      
    return (SkillModel.updateModel (replacementSkills))
  }    
}
