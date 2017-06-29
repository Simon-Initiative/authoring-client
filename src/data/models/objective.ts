import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { getKey } from '../common';
import { isNullOrUndefined, isArray } from 'util';
import * as types from '../types';


export type LearningObjectiveModelParams = {
  resource?: contentTypes.Resource,
  guid?: string,
  type?: string,
  id?: string,
  title?: string,
  los?: Array<contentTypes.LearningObjective>,
  lock?: contentTypes.Lock,
};

const defaultLearningObjectiveModel = {
  resource: new contentTypes.Resource(),
  guid: '',
  type: 'x-oli-learning_objectives',
  id: '',
  title: '',
  modelType: 'LearningObjectiveModel',
  los: [],
  lock: new contentTypes.Lock(),

};

export class LearningObjectiveModel extends Immutable.Record(defaultLearningObjectiveModel) {
  modelType: 'LearningObjectiveModel';
  resource: contentTypes.Resource;
  guid: string;
  type: string;
  los: Array<contentTypes.LearningObjective>;
  id: string;
  title: string;
  lock: contentTypes.Lock;

  constructor(params?: LearningObjectiveModelParams) {
    params ? super(params) : super();
  }

  with(values: LearningObjectiveModelParams) {
    return this.merge(values) as this;
  }

  /**
   * We parse a single learning objective here. Please note that for now we're
   * flattening compound title objects into a single text string. For example
   * we might get the following learning objective:
   * 
   * {
   * "@id": "id_2_a",
   * "@category": "domain_specific",
   * "#array": [
   *    {
   *      "#text": "Evaluate expressions of type "
   *    },
   *    {
   *      "code": {
   *        "@style": "inline",
   *        "#text": "int, float, bool, string"
   *      }
   *    }
   *  ]
   * }
   */
  static parseLearningObjective(anObjective: Object): contentTypes.LearningObjective {

    // console.log ("parseLearningObjective : " + JSON.stringify (anObjective));  
      
    const newLO: contentTypes.LearningObjective = new contentTypes.LearningObjective();

    newLO.id = anObjective ['@id'];
      
    newLO.category = anObjective ['@category'];
      
    if (anObjective ['@expanded']) {  
      newLO.expanded = anObjective ['@expanded'];
    }
      
    if (anObjective ['@parent']) {
      newLO.parent = anObjective ['@parent'];
    }      
      
    if (anObjective ['#annotations']) {
      newLO.annotations = contentTypes.Linkable.fromJSON(anObjective ['#annotations']);
    }
      
    // Flatten title for now. Keep in mind that once the text is in the
    // title attribute that's where any updates will be stored.  
      
    if (anObjective ['#array']) {
      // console.log ("Found composite title");  
      const compositeTitle = anObjective ['#array'];
      let newTitle:string = '';  
      for (let i = 0;i < compositeTitle.length;i++) {
        const testTitleObject:any = compositeTitle [i];
          
        // console.log ("Examining sub title object: " + JSON.stringify (testTitleObject));  
          
        if (testTitleObject ['#text']) {
          newTitle += testTitleObject ['#text'];
          newTitle += ' ';              
        }
          
        if (testTitleObject ['code']) {
          newTitle += testTitleObject ['code']['#text'];
          newTitle += ' ';            
        }          
      }
        
      newLO.title = newTitle;         
    } else {     
      newLO.title = anObjective ['#text'];
    }   

    return (newLO);
  }

  static updateModel(oldLDModel: LearningObjectiveModel, treeData: any): LearningObjectiveModel {
    console.log('updateModel ()');
    let model = new LearningObjectiveModel({ los: treeData });
    model = model.with({ resource: oldLDModel.resource });
    model = model.with({ guid: oldLDModel.guid });
    model = model.with({ type: oldLDModel.type });
    model = model.with({ id: oldLDModel.id });
    model = model.with({ title: oldLDModel.title });
    if (!isNullOrUndefined(oldLDModel.lock)) {
      model = model.with({ lock: oldLDModel.lock });
    }
    return model;
  }

  static addTextObject(aText, aValue) {
    const newTextObject: Object = new Object();
    newTextObject [aText] = new Object();
    newTextObject [aText]['#text'] = aValue;
    return (newTextObject);
  }

