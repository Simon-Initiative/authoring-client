import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import guid from '../../utils/guid';
import { getKey } from '../common';
import { getChildren } from '../content/common';
import { isNullOrUndefined, isArray } from 'util';
import * as types from '../types';

export type OrganizationModelParams = {
  resource?: contentTypes.Resource,
  id?: string,
  version?: string,
  guid?: string,
  type?: string,
  title?: contentTypes.Title,
  organization?: any,
  toplevel?: contentTypes.OrgOrganization,
  lock?: contentTypes.Lock,
};

const defaultOrganizationModel = {
  modelType: 'OrganizationModel',
  resource: new contentTypes.Resource(),
  id: '',
  version: '',
  guid: '',
  type: 'x-oli-organization',
  title: new contentTypes.Title(),
  organization: [],
  toplevel: new contentTypes.OrgOrganization(),
  lock: new contentTypes.Lock(),
};

export class OrganizationModel extends Immutable.Record(defaultOrganizationModel) {
  modelType: 'OrganizationModel';
  resource: contentTypes.Resource;
  id: string;
  version: string;
  guid: string;
  type: string;
  title: contentTypes.Title;
  organization: Array<Object>;
  toplevel: contentTypes.OrgOrganization;
  lock: contentTypes.Lock;

  constructor(params?: OrganizationModelParams) {
    params ? super(params) : super();
  }

  with(values: OrganizationModelParams) {
    return this.merge(values) as this;
  }

  static getTextFromNode(aNode: any): string {
    if (aNode ['#text']) {
      return (aNode ['#text']);
    }

    return ('');
  }

  /**
   * This method exists to handle the specific structure we find in serialized OLI
   * organization content. For example:
   * {
   *      "item" : {
   *          "@scoring_mode" : "default",
   *          "resourceref" : {
   *              "@idref" : "test02a_embedded_workbook"
   *          }
   *      }
   *  }
   */
  getNodeType(aNode: any): string {
    for (const i in aNode) {
      return (i);
    }

    return ('');
  }

  /**
   *
   */
  static getNodeContentType(aNode: any): string {
    if (aNode === null) {
      return '';
    }

    if (aNode ['title']) {
      return ('title');
    }

    if (aNode ['section']) {
      return ('section');
    }

    if (aNode ['sequence']) {
      return ('section');
    }

    if (aNode ['module']) {
      return ('module');
    }

    if (aNode ['item']) {
      return ('item');
    }

    return ('');
  }

  /**
   * Parses a structure that looks like this:
   * {
   *   "item": {
   *            "@scoring_mode": "default",
   *            "resourceref": {
   *              "@idref": "test03_sections_workbook"
   *            }
   *   }
   * },
   */
  static parseItem(anItem: any): contentTypes.OrgItem {
    //console.log ('parseItem ()');
    //console.log (JSON.stringify (anItem));          
      
    const newNode: contentTypes.OrgItem = new contentTypes.OrgItem();

    for (const i in anItem) {
      //console.log ("Examining: " + i);  
      if (i === '#annotations') {
        console.log ("Giving annotations to Linkable: " + JSON.stringify (anItem [i]));  
        newNode.annotations = contentTypes.Linkable.fromJSON(anItem [i]);
      }

      if (i === '@scoring_mode') {
        newNode.scoringMode = anItem [i];
      }

      if (i === 'resourceref') {  
        // newNode.title will be resolved dynamically in the org editor when it mounts
        newNode.resourceRef.idRef = anItem [i]['@idref'];
      }
    }

    return (newNode);
  }

  /**
   *
   */
  static parseSection(aSection: any): contentTypes.OrgSection {
    // console.log("parseSection ()");

    const newNode: contentTypes.OrgSection = new contentTypes.OrgSection();
    newNode.id = aSection ['@id'];
    newNode.expanded = aSection ['@expanded'];
    if (aSection ['#annotations']) {
      newNode.annotations = contentTypes.Linkable.fromJSON(aSection ['#annotations']);
    }

    for (let i = 0; i < aSection ['#array'].length; i++) {
      const potentialSection = aSection ['#array'] [i];

      for (const j in potentialSection) {
        if (j === 'title') {
          newNode.title = OrganizationModel.getTextFromNode(potentialSection [j]);
        }

        if (j === 'item') {
          newNode.addNode(OrganizationModel.parseItem(potentialSection [j]));
        }
      }
    }
    return (newNode);
  }

