import * as Immutable from "immutable";
import * as types from "./types";
import * as contentTypes from "./contentTypes";
import {getKey} from "./common";
import {getChildren} from './content/common';
import guid from "../utils/guid";
import {MetaData} from "./metadata";
import {WebContent} from "./webcontent";
import {Resource} from "./resource";
import Linkable from "./linkable";
import {Skill} from "./skills";
import {LearningObjective} from "./los";
import {OrgContentTypes, OrgItem, OrgModule, OrgUnit, OrgOrganization, OrgSection, OrgSequence} from "./org";
import {isArray, isNullOrUndefined} from "util";
import {assessmentTemplate} from "./activity_templates";
import {UserInfo} from "./user_info";
import {PoolModel} from './models/pool';

import {Node} from './content/node';

export {Node} from './content/node';

export {PoolModel} from './models/pool';

export type EmptyModel = 'EmptyModel';
export const EmptyModel: EmptyModel = 'EmptyModel';

export const ModelTypes = types.strEnum([
  'CourseModel',
  'WorkbookPageModel',
  'AssessmentModel',
  'MediaModel',
  'OrganizationModel',
  'LearningObjectiveModel',
  'SkillModel',
  'PoolModel',
  'DefaultModel'
])

// Create an actual type
export type ModelTypes = keyof typeof ModelTypes;

export function isLockable(model: ContentModel) {
  return model.has('lock');
}