  /**
   * Takes a list of learning objective objects and creates a tree of those
   * objects based on the parent parameter.
   */
  static reparent(fromSet: Array<contentTypes.LearningObjective>): Array<contentTypes.LearningObjective> {
    // console.log("reparent ()");

    const toSet: Array<contentTypes.LearningObjective> = new Array();

    for (let i = 0; i < fromSet.length; i++) {
      const testLO: contentTypes.LearningObjective = fromSet [i];

      // This LO has a parent, reparent ...
      if (testLO.parent) {
        if ((testLO.parent !== '') && (testLO.parent !== 'unassigned')) {
          //console.log('We have an LO with a parent: ' + testLO.parent);

          // this should be valid since we essentially have a clean fromSet
          for (let j = 0; j < fromSet.length; j++) {
            const tempLO: contentTypes.LearningObjective = fromSet [j];

            if (tempLO.id === testLO.parent) {
              tempLO.children.push(testLO);
            }
          }
        } else {// This LO doesn't have a parent, just add it to the top-level array
          toSet.push(testLO);
        }
      } else {
        toSet.push(testLO);
      }
    }

    return (toSet);
  }

  /**
   *
   */
  pushLO(anLO: contentTypes.LearningObjective, anArray: Array<Object>): void {
    // console.log("pushLO ()");

    // First add the object we're given directly to the array ...

    const testLOContainer: Object = new Object();
    const ephemeral: Object = new Object();

    ephemeral ['@id'] = anLO.id;
    ephemeral ['@category'] = anLO.category;
    ephemeral ['@parent'] = anLO.parent;
    ephemeral ['@expanded'] = anLO.expanded;
    ephemeral ['#text'] = anLO.title;

    // Add all the annotations of type skill to the skill list. Currently
    // we do not define a type on annotations so for now we will assume
    // that all annotations are skills

    ephemeral ['#annotations'] = contentTypes.Linkable.toJSON(anLO.annotations);

    anArray.push({ objective: ephemeral });

    // Then we add any children this LO might have ...

    // console.log("Adding " + anLO.children.length + " children ...");

    for (let j = 0; j < anLO.children.length; j++) {
      this.pushLO(anLO.children [j], anArray);
    }
  }

  toPersistence(): Object {
    // console.log("toPersistence ()");
    const resource: any = this.resource.toPersistence();
    const flatLOs: Array<Object> = new Array ();

    const newData: Object = new Object();
    newData ['objectives'] = new Object();
    newData ['objectives']['@id'] = this.id;
    newData ['objectives']['#array'] = flatLOs;
    newData ['objectives']['#array'].push(LearningObjectiveModel.addTextObject('title', this.title));

    for (let i = 0; i < this.los.length; i++) {
      const tempLO = this.los [i];

      this.pushLO(tempLO, flatLOs);
    }

    // console.log ("To: " + JSON.stringify (newData));
    const root = {
      doc: [newData],
    };

    //console.log('Persisting LO model as: ' + JSON.stringify(root));

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }

  static fromPersistence(json: Object): LearningObjectiveModel {
    const a = (json as any);
    const loObject: Array<Object> = a.doc ['objectives'];

    const newData: Array<contentTypes.LearningObjective> = new Array();
    const newTitle: string = '';
    const newId: string = loObject ['@id'];

    const lObjectiveTest = loObject ['#array'];
    lObjectiveTest.forEach((item) => {
      if (!isNullOrUndefined(item.objective)) {
        newData.push(LearningObjectiveModel.parseLearningObjective(item.objective));
      }
    });

    let model = new LearningObjectiveModel({ los: LearningObjectiveModel.reparent(newData) });
    model = model.with({ resource: contentTypes.Resource.fromPersistence(a) });
    model = model.with({ guid: a.guid });
    model = model.with({ type: a.type });
    model = model.with({ id: a.id });
    model = model.with({ title: a.title });
    if (!isNullOrUndefined(a.lock)) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(a.lock) });
    }
      
    //console.log ("LO fromPersistence: " + JSON.stringify (model));  
      
    return model;
  }

  /**
   * We need to move this to a utility class because there are different instances
   * of it
   */
  static toFlat(aTree: Array<contentTypes.Linkable>, aToList: Array<contentTypes.Linkable>): Array<contentTypes.Linkable> {
    if (!aTree) {
      return [];
    }

    for (let i = 0; i < aTree.length; i++) {
      const newObj: contentTypes.Linkable = new contentTypes.Linkable();
      newObj.id = aTree [i].id;
      newObj.title = aTree [i].title;
      aToList.push(newObj);

      if (aTree [i]['children']) {
        if (aTree [i]['children'].length > 0) {  
          const tList = aTree [i]['children'];
          this.toFlat(tList, aToList);
        }
      }
    }

    return (aToList);
  }
}