  /**
   *
   */
  static parseModule(aModule: any): contentTypes.OrgItem {
    // console.log("parseModule ()");

    const moduleNode: contentTypes.OrgModule = new contentTypes.OrgModule();
    moduleNode.id = aModule ['@id'];
    moduleNode.expanded = aModule ['@expanded'];
    if (aModule ['#annotations']) {
      moduleNode.annotations = contentTypes.Linkable.fromJSON(aModule ['#annotations']);
    }

    for (let t = 0; t < aModule ['#array'].length; t++) {
      const mdl = aModule ['#array'] [t];

      const typeSwitch: string = OrganizationModel.getNodeContentType(mdl);

      // console.log("typeSwitch: " + typeSwitch);

      if (typeSwitch === 'title') {
        moduleNode.title = OrganizationModel.getTextFromNode(mdl ['title']);
      }

      if (typeSwitch === 'item') {
        moduleNode.addNode(OrganizationModel.parseItem(mdl ['item']));
      }

      if (typeSwitch === 'section') {
        moduleNode.addNode(OrganizationModel.parseSection(mdl ['section']));
      }
    }

    return (moduleNode);
  }

  /**
   *
   */
  static parseUnit(aUnit: any): contentTypes.OrgItem {
   // console.log("parseUnit ()");

    const unitNode: contentTypes.OrgUnit = new contentTypes.OrgUnit();
    unitNode.id = aUnit ['@id'];
    unitNode.expanded = aUnit ['@expanded'];
    unitNode.duration = aUnit ['@duration'];
    if (aUnit ['#annotations']) {
      unitNode.annotations = contentTypes.Linkable.fromJSON(aUnit ['#annotations']);
    }

    for (let t = 0; t < aUnit ['#array'].length; t++) {
      const mdl = aUnit ['#array'] [t];

      const typeSwitch: string = OrganizationModel.getNodeContentType(mdl);

     // console.log("typeSwitch: " + typeSwitch);

      if (typeSwitch === 'title') {
        unitNode.title = OrganizationModel.getTextFromNode(mdl ['title']);
      }

      if (typeSwitch === 'item') {
        unitNode.addNode(OrganizationModel.parseItem(mdl ['item']));
      }

      if (typeSwitch === 'module') {
        unitNode.addNode(OrganizationModel.parseModule(mdl ['module']));
      }
    }

    return (unitNode);
  }

  /**
   *
   */
  static updateModel(oldModel: OrganizationModel, newOrgModel: any): OrganizationModel {
   // console.log("updateModel ()");
    let model = new OrganizationModel({ organization: newOrgModel });
    model = model.with({ toplevel: oldModel.toplevel });
    model = model.with({ resource: oldModel.resource });
    model = model.with({ id: oldModel.id });
    model = model.with({ version: oldModel.version });
    model = model.with({ guid: oldModel.guid });
    model = model.with({ type: oldModel.type });
    model = model.with({ title: oldModel.title });
    if (!isNullOrUndefined(oldModel.lock)) {
      model = model.with({ lock: oldModel.lock });
    }
    return model;
  }

  /**
   * People might notice that this code is a bit odd because it will return
   * the last organization object under the root. Right now that is by design.
   * That might change as the specs change but at least we won't have to
   * redo the code.
   */
  static parseTopLevelOrganization(aData: any): contentTypes.OrgOrganization {

    // console.log("parseTopLevelOrganization ()");

    const orgNode = new contentTypes.OrgOrganization();// throw away for now

    if (aData) {
      orgNode.id = aData['@id'];
      orgNode.expanded = aData['@expanded'];
      orgNode.version = aData['@version'];
      if (aData['#annotations']) {
        orgNode.annotations = contentTypes.Linkable.fromJSON(aData['#annotations']);
      }
      const oList = aData['#array'];

      if (oList) {
        // if (i=='organization') {
        for (let k = 0; k < oList.length; k++) {
          const obj = oList [k];

          for (const j in obj) {
            const destNode = obj [j];

            if (j === 'title') {
              orgNode.title = OrganizationModel.getTextFromNode(destNode);
            }

            if (j === 'description') {
              orgNode.description = OrganizationModel.getTextFromNode(destNode);
            }

            if (j === 'audience') {
              orgNode.audience = OrganizationModel.getTextFromNode(destNode);
            }
          }
        }
      }
    }

    return (orgNode);
  }