export function createModel(object: any): ContentModel {
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
    case 'x-oli-skills_model':
      return SkillModel.fromPersistence(object);
    case 'x-oli-webcontent':
      return MediaModel.fromPersistence(object);
    case 'x-oli-assessment2-pool':
      return PoolModel.fromPersistence(object);
    default:
      return DefaultModel.fromPersistence(object);
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
  buildStatus?: string,
  metadata?: MetaData,
  options?: string,
  icon?: WebContent,
  resources?: Immutable.OrderedMap<string, Resource>,
  webContents?: Immutable.OrderedMap<string, WebContent>,
  developers?: Immutable.OrderedMap<string, UserInfo>
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
  buildStatus: '',
  metadata: new MetaData(),
  options: '',
  icon: new WebContent(),
  resources: Immutable.OrderedMap<string, Resource>(),
  webContents: Immutable.OrderedMap<string, WebContent>(),
  developers: Immutable.OrderedMap<string, UserInfo>()
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
  buildStatus: string;
  metadata: MetaData;
  options: string;
  icon: WebContent;
  resources: Immutable.OrderedMap<string, Resource>;
  webContents: Immutable.OrderedMap<string, WebContent>;
  developers: Immutable.OrderedMap<string, UserInfo>;

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
    model = model.with({buildStatus: c.buildStatus});
    model = model.with({options: JSON.stringify(c.options)});
    if (!isNullOrUndefined(c.metadata.jsonObject)) {
      model = model.with({metadata: MetaData.fromPersistence(c.metadata.jsonObject)});
    }
    if (!isNullOrUndefined(c.icon)) {
      model = model.with({icon: WebContent.fromPersistence(c.icon)});
    }
    if (!isNullOrUndefined(c.resources)) {
      c.resources.forEach(item => {
        const id = item.guid;
        model = model.with({resources: model.resources.set(id, Resource.fromPersistence(item))});
      });
    }
    if (!isNullOrUndefined(c.webContents)) {
      c.webContents.forEach(item => {
        const id = item.guid;
        model = model.with({webContents: model.webContents.set(id, WebContent.fromPersistence(item))});
      });
    }
    if (!isNullOrUndefined(c.developers)) {
      c.developers.forEach(item => {
        const userName = item.userName;
        model = model.with({developers: model.developers.set(userName, UserInfo.fromPersistence(item))});
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
    if (isArray(wb.doc)) {
      workbook = wb.doc[0].workbook_page;
    } else {
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
    let resource: any = this.resource.toPersistence();
    let doc = null
    if (isNullOrUndefined(this.guid) || this.guid === '') {
      // Assume new workbook page created if guid is null
      // Generate artificial id from title
      try {
        const title = this.head.title.text;
        const id = title.split(" ")[0] + guid();
        resource = new Resource({id: id, title: title});
      } catch (err) {
        console.log(err);
        return null;
      }
      doc = [{
        "workbook_page": {
          "@id": resource.id,
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
          "@id": resource.id,
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

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }

}

export type AssessmentModelParams = {
  resource?: Resource,
  guid?: string,
  type?: string;
  recommendedAttempts?: string;
  maxAttempts?: string;
  lock?: contentTypes.Lock,
  title?: contentTypes.Title,
  nodes?: Immutable.OrderedMap<string, Node>,
  pages?: Immutable.OrderedMap<string, contentTypes.Page>,
};
const defaultAssessmentModelParams = {
  modelType: 'AssessmentModel',
  type: '',
  resource: new Resource(),
  guid: '',
  recommendedAttempts: '1',
  maxAttempts: '1',
  lock: new contentTypes.Lock(),
  title: new contentTypes.Title(),
  nodes: Immutable.OrderedMap<string, Node>(),
  pages: Immutable.OrderedMap<string, contentTypes.Page>(),
}

function migrateNodesToPage(model: AssessmentModel) {
  let updated = model;

  // Ensure that we have at least one page
  if (updated.pages.size === 0) {
    let newPage = new contentTypes.Page();
    newPage = newPage.with({title: new contentTypes.Title({text: 'Page 1'})});
    updated = updated.with({pages: updated.pages.set(newPage.guid, newPage)});
  }

  // Now move any root nodes to the first page
  if (updated.nodes.size > 0) {
    let page = updated.pages.first();
    updated.nodes.toArray().forEach(
      node => page = page.with({nodes: page.nodes.set(node.guid, node)}));
    updated = updated.with({pages: updated.pages.set(page.guid, page)});
    updated = updated.with({nodes: Immutable.OrderedMap<string, Node>()});
  }

  return updated;
}

export class AssessmentModel extends Immutable.Record(defaultAssessmentModelParams) {

  modelType: 'AssessmentModel';
  resource: Resource;
  guid: string;
  type: string;
  recommendedAttempts: string;
  maxAttempts: string;
  lock: contentTypes.Lock;
  title: contentTypes.Title;
  nodes: Immutable.OrderedMap<string, Node>;
  pages: Immutable.OrderedMap<string, contentTypes.Page>;

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
    if (isArray(a.doc)) {
      assessment = a.doc[0].assessment;
    } else {
      assessment = a.doc.assessment;
    }

    if (assessment['@recommendedAttempts'] !== undefined) {
      model = model.with({recommendedAttempts: assessment['@recommendedAttempts']});
    }
    if (assessment['@maxAttempts'] !== undefined) {
      model = model.with({maxAttempts: assessment['@maxAttempts']});
    }

    assessment['#array'].forEach(item => {

      const key = getKey(item);
      const id = guid();

      switch (key) {
        case 'page':
          model = model.with(
            {pages: model.pages.set(id, contentTypes.Page.fromPersistence(item, id))});
          break;
        case 'question':
          model = model.with({nodes: model.nodes.set(id, contentTypes.Question.fromPersistence(item, id))})
          break;
        case 'content':
          model = model.with({nodes: model.nodes.set(id, contentTypes.Content.fromPersistence(item, id))})
          break;
        case 'selection':
          model = model.with({nodes: model.nodes.set(id, contentTypes.Selection.fromPersistence(item, id))})
          break;
        default:
          model = model.with({nodes: model.nodes.set(id, contentTypes.Unsupported.fromPersistence(item, id))})
      }
    });

    // Adjust models to ensure that we never have a page-less assessment
    model = migrateNodesToPage(model);

    return model;
  }

  toPersistence(): Object {
    const children = [
      this.title.toPersistence(),
      ...this.pages.toArray().map(page => page.toPersistence()),
    ]
    let resource = this.resource.toPersistence();
    let doc = null;

    if (isNullOrUndefined(this.guid) || this.guid === '') {
      // Assume new assessment created if guid is null
      const assessment = assessmentTemplate(this.title.text);
      try {
        const id = assessment.assessment['@id'];
        resource = new Resource({id: id, title: this.title.text});
      } catch (err) {
        console.log(err);
        return null;
      }
      doc = [
        assessment
      ];

    } else {
      doc = [{
        "assessment": {
          "@id": this.resource.id,
          '@recommendedAttempts': this.recommendedAttempts,
          '@maxAttempts': this.maxAttempts,
          "#array": children
        }
      }];
    }
    const root = {
      "doc": doc
    };

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }
}

export type DefaultModelParams = {
  resource?: Resource,
  guid?: string,
  type?: string,
  content?: string,
  lock?: contentTypes.Lock
};

const defaultModelParams = {
  modelType: 'DefaultModel',
  resource: new Resource(),
  guid: '',
  type: '',
  content: '',
  lock: new contentTypes.Lock()
}

export class DefaultModel extends Immutable.Record(defaultModelParams) {
  modelType: 'DefaultModel';
  resource: Resource;
  guid: string;
  type: string;
  content: string;
  lock: contentTypes.Lock;

  constructor(params?: DefaultModelParams) {
    params ? super(params) : super();
  }

  with(values: DefaultModelParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): DefaultModel {
    let model = new DefaultModel();

    let info = (json as any);
    model = model.with({resource: Resource.fromPersistence(info)});
    model = model.with({guid: info.guid});
    model = model.with({type: info.type});
    if (info.lock !== undefined && info.lock !== null) {
      model = model.with({lock: contentTypes.Lock.fromPersistence(info.lock)});
    }
    model.with({content: info.doc});

    return model;
  }

  toPersistence(): Object {
    let resource: any = this.resource.toPersistence();
    let doc = [
      this.content
    ];

    const root = {
      "doc": doc
    };

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
    params ? super(params) : super();
  }

  with(values: OrganizationModelParams) {
    return this.merge(values) as this;
  }

  static getTextFromNode(aNode: any): string {
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
    console.log ("parseItem ()");
    console.log (JSON.stringify (anItem));          
      
    var newNode: OrgItem = new OrgItem();

    for (var i in anItem) {
      //console.log ("Examining: " + i);  
      if (i == "#annotations") {
        newNode.annotations = Linkable.fromJSON(anItem [i]["#annotations"]);
      }

      if (i == "@scoring_mode") {
        newNode.scoringMode = anItem [i];
      }

      if (i == "resourceref") {  
        //newNode.title will be resolved dynamically in the org editor when it mounts          
        newNode.resourceRef.idRef = anItem [i]["@idref"];
      }
    }

    return (newNode);
  }

  /**
   *
   */
  static parseSection(aSection: any): OrgSection {
    //console.log("parseSection ()");

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
    //console.log("parseModule ()");

    let moduleNode: OrgModule = new OrgModule();
    moduleNode.id = aModule ["@id"];
    moduleNode.expanded = aModule ["@expanded"];
    if (aModule ["#annotations"]) {
      moduleNode.annotations = Linkable.fromJSON(aModule ["#annotations"]);
    }

    for (var t = 0; t < aModule ["#array"].length; t++) {
      var mdl = aModule ["#array"] [t];

      var typeSwitch: string = OrganizationModel.getNodeContentType(mdl);

      //console.log("typeSwitch: " + typeSwitch);

      if (typeSwitch == "title") {
        moduleNode.title = OrganizationModel.getTextFromNode(mdl ["title"]);
      }

      if (typeSwitch == "item") {
        moduleNode.addNode(OrganizationModel.parseItem(mdl ["item"]));
      }

      if (typeSwitch == "section") {
        moduleNode.addNode(OrganizationModel.parseSection(mdl ["section"]));
      }
    }

    return (moduleNode);
  }

  /**
   *
   */
  static parseUnit(aUnit: any): OrgItem {
   // console.log("parseUnit ()");

    let unitNode: OrgUnit = new OrgUnit();
    unitNode.id = aUnit ["@id"];
    unitNode.expanded = aUnit ["@expanded"];
    unitNode.duration = aUnit ["@duration"];
    if (aUnit ["#annotations"]) {
      unitNode.annotations = Linkable.fromJSON(aUnit ["#annotations"]);
    }

    for (var t = 0; t < aUnit ["#array"].length; t++) {
      var mdl = aUnit ["#array"] [t];

      var typeSwitch: string = OrganizationModel.getNodeContentType(mdl);

     // console.log("typeSwitch: " + typeSwitch);

      if (typeSwitch == "title") {
        unitNode.title = OrganizationModel.getTextFromNode(mdl ["title"]);
      }

      if (typeSwitch == "item") {
        unitNode.addNode(OrganizationModel.parseItem(mdl ["item"]));
      }

      if (typeSwitch == "module") {
        unitNode.addNode(OrganizationModel.parseModule(mdl ["module"]));
      }
    }

    return (unitNode);
  }

  /**
   *
   */
  static updateModel(oldModel: OrganizationModel, newOrgModel: any): OrganizationModel {
   // console.log("updateModel ()");
    var model = new OrganizationModel({'organization': newOrgModel});
    model = model.with({toplevel: oldModel.toplevel});
    model = model.with({resource: oldModel.resource});
    model = model.with({guid: oldModel.guid});
    model = model.with({type: oldModel.type});
    model = model.with({title: oldModel.title});
    if (!isNullOrUndefined(oldModel.lock)) {
      model = model.with({lock: oldModel.lock});
    }
    return model;
  }

  /**
   * People might notice that this code is a bit odd because it will return
   * the last organization object under the root. Right now that is by design.
   * That might change as the specs change but at least we won't have to
   * redo the code.
   */
  static parseTopLevelOrganization(aData: any): OrgOrganization {

    //console.log("parseTopLevelOrganization ()");

    let orgNode = new OrgOrganization();// throw away for now

    if (aData) {
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
      }
    }

    return (orgNode);
  }

  /**
   *
   */
  static fromPersistence(json: Object): OrganizationModel {
    console.log("fromPersistence ()");

    //console.log("Org model: " + JSON.stringify(json));

    let a = (json as any);
    var orgData = a.doc.organization;

    console.log("Org JSON: " + JSON.stringify(orgData));

    var newData: Array<OrgSequence> = new Array();
    var newTopLevel: OrgOrganization = OrganizationModel.parseTopLevelOrganization(orgData);

    var oList = orgData["#array"];

    console.log("Found start of organization data ...");

    if (oList) {
      for (var k = 0; k < oList.length; k++) {

        var obj = oList [k];

        if (!isNullOrUndefined(obj ["sequences"])) {

          var destNode = obj ["sequences"]; // [j];

          var seqList = getChildren(destNode);

          for (let w = 0; w < seqList.length; w++) {
            let seqObj = seqList [w];
            if (seqObj ["sequence"]) { // checking to make absolutely sure we're in the right place
              console.log("Parsing sequence ...");
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

                  if (s == "unit") {
                    let newUnit = OrganizationModel.parseUnit(mdl);
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

    //console.log("toplevel: " + JSON.stringify(newTopLevel));
    console.log("newData: " + JSON.stringify(newData));

    let model = new OrganizationModel({'toplevel': newTopLevel, 'organization': newData});

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
  orgItemToJSON (testObject:any) {
    //console.log ("orgItemToJSON ("+testObject.title+")");
              
    let newObject: Object = new Object();
    newObject ["@id"] = testObject.id;
    newObject ["@expanded"] = testObject.expanded;
      
    if (testObject.orgType==OrgContentTypes.Item) {
        newObject["@scoring_mode"]=testObject.scoringMode;
        newObject["resourceref"]=new Object ();
        newObject["resourceref"]["@idref"]=testObject.resourceRef.idRef;        
    } else {        
      newObject ["#array"] = new Array();
      newObject ["#array"].push(OrgItem.addTextObject("title", testObject.title));
      if (testObject ["annotations"]) {
        newObject ["#annotations"] = Linkable.toJSON(testObject ["annotations"]);
      }
      if (testObject.orgType==OrgContentTypes.Sequence) {
        if (testObject ["category"]) {    
          newObject ["@category"] = testObject.category;
        }
            
        if (testObject ["audience"]) {        
          newObject ["@audience"] = testObject.audience;
        }    
      }       
     
      if (testObject ["children"]) {
        for (let i=0;i<testObject ["children"].length; i++) {
          
          var subObject:any=testObject ["children"][i];
            
          if (subObject.orgType==OrgContentTypes.Sequence) {  
            newObject ["#array"].push({"sequence": this.orgItemToJSON (subObject)});
          }
          
          if (subObject.orgType==OrgContentTypes.Module) {  
            newObject ["#array"].push({"module": this.orgItemToJSON (subObject)});
          }
          
          if (subObject.orgType==OrgContentTypes.Unit) {  
            newObject ["#array"].push({"unit": this.orgItemToJSON (subObject)});
          }
          
          if (subObject.orgType==OrgContentTypes.Section) {  
            newObject ["#array"].push({"section": this.orgItemToJSON (subObject)});
          }
          
          if (subObject.orgType==OrgContentTypes.Item) {  
            newObject ["#array"].push({"item": this.orgItemToJSON (subObject)});
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
    seqRoot ["sequences"] = new Object();
    seqRoot ["sequences"]["#array"] = new Array();
    seqRoot ["sequences"]["#array"] = sequences;

    // We can point directly to .children because we ensure in the constructor that
    // this object always exists

    console.log("Persisting " + newData.length + " items ...");

    /*  
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
        // console.log("Object: " + mObj.orgType);

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
          //console.log("Section: " + mObj.children [l].title);

          let sObj: OrgItem = mObj.children [l];

          let sectionObj: Object = new Object();
          let sectionContainer: Object = new Object();
            
          if (sObj.orgType==OrgContentTypes.Item) {
            sectionContainer ["item"] = sectionObj;
            sectionContainer ["item"]["resourceref"]=new Object ();
            sectionContainer ["item"]["resourceref"]["@idref"]=sObj.resourceRef.idRef;              
          } 
            
          if (sObj.orgType==OrgContentTypes.Unit) {
            sectionContainer ["unit"] = sectionObj;
          }
            
          if (sObj.orgType==OrgContentTypes.Section) {
            sectionContainer ["section"] = sectionObj;
          }            

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
    */
      
    for (let j = 0; j < newData.length; j++) {
      let testObject: OrgItem = newData [j] as OrgItem; // Start with the lowest level and detect what it actually is
              
      if (testObject.orgType==OrgContentTypes.Sequence) {         
        sequences.push({"sequence": this.orgItemToJSON (testObject)});
      }
        
      if (testObject.orgType==OrgContentTypes.Module) {         
        sequences.push({"module": this.orgItemToJSON (testObject)});
      }
        
      if (testObject.orgType==OrgContentTypes.Unit) {         
        sequences.push({"unit": this.orgItemToJSON (testObject)});
      }
        
      if (testObject.orgType==OrgContentTypes.Section) {         
        sequences.push({"section": this.orgItemToJSON (testObject)});
      }
        
      if (testObject.orgType==OrgContentTypes.Item) {         
        sequences.push({"item": this.orgItemToJSON (testObject)});
      }        
    }  

    //var formattedOrganization = JSON.stringify(orgRoot);
    var formattedOrganization = JSON.stringify(orgRoot ["organization"]);
      
    console.log("To: " + formattedOrganization);

    let resource = this.resource.toPersistence();
    let doc = [{
      "organization": orgRoot["organization"]
    }];

    const root = {
      "doc": doc
    };

    return Object.assign({}, resource, root, this.lock.toPersistence());
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
  static parseLearningObjective(anObjective: Object): LearningObjective {

    //console.log ("parseLearningObjective : " + JSON.stringify (anObjective));  
      
    var newLO: LearningObjective = new LearningObjective();

    newLO.id = anObjective ["@id"];
      
    newLO.category = anObjective ["@category"];
      
    if (anObjective ["@expanded"]) {  
      newLO.expanded = anObjective ["@expanded"];
    }
      
    if (anObjective ["@parent"]) {
      newLO.parent = anObjective ["@parent"];
    }      
      
    if (anObjective ["#annotations"]) {
      newLO.annotations = Linkable.fromJSON(anObjective ["#annotations"]);
    }
      
    // Flatten title for now. Keep in mind that once the text is in the
    // title attribute that's where any updates will be stored.  
      
    if (anObjective ["#array"]) {
      //console.log ("Found composite title");  
      let compositeTitle=anObjective ["#array"];
      let newTitle:string="";  
      for (let i=0;i<compositeTitle.length;i++) {
        let testTitleObject:any=compositeTitle [i];
          
        //console.log ("Examining sub title object: " + JSON.stringify (testTitleObject));  
          
        if (testTitleObject ["#text"]) {
          newTitle+=testTitleObject ["#text"];
          newTitle+=" ";              
        }
          
        if (testTitleObject ["code"]) {
          newTitle+=testTitleObject ["code"]["#text"];
          newTitle+=" ";            
        }          
      }
        
      newLO.title = newTitle;         
    } else {     
      newLO.title = anObjective ["#text"];
    }   

    return (newLO);
  }

  static updateModel(oldLDModel: LearningObjectiveModel, treeData: any): LearningObjectiveModel {
    console.log("updateModel ()");
    var model = new LearningObjectiveModel({'los': treeData});
    model = model.with({resource: oldLDModel.resource});
    model = model.with({guid: oldLDModel.guid});
    model = model.with({type: oldLDModel.type});
    model = model.with({id: oldLDModel.id});
    model = model.with({title: oldLDModel.title})
    if (!isNullOrUndefined(oldLDModel.lock)) {
      model = model.with({lock: oldLDModel.lock});
    }
    return model;
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
    //console.log("reparent ()");

    let toSet: Array<LearningObjective> = new Array();

    for (let i = 0; i < fromSet.length; i++) {
      let testLO: LearningObjective = fromSet [i];

      // This LO has a parent, reparent ...
      if (testLO.parent) {
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
    //console.log("pushLO ()");

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

    //console.log("Adding " + anLO.children.length + " children ...");

    for (let j = 0; j < anLO.children.length; j++) {
      this.pushLO(anLO.children [j], anArray);
    }
  }

  toPersistence(): Object {
    //console.log("toPersistence ()");
    let resource: any = this.resource.toPersistence();
    let flatLOs: Array<Object> = new Array ();

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
      "doc": [newData]
    };

    console.log("Persisting LO model as: " + JSON.stringify(root));

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }

  static fromPersistence(json: Object): LearningObjectiveModel {

    //console.log("fromPersistence ()");

    let a = (json as any);
    //var obData=a.doc.objectives;
    let loObject: Array<Object> = a.doc ["objectives"];

    let newData: Array<LearningObjective> = new Array();
    let newTitle: string = "";
    let newId: string = loObject ["@id"];

    let lObjectiveTest = loObject ["#array"];
    lObjectiveTest.forEach(function (item: any) {
      if (!isNullOrUndefined(item.objective)) {
        newData.push(LearningObjectiveModel.parseLearningObjective(item.objective));
      }
    });

    //console.log("New data LO: " + JSON.stringify(newData));

    let model = new LearningObjectiveModel({'los': LearningObjectiveModel.reparent(newData)});
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

  /**
   * We need to move this to a utility class because there are different instances
   * of it
   */
  static toFlat(aTree: Array<Linkable>, aToList: Array<Linkable>): Array<Linkable> {
    //console.log ("toFlat ()");

    if (!aTree) {
      return [];
    }

    for (let i = 0; i < aTree.length; i++) {
      let newObj: Linkable = new Linkable();
      newObj.id = aTree [i].id;
      newObj.title = aTree [i].title;
      aToList.push(newObj);

      if (aTree [i]["children"]) {
        if (aTree [i]["children"].length > 0) {
          //console.log ("Lo has children, processing ...");  
          let tList = aTree [i]["children"];
          this.toFlat(tList, aToList);
        }
      }
    }

    //console.log ("From tree: " + JSON.stringify (aTree));  
    //console.log ("To flat: " + JSON.stringify (aToList));

    return (aToList);
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
  type: 'x-oli-skills_model',
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
    //console.log("constructor ()");
    params ? super(params) : super();
  }


  with(values: SkillModelParams) {
    return this.merge(values) as this;
  }


  static updateModel(oldSkillModel: SkillModel, newSkillModel: any): SkillModel {
    //console.log("updateModel ()");
    var newModel = new SkillModel({'skills': newSkillModel});
    newModel = newModel.with({resource: oldSkillModel.resource});
    newModel = newModel.with({guid: oldSkillModel.guid});
    newModel = newModel.with({type: oldSkillModel.type});
    newModel = newModel.with({title: oldSkillModel.title})
    if (!isNullOrUndefined(oldSkillModel.lock)) {
      newModel = newModel.with({lock: oldSkillModel.lock});
    }
    //console.log("updateModel () done");
    return newModel;
  }

  toPersistence(): Object {
    //console.log("toPersistence ()");
    let resource: any = this.resource.toPersistence();
    const doc = [{
      "skills_model": {
        "@id": this.resource.id,
        "title": this.title.text,
        "skills": this.skills
      }
    }];
    const root = {
      "doc": doc
    };

    //console.log("SkillModel: " + JSON.stringify(root));

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }

  static fromPersistence(json: Object): SkillModel {
    let a = (json as any);
    var replacementSkills: Array<Skill> = new Array<Skill>();

    let skillData: Array<Skill> = a.doc.skills_model["skills"];

    for (let i = 0; i < skillData.length; i++) {
      let newSkill: Skill = new Skill();
      newSkill.fromJSONObject(skillData [i]);

      replacementSkills.push(newSkill);
    }

    let model = new SkillModel({'skills': replacementSkills});
    model = model.with({resource: Resource.fromPersistence(a)});
    model = model.with({guid: a.guid});
    model = model.with({type: a.type});
    model = model.with({title: a.title})
    if (!isNullOrUndefined(a.lock)) {
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
  SkillModel |
  PoolModel |
  DefaultModel;

// A pure function that takes a content model as
// input and returns a changed content model
export type ChangeRequest = (input: ContentModel) => ContentModel;

