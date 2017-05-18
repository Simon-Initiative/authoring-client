import * as Immutable from "immutable";
import * as types from "./types";
import * as contentTypes from "./contentTypes";
import {getKey} from "./common";
import guid from "../utils/guid";
import {MetaData} from "./metadata";
import {WebContent} from "./webcontent";
import {Resource} from "./resource";
import Linkable from "./linkable";
import {Skill} from "./skills";
import {LearningObjective} from "./los";
import {OrgContentTypes, OrgItem, OrgModule, OrgOrganization, OrgSection, OrgSequence} from "./org";
import {isArray, isNullOrUndefined} from "util";
import {assessmentTemplate} from "./activity_templates";


export type EmptyModel = 'EmptyModel';
export const EmptyModel: EmptyModel = 'EmptyModel';

export const ModelTypes = types.strEnum([
  'CourseModel',
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

export function createModel(object: any): ContentModel {
  console.log("createModel ()");
  switch (object.type) {
    case 'x-oli-package':
      return CourseModel.fromPersistence(object);
    case 'x-oli-workbook_page':
      return WorkbookPageModel.fromPersistence(object);
    case 'x-oli-assessment2':
      return AssessmentModel.fromPersistence(object);
    case 'x-oli-inline-assessment':
      return AssessmentModel.fromPersistence(object);
    case 'x-oli-organization':
      return OrganizationModel.fromPersistence(object);
    case 'x-oli-learning_objectives':
      return LearningObjectiveModel.fromPersistence(object);
    case 'x-oli-skill_model':
      return SkillModel.fromPersistence(object);
    case 'x-oli-webcontent':
      return MediaModel.fromPersistence(object);
  }
}

export type CourseModelParams = {
  rev?: number,
  guid?: string,
  id?: string,
  version?: string,
  title?: string,
  type?: string,
  description?: string,
  metadata?: MetaData,
  options?: string,
  icon?: WebContent,
  resources?: Immutable.OrderedMap<string, Resource>,
  webContents?: Immutable.OrderedMap<string, WebContent>
};

const defaultCourseModel = {
  modelType: 'CourseModel',
  rev: 0,
  guid: '',
  id: '',
  version: '',
  type: 'x-oli-package',
  title: '',
  description: '',
  metadata: new MetaData(),
  options: '',
  icon: new WebContent(),
  resources: Immutable.OrderedMap<string, Resource>(),
  webContents: Immutable.OrderedMap<string, WebContent>()
}

export class CourseModel extends Immutable.Record(defaultCourseModel) {
  modelType: 'CourseModel';
  rev: number;
  guid: string;
  id: string;
  version: string;
  title: string;
  type: string;
  description: string;
  metadata: MetaData;
  options: string;
  icon: WebContent;
  resources: Immutable.OrderedMap<string, Resource>;
  webContents: Immutable.OrderedMap<string, WebContent>;

  constructor(params?: CourseModelParams) {
    params ? super(params) : super();
  }

  with(values: CourseModelParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): CourseModel {
    let model = new CourseModel();
    const c = json as any;
    model = model.with({rev: c.rev});
    model = model.with({guid: c.guid});
    model = model.with({id: c.id});
    model = model.with({version: c.version});
    model = model.with({title: c.title});
    model = model.with({type: c.type});
    model = model.with({description: c.description});
    model = model.with({options: JSON.stringify(c.options)});
    if (c.metadata.jsonObject) {
      model = model.with({metadata: MetaData.fromPersistence(c.metadata.jsonObject)});
    }
    if (c.icon) {
      model = model.with({icon: WebContent.fromPersistence(c.icon)});
    }
    if (c.resources) {
      c.resources.forEach(item => {
        const id = item.guid;
        model = model.with({resources: model.resources.set(id, Resource.fromPersistence(item))});
      });
    }
    if (c.webContents) {
      c.webContents.forEach(item => {
        const id = item.guid;
        model = model.with({webContents: model.webContents.set(id, WebContent.fromPersistence(item))});
      });
    }
    return model;
  }

  toPersistence(): Object {
    let doc = [{
      "package": {
        "@id": this.id,
        "icon": this.icon.toPersistence(),
        "title": this.title,
        "@version": this.version,
        "metadata": this.metadata.toPersistence(),
        "description": this.description,
        "preferences": this.options
      }
    }];
    const values = {
      modelType: 'CourseModel',
      guid: this.guid,
      id: this.id,
      version: this.version,
      title: this.title,
      type: this.type,
      description: this.description,
      "doc": doc
    }
    return Object.assign({}, values);
  }
}

export type WorkbookPageModelParams = {
  resource?: Resource,
  guid?: string,
  type?: string;
  head?: contentTypes.Head,
  body?: contentTypes.Html,
  lock?: contentTypes.Lock
};

const defaultWorkbookPageModelParams = {
  modelType: 'WorkbookPageModel',
  resource: new Resource(),
  guid: '',
  type: 'x-oli-workbook_page',
  head: new contentTypes.Head(),
  body: new contentTypes.Html(),
  lock: new contentTypes.Lock()
}

export class WorkbookPageModel extends Immutable.Record(defaultWorkbookPageModelParams) {

  modelType: 'WorkbookPageModel';
  resource: Resource;
  guid: string;
  type: string;
  head: contentTypes.Head;
  body: contentTypes.Html;
  lock: contentTypes.Lock;

  constructor(params?: WorkbookPageModelParams) {
    params ? super(params) : super();
  }

  with(values: WorkbookPageModelParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): WorkbookPageModel {
    let model = new WorkbookPageModel();

    let wb = (json as any);
    model = model.with({resource: Resource.fromPersistence(wb)});
    model = model.with({guid: wb.guid});
    model = model.with({type: wb.type});
    if (wb.lock !== undefined && wb.lock !== null) {
      model = model.with({lock: contentTypes.Lock.fromPersistence(wb.lock)});
    }

    let workbook = null;
    if(isArray(wb.doc)){
      workbook = wb.doc[0].workbook_page;
    }else{
      workbook = wb.doc.workbook_page;
    }
    workbook['#array'].forEach(item => {

      const key = getKey(item);
      const id = guid();

      switch (key) {
        case 'head':
          model = model.with({head: contentTypes.Head.fromPersistence(item, id)})
          break;
        case 'body':
          model = model.with({body: contentTypes.Html.fromPersistence(item, id)})
          break;
        default:
      }
    });

    return model;
  }

  toPersistence(): Object {

    let doc = null
    if (isNullOrUndefined(this.guid) || this.guid === '') {
      //Assume new document if guid is null
      // Generate artificial id from title
      try {
        const title = this.head.title.text;
        const id = title.split(" ")[0] + guid();
        this.resource = new Resource({id: id, title: title});
      } catch (err){
        return null;
      }
      doc = [{
        "workbook_page": {
          "@id": this.resource.id,
          "#array": [
            this.head.toPersistence(),
            {
              "body": {
                "p": {
                  "#text": "(This space intentionally left blank.)"
                }
              }
            }
          ]
        }
      }];
    } else {
      doc = [{
        "workbook_page": {
          "@id": this.resource.id,
          "#array": [
            this.head.toPersistence(),
            {body: this.body.toPersistence()}
          ]
        }
      }];
    }
    const root = {
      "doc": doc
    };
    let resource = this.resource.toPersistence();
    return Object.assign({}, resource, root, this.lock.toPersistence());
  }

}

export type AssessmentModelParams = {
  resource?: Resource,
  guid?: string,
  type?: string;
  lock?: contentTypes.Lock,
  title?: contentTypes.Title,
  nodes?: Immutable.OrderedMap<string, Node>
};
const defaultAssessmentModelParams = {
  modelType: 'AssessmentModel',
  type: '',
  resource: new Resource(),
  guid: '',
  lock: new contentTypes.Lock(),
  title: new contentTypes.Title(),
  nodes: Immutable.OrderedMap<string, Node>()
}


export type Node = contentTypes.Question | contentTypes.Content | contentTypes.Unsupported;

export class AssessmentModel extends Immutable.Record(defaultAssessmentModelParams) {

  modelType: 'AssessmentModel';
  resource: Resource;
  guid: string;
  type: string;
  lock: contentTypes.Lock;
  title: contentTypes.Title;
  nodes: Immutable.OrderedMap<string, Node>;

  constructor(params?: AssessmentModelParams) {
    params ? super(params) : super();
  }

  with(values: AssessmentModelParams): AssessmentModel {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): AssessmentModel {

    let model = new AssessmentModel();

    const a = (json as any);
    model = model.with({resource: Resource.fromPersistence(a)});
    model = model.with({guid: a.guid});
    model = model.with({type: a.type});
    model = model.with({title: new contentTypes.Title({guid: guid(), text: a.title})});
    if (a.lock !== undefined && a.lock !== null) {
      model = model.with({lock: contentTypes.Lock.fromPersistence(a.lock)});
    }
    let assessment = null;
    if(isArray(a.doc)){
      assessment = a.doc[0].assessment;
    }else{
      assessment = a.doc.assessment;
    }
    assessment['#array'].forEach(item => {

      const key = getKey(item);
      const id = guid();

      switch (key) {
        case 'question':
          model = model.with({nodes: model.nodes.set(id, contentTypes.Question.fromPersistence(item, id))})
          break;
        case 'content':
          model = model.with({nodes: model.nodes.set(id, contentTypes.Content.fromPersistence(item, id))})
          break;
        default:
          model = model.with({nodes: model.nodes.set(id, contentTypes.Unsupported.fromPersistence(item, id))})
      }
    });

    return model;
  }

  toPersistence(): Object {
    const children = [
      this.title.toPersistence(),
      ...this.nodes.toArray().map(node => node.toPersistence()),
    ]
    let doc = null;
    //Assume new document if guid is null
    if (isNullOrUndefined(this.guid) || this.guid === '') {
      const assessment = assessmentTemplate(this.title.text);
      try {
        const id = assessment.assessment['@id'];
        this.resource = new Resource({id: id, title: this.title.text});
      } catch (err){
        return null;
      }
      doc = [
        assessment
      ];

    } else {
      doc = [{
        "assessment": {
          "@id": "id",
          "#array": children
        }
      }];
    }
    const root = {
      "doc": doc
    };
    let resource = this.resource.toPersistence();
    return Object.assign({}, resource, root, this.lock.toPersistence());
  }
}

export type OrganizationModelParams = {
  resource?: Resource,
  guid?: string,
  type?: string,
  title?: contentTypes.Title,
  organization?: any,
  toplevel?: OrgOrganization,
  lock?: contentTypes.Lock
};

const defaultOrganizationModel = {
  modelType: 'OrganizationModel',
  resource: new Resource(),
  guid: '',
  type: 'x-oli-organization',
  title: new contentTypes.Title(),
  organization: [],
  toplevel: null,
  lock: new contentTypes.Lock()
}

export class OrganizationModel extends Immutable.Record(defaultOrganizationModel) {
  modelType: 'OrganizationModel';
  resource: Resource;
  guid: string;
  type: string;
  title: contentTypes.Title;
  organization: Array<Object>;
  toplevel: OrgOrganization;
  lock: contentTypes.Lock;

  constructor(params?: OrganizationModelParams) {
    console.log("constructor ()");
    params ? super(params) : super();
  }

  with(values: OrganizationModelParams) {
    return this.merge(values) as this;
  }

  static getTextFromNode(aNode: any): string {
    console.log("getTextFromNode: " + JSON.stringify(aNode));

    // Check for old style text nodes
    if (aNode ['#text']) {
      return (aNode ['#text']);
    }

    return ("");
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
    for (var i in aNode) {
      return (i);
    }

    return ("");
  }

  /**
   *
   */
  static getNodeContentType(aNode: any): string {
    if (aNode == null) {
      return "";
    }

    if (aNode ["title"]) {
      return ("title");
    }

    if (aNode ["section"]) {
      return ("section");
    }

    if (aNode ["sequence"]) {
      return ("section");
    }

    if (aNode ["module"]) {
      return ("module");
    }

    if (aNode ["item"]) {
      return ("item");
    }

    return ("");
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
  static parseItem(anItem: any): OrgItem {
    var newNode: OrgItem = new OrgItem();

    for (var i in anItem) {
      if (i == "#annotations") {
        newNode.annotations = Linkable.fromJSON(anItem [i]["#annotations"]);
      }

      if (i == "@scoring_mode") {
        newNode.scoringMode = anItem [i];
      }

      if (i == "resourceref") {
        newNode.title = anItem [i]["@idref"];
        //newNode.expanded=anItem [i]["@expanded"];
        newNode.resourceRef.idRef = anItem [i]["@idref"];
      }
    }

    return (newNode);
  }

  /**
   *
   */
  static parseSection(aSection: any): OrgSection {
    console.log("parseSection ()");

    var newNode: OrgSection = new OrgSection();
    newNode.id = aSection ["@id"];
    newNode.expanded = aSection ["@expanded"];
    if (aSection ["#annotations"]) {
      newNode.annotations = Linkable.fromJSON(aSection ["#annotations"]);
    }

    for (var i = 0; i < aSection ["#array"].length; i++) {
      var potentialSection = aSection ["#array"] [i];

      for (var j in potentialSection) {
        if (j == "title") {
          newNode.title = OrganizationModel.getTextFromNode(potentialSection [j]);
        }

        if (j == "item") {
          newNode.addNode(OrganizationModel.parseItem(potentialSection [j]));
        }
      }
    }
    return (newNode);
  }

  /**
   *
   */
  static parseModule(aModule: any): OrgItem {
    console.log("parseModule ()");

    let moduleNode: OrgModule = new OrgModule();
    moduleNode.id = aModule ["@id"];
    moduleNode.expanded = aModule ["@expanded"];
    if (aModule ["#annotations"]) {
      moduleNode.annotations = Linkable.fromJSON(aModule ["#annotations"]);
    }

    for (var t = 0; t < aModule ["#array"].length; t++) {
      var mdl = aModule ["#array"] [t];

      var typeSwitch: string = OrganizationModel.getNodeContentType(mdl);

      if (typeSwitch == "title") {
        //console.log ("Found module title: " + this.getTextFromNode (mdl ["title"]));
        moduleNode.title = OrganizationModel.getTextFromNode(mdl ["title"]);
      }

      if (typeSwitch == "item") {
        moduleNode.addNode(OrganizationModel.parseItem(mdl ["item"]));
      }

      if (typeSwitch == "section") {
        moduleNode.addNode(OrganizationModel.parseSection(mdl ["section"]));
      }
    }

    //console.log ("Result " + JSON.stringify (moduleNode));

    return (moduleNode);
  }

  /**
   *
   */
  static updateModel(newTopLevel: OrgOrganization, newOrgModel: any): OrganizationModel {
    console.log("updateModel ()");
    var newModel = new OrganizationModel({'toplevel': newTopLevel, 'organization': newOrgModel});
    return newModel;
  }

  /**
   * People might notice that this code is a bit odd because it will return
   * the last organization object under the root. Right now that is by design.
   * That might change as the specs change but at least we won't have to
   * redo the code.
   */
  static parseTopLevelOrganization(aData: any): OrgOrganization {

    console.log("parseTopLevelOrganization ()");

    let orgNode = new OrgOrganization();// throw away for now

    if (aData) {
      //for (let i in aData) {
      //orgNode=new OrgOrganization ();// throw away for now
      orgNode.id = aData["@id"];
      orgNode.expanded = aData["@expanded"];
      orgNode.version = aData["@version"];
      if (aData["#annotations"]) {
        orgNode.annotations = Linkable.fromJSON(aData["#annotations"]);
      }
      let oList = aData["#array"];

      if (oList) {
        //if (i=='organization') {
        for (let k = 0; k < oList.length; k++) {
          let obj = oList [k];

          for (let j in obj) {
            let destNode = obj [j];

            if (j == 'title') {
              orgNode.title = OrganizationModel.getTextFromNode(destNode);
            }

            if (j == 'description') {
              orgNode.description = OrganizationModel.getTextFromNode(destNode);
            }

            if (j == 'audience') {
              orgNode.audience = OrganizationModel.getTextFromNode(destNode);
            }
          }
        }
        //}
      }
      //}
    }

    return (orgNode);
  }

  /**
   *
   */
  static fromPersistence(json: Object): OrganizationModel {
    console.log("fromPersistence ()");

    //var orgData:Array<Object>=json ["organization"];
    let a = (json as any);
    var orgData = a.doc.organization;

    console.log("Org JSON: " + JSON.stringify(orgData));

    var newData: Array<OrgSequence> = new Array();
    var newTopLevel: OrgOrganization = OrganizationModel.parseTopLevelOrganization(orgData);

    //for (var i in orgData) {
    var oList = orgData["#array"];

    //if (i=='organization') {
    console.log("Found start of organization data ...");

    if (oList) {
      for (var k = 0; k < oList.length; k++) {
        var obj = oList [k];
        if (!isNullOrUndefined(obj.sequences)) {
          //for (var j in obj) {
          var destNode = obj.sequences;// [j];
          if (isArray(destNode)) {
            //if (j == 'sequences') {
            //for (var sequenceObject in destNode) {
            for (let w = 0; w < destNode.length; w++) {
              let seqObj = destNode [w];
              if (seqObj ["sequence"]) { // checking to make absolutely sure we're in the right place
                let newSequence: OrgSequence = new OrgSequence();
                let seqReference = seqObj ["sequence"];
                newData.push(newSequence);
                newSequence.id = seqReference["@id"];
                newSequence.expanded = seqReference["@expanded"];
                newSequence.category = seqReference["@category"];
                newSequence.audience = seqReference["@audience"];
                if (seqReference ["#annotations"]) {
                  newSequence.annotations = Linkable.fromJSON(seqReference ["#annotations"]);
                }
                var sequenceList: Array<any> = seqReference ["#array"];

                for (var t = 0; t < sequenceList.length; t++) {
                  var seq = sequenceList [t];

                  for (var s in seq) {
                    var mdl = seq [s];

                    if (s == "title") {
                      console.log("Found sequence title: " + OrganizationModel.getTextFromNode(mdl));
                      newSequence.title = OrganizationModel.getTextFromNode(mdl);
                    }

                    if (s == "module") {
                      let newModule = OrganizationModel.parseModule(mdl);
                      newSequence.children.push(newModule);
                    }
                  }
                }
              }
            }
          } else if (!isNullOrUndefined(destNode.sequence)) {
            let newSequence: OrgSequence = new OrgSequence();
            let seqReference = destNode.sequence;
            newData.push(newSequence);
            newSequence.id = seqReference["@id"];
            newSequence.expanded = seqReference["@expanded"];
            newSequence.category = seqReference["@category"];
            newSequence.audience = seqReference["@audience"];
            if (seqReference ["#annotations"]) {
              newSequence.annotations = Linkable.fromJSON(seqReference ["#annotations"]);
            }
            var sequenceList: Array<any> = seqReference ["#array"];

            for (var t = 0; t < sequenceList.length; t++) {
              var seq = sequenceList [t];

              for (var s in seq) {
                var mdl = seq [s];

                if (s == "title") {
                  console.log("Found sequence title: " + OrganizationModel.getTextFromNode(mdl));
                  newSequence.title = OrganizationModel.getTextFromNode(mdl);
                }

                if (s == "module") {
                  let newModule = OrganizationModel.parseModule(mdl);
                  newSequence.children.push(newModule);
                }
              }
            }
          }
          //}
        }
        //}
      }
    }
    //}
    //}

    console.log("toplevel: " + JSON.stringify(newTopLevel));
    console.log("newData: " + JSON.stringify(newData));

    let model = (OrganizationModel.updateModel(newTopLevel, newData));

    model = model.with({resource: Resource.fromPersistence(a)});
    model = model.with({guid: a.guid});
    model = model.with({type: a.type});
    model = model.with({title: new contentTypes.Title({guid: guid(), text: a.title})});
    if (a.lock !== undefined && a.lock !== null) {
      model = model.with({lock: contentTypes.Lock.fromPersistence(a.lock)});
    }

    return model;
  }

  /**
   *
   */
  toPersistence(): Object {
    console.log("toPersistence ()");

    var newData = this.organization;

    console.log("Persisting from visual tree: " + JSON.stringify(this.organization));

    // First process our organization object and add it to the tree we're building

    let orgObject: OrgOrganization = this.toplevel;

    let orgRoot: Object = (new OrgOrganization()).toJSONObject(orgObject);
    let seqRoot = new Object();
    orgRoot ["modelType"] = "OrganizationModel";
    orgRoot ["title"] = this.title;
    orgRoot ["organization"]["#array"].push(seqRoot);

    let sequences: Array<Object> = new Array();
    seqRoot ["sequences"] = sequences;

    // We can point directly to .children because we ensure in the constructor that
    // this object always exists

    console.log("Persisting " + newData.length + " items ...");

    for (let j = 0; j < newData.length; j++) {
      let seqObject: OrgSequence = newData [j] as OrgSequence;

      let sequence: Object = new Object();
      sequence ["@id"] = seqObject.id;
      sequence ["@expanded"] = seqObject.expanded;
      sequence ["@category"] = seqObject.category;
      sequence ["@audience"] = seqObject.audience;
      if (seqObject ["annotations"]) {
        sequence ["#annotations"] = Linkable.toJSON(seqObject ["annotations"]);
      }
      sequence ["#array"] = new Array();
      sequence ["#array"].push(OrgItem.addTextObject("title", seqObject.title));

      sequences.push({"sequence": sequence});

      for (let k = 0; k < seqObject.children.length; k++) {
        let mObj: OrgItem = seqObject.children [k];

        // Check the type here. We can expect Module, Section and Item
        console.log("Object: " + mObj.orgType);

        let moduleContainer: Object = new Object();
        let moduleObj: Object = new Object();
        moduleContainer ["module"] = moduleObj;

        sequence ["#array"].push(moduleContainer);

        moduleObj["@id"] = mObj.id;
        moduleObj ["@expanded"] = mObj.expanded;
        if (moduleObj ["annotations"]) {
          moduleObj ["#annotations"] = Linkable.toJSON(moduleObj ["annotations"]);
        }
        moduleObj["#array"] = new Array();
        moduleObj["#array"].push(OrgItem.addTextObject("title", mObj.title));

        for (let l = 0; l < mObj.children.length; l++) {
          console.log("Section: " + mObj.children [l].title);

          let sObj: OrgItem = mObj.children [l];

          let sectionObj: Object = new Object();
          let sectionContainer: Object = new Object();
          sectionContainer ["section"] = sectionObj;

          moduleObj["#array"].push(sectionContainer);

          sectionObj ["#id"] = sObj.id;
          sectionObj ["@expanded"] = sObj.expanded;
          if (sectionObj ["annotations"]) {
            sectionObj ["#annotations"] = Linkable.toJSON(sectionObj ["annotations"]);
          }
          sectionObj ["#array"] = new Array();
          sectionObj ["#array"].push(OrgItem.addTextObject("title", sObj.title));

          for (let m = 0; m < sObj.children.length; m++) {
            let iObj = sObj.children [m];

            if (iObj.orgType == OrgContentTypes.Item) {
              var itemObj: OrgItem = iObj as OrgItem;
              sectionObj ["#array"].push(new OrgItem().toJSONObject(iObj));
            }
            else {
              console.log("Error: undefined type found at this level: " + iObj.orgType);
            }
          }
        }
      }
    }

    var formattedOrganization = JSON.stringify(orgRoot);
    console.log("To: " + formattedOrganization);

    return orgRoot;
  }

}

//>------------------------------------------------------------------

export type LearningObjectiveModelParams = {
  resource?: Resource,
  guid?: string,
  type?: string,
  id?: string,
  title?: string,
  los?: Array<LearningObjective>,
  lock?: contentTypes.Lock
};

const defaultLearningObjectiveModel = {
  resource: new Resource(),
  guid: '',
  type: 'x-oli-learning_objectives',
  id: '',
  title: '',
  modelType: 'LearningObjectiveModel',
  los: [],
  lock: new contentTypes.Lock()

}

export class LearningObjectiveModel extends Immutable.Record(defaultLearningObjectiveModel) {
  modelType: 'LearningObjectiveModel';
  resource: Resource;
  guid: string;
  type: string;
  los: Array<LearningObjective>;
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
   *
   */
  static parseLearningObjective(anObjective: Object): LearningObjective {

    var newLO: LearningObjective = new LearningObjective();

    newLO.id = anObjective ["@id"];
    newLO.title = anObjective ["#text"];
    newLO.category = anObjective ["@category"];
    newLO.parent = anObjective ["@parent"];
    newLO.expanded = anObjective ["@expanded"];
    if (anObjective ["#annotations"]) {
      newLO.annotations = Linkable.fromJSON(anObjective ["#annotations"]);
    }

    return (newLO);
  }

  static updateModel(treeData: any): LearningObjectiveModel {
    console.log("updateModel ()");
    var newModel = new LearningObjectiveModel({'los': treeData});
    return newModel;
  }

  static addTextObject(aText, aValue) {
    let newTextObject: Object = new Object();
    newTextObject [aText] = new Object();
    newTextObject [aText]["#text"] = aValue;
    return (newTextObject);
  }

  /**
   * Takes a list of learning objective objects and creates a tree of those
   * objects based on the parent parameter.
   */
  static reparent(fromSet: Array<LearningObjective>): Array<LearningObjective> {
    console.log("reparent ()");

    let toSet: Array<LearningObjective> = new Array();

    for (let i = 0; i < fromSet.length; i++) {
      let testLO: LearningObjective = fromSet [i];

      // This LO has a parent, reparent ...
      if ((testLO.parent != "") && (testLO.parent != "unassigned")) {
        console.log("We have an LO with a parent: " + testLO.parent);

        // this should be valid since we essentially have a clean fromSet
        for (let j = 0; j < fromSet.length; j++) {
          let tempLO: LearningObjective = fromSet [j];

          if (tempLO.id == testLO.parent) {
            tempLO.children.push(testLO);
          }
        }
      } // This LO doesn't have a parent, just add it to the top-level array
      else {
        toSet.push(testLO);
      }
    }

    return (toSet);
  }

  /**
   *
   */
  pushLO(anLO: LearningObjective, anArray: Array<Object>): void {
    console.log("pushLO ()");

    // First add the object we're given directly to the array ...

    var testLOContainer: Object = new Object();
    var ephemeral: Object = new Object();

    ephemeral ["@id"] = anLO.id;
    ephemeral ["@category"] = anLO.category;
    ephemeral ["@parent"] = anLO.parent;
    ephemeral ["@expanded"] = anLO.expanded;
    ephemeral ["#text"] = anLO.title;

    // Add all the annotations of type skill to the skill list. Currently
    // we do not define a type on annotations so for now we will assume
    // that all annotations are skills

    ephemeral ["#annotations"] = Linkable.toJSON(anLO.annotations);

    anArray.push({"objective": ephemeral});

    // Then we add any children this LO might have ...

    console.log("Adding " + anLO.children.length + " children ...");

    for (let j = 0; j < anLO.children.length; j++) {
      this.pushLO(anLO.children [j], anArray);
    }
  }

  toPersistence(): Object {
    console.log("toPersistence ()");

    let flatLOs: Array<Object> = new Array();

    var newData: Object = new Object();
    newData ["objectives"] = new Object();
    newData ["objectives"]["@id"] = this.id;
    newData ["objectives"]["#array"] = flatLOs;
    newData ["objectives"]["#array"].push(LearningObjectiveModel.addTextObject("title", this.title));

    for (var i = 0; i < this.los.length; i++) {
      let tempLO = this.los [i];

      this.pushLO(tempLO, flatLOs);
    }

    //console.log ("To: " + JSON.stringify (newData));

    const root = {
      "modelType": "LearningObjectiveModel",
      "learningobjectives": newData
    };

    return (root);
  }

  static fromPersistence(json: Object): LearningObjectiveModel {

    console.log("LearningObjectiveModel.fromPersistence: " + JSON.stringify(json));
    let a = (json as any);
    //var obData=a.doc.objectives;
    let loObject: Array<Object> = a.doc ["objectives"];

    let newData: Array<LearningObjective> = new Array();
    let newTitle: string = "";
    let newId: string = loObject ["@id"];

    //for (var i in loObject) {
    //   if (i == "title") {
    //     newTitle = loObject ["title"]["#text"];
    //   }

    //if (i == "objectives") {
    //console.log("Found objectives, parsing ...");
    // let loRoot = loObject [i];

    //for (var j = 0; j < loRoot ["#array"].length; j++) {
    let lObjectiveTest = loObject ["#array"];//[j];
    lObjectiveTest.forEach(function (item: any) {
      if (!isNullOrUndefined(item.objective)) {
        newData.push(LearningObjectiveModel.parseLearningObjective(item.objective));
        console.log("New DAta " +JSON.stringify(newData));
      }
    });

    // for (var k in lObjectiveTest) {
    //   if (k == "objective") {
    //     newData.push(LearningObjectiveModel.parseLearningObjective(lObjectiveTest [k]));
    //   }
    //}
    //}
    //}
    //}LearningObjectiveModel.reparent(newData)
    let model = new LearningObjectiveModel({'los': newData});
    model = model.with({resource: Resource.fromPersistence(a)});
    model = model.with({guid: a.guid});
    model = model.with({type: a.type});
    model = model.with({id: a.id});
    model = model.with({title: a.title})
    if (!isNullOrUndefined(a.lock)) {
      model = model.with({lock: contentTypes.Lock.fromPersistence(a.lock)});
    }
    return model
  }
}

//>------------------------------------------------------------------

export type SkillModelParams = {
  resource?: Resource,
  guid?: string,
  type?: string,
  lock?: contentTypes.Lock,
  title?: contentTypes.Title,
  skills?: any
};

const defaultSkillModel = {
  modelType: 'SkillModel',
  resource: new Resource(),
  guid: '',
  type: 'x-oli-skills',
  lock: new contentTypes.Lock(),
  title: new contentTypes.Title(),
  skillDefaults: Skill,
  skills: []
}

export class SkillModel extends Immutable.Record(defaultSkillModel) {
  modelType: 'SkillModel';
  resource: Resource;
  guid: string;
  type: string;
  lock: contentTypes.Lock;
  title: contentTypes.Title;
  skillDefaults: Skill;
  skills: Array<Skill>;

  constructor(params?: SkillModelParams) {
    console.log("constructor ()");
    params ? super(params) : super();
    //super();
  }


  with(values: SkillModelParams) {
    return this.merge(values) as this;
  }


  static updateModel(newSkillModel: any): SkillModel {
    console.log("updateModel ()");
    var newModel = new SkillModel({'skills': newSkillModel});
    return newModel;
  }

  toPersistence(): Object {
    console.log("toPersistence ()");
    const root = {
      "modelType": "SkillModel",
      "title": this.title,
      "skills": this.skills
    };

    return (root);
  }

  static fromPersistence(json: Object): SkillModel {
    let a = (json as any);
    var replacementSkills: Array<Skill> = new Array<Skill>();

    let skillData: Array<Skill> = a.doc ["skills"];

    for (let i = 0; i < skillData.length; i++) {
      let newSkill: Skill = new Skill();
      newSkill.fromJSONObject(skillData [i]);

      replacementSkills.push(newSkill);
    }

    let model = (SkillModel.updateModel(replacementSkills));
    model = model.with({resource: Resource.fromPersistence(a)});
    model = model.with({guid: a.guid});
    model = model.with({type: a.type});
    model = model.with({title: a.title})
    if (a.lock !== undefined && a.lock !== null) {
      model = model.with({lock: contentTypes.Lock.fromPersistence(a.lock)});
    }
    return model;
  }
}


export type MediaModelParams = {
  webContent?: WebContent,
  guid?: string,
  type?: string
  name?: string,
  _attachments?: any,
  referencingDocuments?: Immutable.List<types.DocumentId>
};
const defaultMediaModelParams = {
  modelType: 'MediaModel',
  webContent: new WebContent(),
  guid: '',
  type: 'x-oli-webcontent',
  name: '',
  _attachments: {},
  referencingDocuments: Immutable.List<types.DocumentId>()
}

export class MediaModel extends Immutable.Record(defaultMediaModelParams) {

  modelType: 'MediaModel';
  webContent: WebContent;
  guid: string;
  type: string;
  name: string;
  _attachments: any;
  referencingDocuments: Immutable.List<types.DocumentId>

  constructor(params?: MediaModelParams) {
    params ? super(params) : super();
  }

  with(values: MediaModelParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): MediaModel {
    let model = new MediaModel();
    let m = json as any;
    model = model.with({webContent: WebContent.fromPersistence(m)})
    model = model.with({guid: m.guid});
    model = model.with({name: m.name});
    model = model.with({_attachments: m._attachments});
    model = model.with({referencingDocuments: Immutable.List<types.DocumentId>(m.referencingDocuments)});

    return model;
  }

  toPersistence(): Object {
    return {
      modelType: 'MediaModel',
      name: this.name,
      _attachments: this._attachments,
      referencingDocuments: this.referencingDocuments.toArray()
    };
  }
}

export type ContentModel =
  AssessmentModel |
  CourseModel |
  MediaModel |
  WorkbookPageModel |
  OrganizationModel |
  LearningObjectiveModel |
  SkillModel;

// A pure function that takes a content model as
// input and returns a changed content model
export type ChangeRequest = (input: ContentModel) => ContentModel;