  /**
   *
   */
  static fromPersistence(json: Object): OrganizationModel {
    console.log('fromPersistence ()');

    // console.log("Org model: " + JSON.stringify(json));

    const a = (json as any);
    const orgData = a.doc.organization;

    console.log('Org JSON: ' + JSON.stringify(orgData));

    const newData: Array<contentTypes.OrgSequence> = new Array();
    const newTopLevel: contentTypes.OrgOrganization = OrganizationModel.parseTopLevelOrganization(orgData);

    const oList = orgData['#array'];

    //console.log('Found start of organization data ...');

    if (oList) {
      for (let k = 0; k < oList.length; k++) {

        const obj = oList [k];

        if (!isNullOrUndefined(obj ['sequences'])) {

          const destNode = obj ['sequences']; // [j];

          const seqList = getChildren(destNode);

          for (let w = 0; w < seqList.length; w++) {
            const seqObj = seqList [w];
            if (seqObj ['sequence']) { // checking to make absolutely sure we're in the right place
              //console.log('Parsing sequence ...');
              const newSequence: contentTypes.OrgSequence = new contentTypes.OrgSequence();
              const seqReference = seqObj ['sequence'];
              newData.push(newSequence);
              newSequence.id = seqReference['@id'];
              newSequence.expanded = seqReference['@expanded'];
              newSequence.category = seqReference['@category'];
              newSequence.audience = seqReference['@audience'];
              if (seqReference ['#annotations']) {
                newSequence.annotations = contentTypes.Linkable.fromJSON(seqReference ['#annotations']);
              }
              const sequenceList: Array<any> = seqReference ['#array'];

              for (let t = 0; t < sequenceList.length; t++) {
                const seq = sequenceList [t];

                for (const s in seq) {
                  const mdl = seq [s];

                  if (s === 'title') {
                    //console.log('Found sequence title: ' + OrganizationModel.getTextFromNode(mdl));
                    newSequence.title = OrganizationModel.getTextFromNode(mdl);
                  }

                  if (s === 'module') {
                    const newModule = OrganizationModel.parseModule(mdl);
                    newSequence.children.push(newModule);
                  }

                  if (s === 'unit') {
                    const newUnit = OrganizationModel.parseUnit(mdl);
                    newSequence.children.push(newUnit);
                  }
                }
              }
            }
          }
        }
        /*  
        else {
          console.log("Error: unable to find sequence data");
        }
        */
      }
    }

    // console.log("toplevel: " + JSON.stringify(newTopLevel));
    console.log('Org treedata: ' + JSON.stringify(newData));

    let model = new OrganizationModel({ toplevel: newTopLevel, organization: newData });

    model = model.with({ resource: contentTypes.Resource.fromPersistence(a) });
    model = model.with({ guid: a.guid });
    model = model.with({ id: a.id });
    model = model.with({ version: a.doc.organization['@version'] });
    model = model.with({ type: a.type });
    model = model.with({ title: new contentTypes.Title({ guid: guid(), text: a.title }) });
    if (a.lock !== undefined && a.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(a.lock) });
    }

    return model;
  }

  /**
   *
   */   
  orgItemToJSON (testObject:any) {
    // console.log ("orgItemToJSON ("+testObject.title+")");
              
    const newObject: Object = new Object();
    newObject ['@id'] = testObject.id;
    newObject ['@expanded'] = testObject.expanded;
      
    if (testObject.orgType === contentTypes.OrgContentTypes.Item) {
      newObject['@scoring_mode'] = testObject.scoringMode;
      newObject['resourceref'] = new Object ();
      newObject['resourceref']['@idref'] = testObject.resourceRef.idRef;        
      if (testObject ['annotations']) {
        newObject ['#annotations'] = contentTypes.Linkable.toJSON(testObject ['annotations']);
      }        
    } else {        
      newObject ['#array'] = new Array();
      newObject ['#array'].push(contentTypes.OrgItem.addTextObject('title', testObject.title));
      if (testObject ['annotations']) {
        newObject ['#annotations'] = contentTypes.Linkable.toJSON(testObject ['annotations']);
      }
      if (testObject.orgType === contentTypes.OrgContentTypes.Sequence) {
        if (testObject ['category']) {    
          newObject ['@category'] = testObject.category;
        }
            
        if (testObject ['audience']) {        
          newObject ['@audience'] = testObject.audience;
        }    
      }       
     
      if (testObject ['children']) {
        for (let i = 0;i < testObject ['children'].length; i++) {
          
          const subObject:any = testObject ['children'][i];
            
          if (subObject.orgType === contentTypes.OrgContentTypes.Sequence) {  
            newObject ['#array'].push({ sequence: this.orgItemToJSON (subObject) });
          }
          
          if (subObject.orgType === contentTypes.OrgContentTypes.Module) {  
            newObject ['#array'].push({ module: this.orgItemToJSON (subObject) });
          }
          
          if (subObject.orgType === contentTypes.OrgContentTypes.Unit) {  
            newObject ['#array'].push({ unit: this.orgItemToJSON (subObject) });
          }
          
          if (subObject.orgType === contentTypes.OrgContentTypes.Section) {  
            newObject ['#array'].push({ section: this.orgItemToJSON (subObject) });
          }
          
          if (subObject.orgType === contentTypes.OrgContentTypes.Item) {  
            newObject ['#array'].push({ item: this.orgItemToJSON (subObject) });
          }          
        }
      }  
    } 
      
    return (newObject);  
  }      
    
  /**
   *
   */
  toPersistence(): Object {
    console.log('toPersistence ()');

    const newData = this.organization;

    console.log('Persisting from visual tree: ' + JSON.stringify(this.organization));

    // First process our organization object and add it to the tree we're building

    const orgObject: contentTypes.OrgOrganization = this.toplevel;
    orgObject.title = this.title.text;
    const orgRoot: Object = (new contentTypes.OrgOrganization()).toJSONObject(orgObject);

    const seqRoot = new Object();
    orgRoot ['modelType'] = 'OrganizationModel';
    orgRoot ['title'] = this.title.text;
    orgRoot ['organization']['#array'].push(seqRoot);
    orgRoot ['organization']['@id'] = this.id;
    orgRoot ['organization']['@version'] = this.version;
      
    const sequences: Array<Object> = new Array();
      
    seqRoot ['sequences'] = new Object();
    seqRoot ['sequences']['#array'] = new Array();
    seqRoot ['sequences']['#array'] = sequences;

    // We can point directly to .children because we ensure in the constructor that
    // this object always exists

    console.log('Persisting ' + newData.length + ' items ...');
      
    for (let j = 0; j < newData.length; j++) {
      const testObject: contentTypes.OrgItem = newData [j] as contentTypes.OrgItem; // Start with the lowest level and detect what it actually is
              
      if (testObject.orgType === contentTypes.OrgContentTypes.Sequence) {         
        sequences.push({ sequence: this.orgItemToJSON (testObject) });
      }
        
      if (testObject.orgType === contentTypes.OrgContentTypes.Module) {         
        sequences.push({ module: this.orgItemToJSON (testObject) });
      }
        
      if (testObject.orgType === contentTypes.OrgContentTypes.Unit) {         
        sequences.push({ unit: this.orgItemToJSON (testObject) });
      }
        
      if (testObject.orgType === contentTypes.OrgContentTypes.Section) {         
        sequences.push({ section: this.orgItemToJSON (testObject) });
      }
        
      if (testObject.orgType === contentTypes.OrgContentTypes.Item) {         
        sequences.push({ item: this.orgItemToJSON (testObject) });
      }        
    }  

    const formattedOrganization = JSON.stringify(orgRoot ['organization']);
    console.log('To: ' + formattedOrganization);

    const resource = this.resource.toPersistence();
    const doc = [{
      organization: orgRoot['organization'],
    }];

    const root = {
      doc,
    };

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }

}
