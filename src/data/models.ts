import * as Immutable from 'immutable';
import * as types from './types';
import * as contentTypes from './contentTypes';
import { getKey } from './common';
import { getChildren } from './content/common';
import guid from '../utils/guid';
import { MetaData } from './metadata';
import { WebContent } from './webcontent';
import { Resource } from './resource';
import Linkable from './linkable';
import { Skill } from './skills';
import { LearningObjective } from './los';
import { OrgContentTypes, OrgItem, OrgModule,
  OrgUnit, OrgOrganization, OrgSection, OrgSequence } from './org';
import { isArray, isNullOrUndefined } from 'util';
import { assessmentTemplate } from './activity_templates';
import { UserInfo } from './user_info';
import { PoolModel } from './models/pool';

import { Node } from './content/node';

export { Node } from './content/node';

export { PoolModel } from './models/pool';

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
  'DefaultModel',
]);

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
  developers?: Immutable.OrderedMap<string, UserInfo>,
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
  developers: Immutable.OrderedMap<string, UserInfo>(),
};

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
    model = model.with({ rev: c.rev });
    model = model.with({ guid: c.guid });
    model = model.with({ id: c.id });
    model = model.with({ version: c.version });
    model = model.with({ title: c.title });
    model = model.with({ type: c.type });
    model = model.with({ description: c.description });
    model = model.with({ buildStatus: c.buildStatus });
    model = model.with({ options: JSON.stringify(c.options) });
    if (!isNullOrUndefined(c.metadata.jsonObject)) {
      model = model.with({ metadata: MetaData.fromPersistence(c.metadata.jsonObject) });
    }
    if (!isNullOrUndefined(c.icon)) {
      model = model.with({ icon: WebContent.fromPersistence(c.icon) });
    }
    if (!isNullOrUndefined(c.resources)) {
      c.resources.forEach((item) => {
        const id = item.guid;
        model = model.with({ resources: model.resources.set(id, Resource.fromPersistence(item)) });
      });
    }
    if (!isNullOrUndefined(c.webContents)) {
      c.webContents.forEach((item) => {
        const id = item.guid;
        model = model.with({ webContents: model.webContents.set(id, WebContent.fromPersistence(item)) });
      });
    }
    if (!isNullOrUndefined(c.developers)) {
      c.developers.forEach((item) => {
        const userName = item.userName;
        model = model.with({ developers: model.developers.set(userName, UserInfo.fromPersistence(item)) });
      });
    }
    return model;
  }

  toPersistence(): Object {
    const doc = [{
      package: {
        '@id': this.id,
        icon: this.icon.toPersistence(),
        title: this.title,
        '@version': this.version,
        metadata: this.metadata.toPersistence(),
        description: this.description,
        preferences: this.options,
      },
    }];
    const values = {
      modelType: 'CourseModel',
      guid: this.guid,
      id: this.id,
      version: this.version,
      title: this.title,
      type: this.type,
      description: this.description,
      doc,
    };
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
  lock: new contentTypes.Lock(),
};

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
      
    //console.log ("Blank workbookpage model: " + JSON.stringify (model));
    //console.log ("Raw JSON : " + JSON.stringify (json));

    const wb = (json as any);
    model = model.with({ resource: Resource.fromPersistence(wb) });
    model = model.with({ guid: wb.guid });
    model = model.with({ type: wb.type });
    if (wb.lock !== undefined && wb.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(wb.lock) });
    }

    let workbook = null;
    if (isArray(wb.doc)) {
      workbook = wb.doc[0].workbook_page;
    } else {
      workbook = wb.doc.workbook_page;
    }
      
    workbook['#array'].forEach((item) => {

      const key = getKey(item);
      const id = guid();

      switch (key) {
        case 'head':
          model = model.with({ head: contentTypes.Head.fromPersistence(item, id) });
          break;
        case 'body':
          model = model.with({ body: contentTypes.Html.fromPersistence(item, id) });
          break;
        default:
      }
    });

    console.log ("Workbook model: " + JSON.stringify (model));  
      
    return model;
  }

  toPersistence(): Object {        
    let resource: any = this.resource.toPersistence();
    let doc = null;
    if (isNullOrUndefined(this.guid) || this.guid === '') {
      // Assume new workbook page created if guid is null
      // Generate artificial id from title
      try {
        const title = this.head.title.text;
        const g = guid();
        const id = title.toLowerCase().split(' ')[0] + g.substring(g.lastIndexOf('-'));
        resource = new Resource({ id, title });
      } catch (err) {
        console.log(err);
        return null;
      }
      doc = [{
        workbook_page: {
          '@id': resource.id,
          '#array': [
            this.head.toPersistence(),
            {
              body: {
                p: {
                  '#text': '(This space intentionally left blank.)',
                },
              },
            },
          ],
        },
      }];
    } else {
      doc = [{
        workbook_page: {
          '@id': resource.id,
          '#array': [
            this.head.toPersistence(),
            { body: this.body.toPersistence() },
          ],
        },
      }];
    }
    const root = {
      doc,
    };
      
    console.log ("Workbook toPersistence: " + JSON.stringify (root));  

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
};

function migrateNodesToPage(model: AssessmentModel) {
  let updated = model;

  // Ensure that we have at least one page
  if (updated.pages.size === 0) {
    let newPage = new contentTypes.Page();
    newPage = newPage.with({ title: new contentTypes.Title({ text: 'Page 1' }) });
    updated = updated.with({ pages: updated.pages.set(newPage.guid, newPage) });
  }

  // Now move any root nodes to the first page
  if (updated.nodes.size > 0) {
    let page = updated.pages.first();
    updated.nodes.toArray().forEach(
      node => page = page.with({ nodes: page.nodes.set(node.guid, node) }));
    updated = updated.with({ pages: updated.pages.set(page.guid, page) });
    updated = updated.with({ nodes: Immutable.OrderedMap<string, Node>() });
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
    model = model.with({ resource: Resource.fromPersistence(a) });
    model = model.with({ guid: a.guid });
    model = model.with({ type: a.type });
    model = model.with({ title: new contentTypes.Title({ guid: guid(), text: a.title }) });

    if (a.lock !== undefined && a.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(a.lock) });
    }
    let assessment = null;
    if (isArray(a.doc)) {
      assessment = a.doc[0].assessment;
    } else {
      assessment = a.doc.assessment;
    }

    if (assessment['@recommendedAttempts'] !== undefined) {
      model = model.with({ recommendedAttempts: assessment['@recommendedAttempts'] });
    }
    if (assessment['@maxAttempts'] !== undefined) {
      model = model.with({ maxAttempts: assessment['@maxAttempts'] });
    }

    assessment['#array'].forEach((item) => {

      const key = getKey(item);
      const id = guid();

      switch (key) {
        case 'page':
          model = model.with(
            { pages: model.pages.set(id, contentTypes.Page.fromPersistence(item, id)) });
          break;
        case 'question':
          model = model.with({ nodes: model.nodes.set(id, contentTypes.Question.fromPersistence(item, id)) });
          break;
        case 'content':
          model = model.with({ nodes: model.nodes.set(id, contentTypes.Content.fromPersistence(item, id)) });
          break;
        case 'selection':
          model = model.with({ nodes: model.nodes.set(id, contentTypes.Selection.fromPersistence(item, id)) });
          break;
        default:
          model = model.with({ nodes: model.nodes.set(id, contentTypes.Unsupported.fromPersistence(item, id)) });
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
    ];
    let resource = this.resource.toPersistence();
    let doc = null;

    if (isNullOrUndefined(this.guid) || this.guid === '') {
      // Assume new assessment created if guid is null
      const assessment = assessmentTemplate(this.title.text);
      try {
        const id = assessment.assessment['@id'];
        resource = new Resource({ id, title: this.title.text });
      } catch (err) {
        console.log(err);
        return null;
      }
      doc = [
        assessment,
      ];

    } else {
      doc = [{
        assessment: {
          '@id': this.resource.id,
          '@recommendedAttempts': this.recommendedAttempts,
          '@maxAttempts': this.maxAttempts,
          '#array': children,
        },
      }];
    }
    const root = {
      doc,
    };

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }
}

export type DefaultModelParams = {
  resource?: Resource,
  guid?: string,
  type?: string,
  content?: string,
  lock?: contentTypes.Lock,
};

const defaultModelParams = {
  modelType: 'DefaultModel',
  resource: new Resource(),
  guid: '',
  type: '',
  content: '',
  lock: new contentTypes.Lock(),
};

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

    const info = (json as any);
    model = model.with({ resource: Resource.fromPersistence(info) });
    model = model.with({ guid: info.guid });
    model = model.with({ type: info.type });
    if (info.lock !== undefined && info.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(info.lock) });
    }
    model.with({ content: info.doc });

    return model;
  }

  toPersistence(): Object {
    const resource: any = this.resource.toPersistence();
    const doc = [
      this.content,
    ];

    const root = {
      doc,
    };

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }
}

export type OrganizationModelParams = {
  resource?: Resource,
  id?: string,
  version?: string,
  guid?: string,
  type?: string,
  title?: contentTypes.Title,
  organization?: any,
  toplevel?: OrgOrganization,
  lock?: contentTypes.Lock,
};

const defaultOrganizationModel = {
  modelType: 'OrganizationModel',
  resource: new Resource(),
  id: '',
  version: '',
  guid: '',
  type: 'x-oli-organization',
  title: new contentTypes.Title(),
  organization: [],
  toplevel: new OrgOrganization(),
  lock: new contentTypes.Lock(),
};

export class OrganizationModel extends Immutable.Record(defaultOrganizationModel) {
  modelType: 'OrganizationModel';
  resource: Resource;
  id: string;
  version: string;
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
  static parseItem(anItem: any): OrgItem {
    //console.log ('parseItem ()');
    //console.log (JSON.stringify (anItem));          
      
    const newNode: OrgItem = new OrgItem();

    for (const i in anItem) {
      //console.log ("Examining: " + i);  
      if (i === '#annotations') {
        console.log ("Giving annotations to Linkable: " + JSON.stringify (anItem [i]));  
        newNode.annotations = Linkable.fromJSON(anItem [i]);
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
  static parseSection(aSection: any): OrgSection {
    // console.log("parseSection ()");

    const newNode: OrgSection = new OrgSection();
    newNode.id = aSection ['@id'];
    newNode.expanded = aSection ['@expanded'];
    if (aSection ['#annotations']) {
      newNode.annotations = Linkable.fromJSON(aSection ['#annotations']);
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
  static parseModule(aModule: any): OrgItem {
    // console.log("parseModule ()");

    const moduleNode: OrgModule = new OrgModule();
    moduleNode.id = aModule ['@id'];
    moduleNode.expanded = aModule ['@expanded'];
    if (aModule ['#annotations']) {
      moduleNode.annotations = Linkable.fromJSON(aModule ['#annotations']);
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
  static parseUnit(aUnit: any): OrgItem {
   // console.log("parseUnit ()");

    const unitNode: OrgUnit = new OrgUnit();
    unitNode.id = aUnit ['@id'];
    unitNode.expanded = aUnit ['@expanded'];
    unitNode.duration = aUnit ['@duration'];
    if (aUnit ['#annotations']) {
      unitNode.annotations = Linkable.fromJSON(aUnit ['#annotations']);
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
  static parseTopLevelOrganization(aData: any): OrgOrganization {

    // console.log("parseTopLevelOrganization ()");

    const orgNode = new OrgOrganization();// throw away for now

    if (aData) {
      orgNode.id = aData['@id'];
      orgNode.expanded = aData['@expanded'];
      orgNode.version = aData['@version'];
      if (aData['#annotations']) {
        orgNode.annotations = Linkable.fromJSON(aData['#annotations']);
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

    const newData: Array<OrgSequence> = new Array();
    const newTopLevel: OrgOrganization = OrganizationModel.parseTopLevelOrganization(orgData);

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
              const newSequence: OrgSequence = new OrgSequence();
              const seqReference = seqObj ['sequence'];
              newData.push(newSequence);
              newSequence.id = seqReference['@id'];
              newSequence.expanded = seqReference['@expanded'];
              newSequence.category = seqReference['@category'];
              newSequence.audience = seqReference['@audience'];
              if (seqReference ['#annotations']) {
                newSequence.annotations = Linkable.fromJSON(seqReference ['#annotations']);
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

    model = model.with({ resource: Resource.fromPersistence(a) });
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
      
    if (testObject.orgType === OrgContentTypes.Item) {
      newObject['@scoring_mode'] = testObject.scoringMode;
      newObject['resourceref'] = new Object ();
      newObject['resourceref']['@idref'] = testObject.resourceRef.idRef;        
      if (testObject ['annotations']) {
        newObject ['#annotations'] = Linkable.toJSON(testObject ['annotations']);
      }        
    } else {        
      newObject ['#array'] = new Array();
      newObject ['#array'].push(OrgItem.addTextObject('title', testObject.title));
      if (testObject ['annotations']) {
        newObject ['#annotations'] = Linkable.toJSON(testObject ['annotations']);
      }
      if (testObject.orgType === OrgContentTypes.Sequence) {
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
            
          if (subObject.orgType === OrgContentTypes.Sequence) {  
            newObject ['#array'].push({ sequence: this.orgItemToJSON (subObject) });
          }
          
          if (subObject.orgType === OrgContentTypes.Module) {  
            newObject ['#array'].push({ module: this.orgItemToJSON (subObject) });
          }
          
          if (subObject.orgType === OrgContentTypes.Unit) {  
            newObject ['#array'].push({ unit: this.orgItemToJSON (subObject) });
          }
          
          if (subObject.orgType === OrgContentTypes.Section) {  
            newObject ['#array'].push({ section: this.orgItemToJSON (subObject) });
          }
          
          if (subObject.orgType === OrgContentTypes.Item) {  
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

    const orgObject: OrgOrganization = this.toplevel;
    orgObject.title = this.title.text;
    const orgRoot: Object = (new OrgOrganization()).toJSONObject(orgObject);

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
      const testObject: OrgItem = newData [j] as OrgItem; // Start with the lowest level and detect what it actually is
              
      if (testObject.orgType === OrgContentTypes.Sequence) {         
        sequences.push({ sequence: this.orgItemToJSON (testObject) });
      }
        
      if (testObject.orgType === OrgContentTypes.Module) {         
        sequences.push({ module: this.orgItemToJSON (testObject) });
      }
        
      if (testObject.orgType === OrgContentTypes.Unit) {         
        sequences.push({ unit: this.orgItemToJSON (testObject) });
      }
        
      if (testObject.orgType === OrgContentTypes.Section) {         
        sequences.push({ section: this.orgItemToJSON (testObject) });
      }
        
      if (testObject.orgType === OrgContentTypes.Item) {         
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

// >------------------------------------------------------------------

export type LearningObjectiveModelParams = {
  resource?: Resource,
  guid?: string,
  type?: string,
  id?: string,
  title?: string,
  los?: Array<LearningObjective>,
  lock?: contentTypes.Lock,
};

const defaultLearningObjectiveModel = {
  resource: new Resource(),
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

    // console.log ("parseLearningObjective : " + JSON.stringify (anObjective));  
      
    const newLO: LearningObjective = new LearningObjective();

    newLO.id = anObjective ['@id'];
      
    newLO.category = anObjective ['@category'];
      
    if (anObjective ['@expanded']) {  
      newLO.expanded = anObjective ['@expanded'];
    }
      
    if (anObjective ['@parent']) {
      newLO.parent = anObjective ['@parent'];
    }      
      
    if (anObjective ['#annotations']) {
      newLO.annotations = Linkable.fromJSON(anObjective ['#annotations']);
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
  static reparent(fromSet: Array<LearningObjective>): Array<LearningObjective> {
    // console.log("reparent ()");

    const toSet: Array<LearningObjective> = new Array();

    for (let i = 0; i < fromSet.length; i++) {
      const testLO: LearningObjective = fromSet [i];

      // This LO has a parent, reparent ...
      if (testLO.parent) {
        if ((testLO.parent !== '') && (testLO.parent !== 'unassigned')) {
          //console.log('We have an LO with a parent: ' + testLO.parent);

          // this should be valid since we essentially have a clean fromSet
          for (let j = 0; j < fromSet.length; j++) {
            const tempLO: LearningObjective = fromSet [j];

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
  pushLO(anLO: LearningObjective, anArray: Array<Object>): void {
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

    ephemeral ['#annotations'] = Linkable.toJSON(anLO.annotations);

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

    const newData: Array<LearningObjective> = new Array();
    const newTitle: string = '';
    const newId: string = loObject ['@id'];

    const lObjectiveTest = loObject ['#array'];
    lObjectiveTest.forEach((item) => {
      if (!isNullOrUndefined(item.objective)) {
        newData.push(LearningObjectiveModel.parseLearningObjective(item.objective));
      }
    });

    let model = new LearningObjectiveModel({ los: LearningObjectiveModel.reparent(newData) });
    model = model.with({ resource: Resource.fromPersistence(a) });
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
  static toFlat(aTree: Array<Linkable>, aToList: Array<Linkable>): Array<Linkable> {
    if (!aTree) {
      return [];
    }

    for (let i = 0; i < aTree.length; i++) {
      const newObj: Linkable = new Linkable();
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

// >------------------------------------------------------------------

export type SkillModelParams = {
  resource?: Resource,
  guid?: string,
  type?: string,
  lock?: contentTypes.Lock,
  title?: contentTypes.Title,
  skills?: any,
};

const defaultSkillModel = {
  modelType: 'SkillModel',
  resource: new Resource(),
  guid: '',
  type: 'x-oli-skills_model',
  lock: new contentTypes.Lock(),
  title: new contentTypes.Title(),
  skillDefaults: Skill,
  skills: [],
};

export class SkillModel extends Immutable.Record(defaultSkillModel) {
  modelType: 'SkillModel';
  resource: Resource;
  guid: string;
  type: string;
  lock: contentTypes.Lock;
  title: contentTypes.Title;
  skillDefaults: Skill;
  skills: Array<Object>;

  constructor(params?: SkillModelParams) {  
    params ? super(params) : super(); 
  }

  with(values: SkillModelParams) {
    return this.merge(values) as this;
  }


  static updateModel(oldSkillModel: SkillModel, newSkillModel: any): SkillModel {
    let newModel = new SkillModel({ skills: newSkillModel });
    newModel = newModel.with({ resource: oldSkillModel.resource });
    newModel = newModel.with({ guid: oldSkillModel.guid });
    newModel = newModel.with({ type: oldSkillModel.type });
    newModel = newModel.with({ title: oldSkillModel.title });
    if (!isNullOrUndefined(oldSkillModel.lock)) {
      newModel = newModel.with({ lock: oldSkillModel.lock });
    }
    return newModel;
  }
    
  toPersistence(): Object {
    // console.log("toPersistence ()");
    const resource: any = this.resource.toPersistence();
    let doc = [{
      skills_model: {
        '@id': this.resource.id,        
        '#array': this.skills,
      },
    }];
      
    // Add the title object to the array where we have the skills in
    // a very clumsy way.
    let titleObj=new Object ();
    titleObj ["title"]=new Object ();  
    titleObj ["title"]["#text"]=this.title.text;      
    doc [0]["skills_model"]["#array"].push (titleObj);  
      
    const root = {
      doc,
    };

    return Object.assign({}, resource, root, this.lock.toPersistence());
  }

  static fromPersistence(json: Object): SkillModel {      
    const a = (json as any);
    const replacementSkills: Array<Skill> = new Array<Skill>();  
    const skillData: Array<Skill> = a.doc.skills_model['#array'];
     
    let extractedTitle:contentTypes.Title=new contentTypes.Title ("Unassigned");  

    for (let i = 0; i < skillData.length; i++) {
      const newSkill: Skill = new Skill();
      let testSkillObj:Object=skillData [i];
        
      if (testSkillObj ["title"]) {
        extractedTitle=new contentTypes.Title ({text : testSkillObj ["title"]["#text"]});
      } else {                
        newSkill.fromJSONObject(testSkillObj as Skill);
        replacementSkills.push(newSkill);          
      }    
    }

    let model = new SkillModel({ skills: replacementSkills });
    model = model.with({ resource: Resource.fromPersistence(a) });
    model = model.with({ guid: a.guid });
    model = model.with({ type: a.type });
    model = model.with({ title: extractedTitle });
    if (!isNullOrUndefined(a.lock)) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(a.lock) });
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
  referencingDocuments?: Immutable.List<types.DocumentId>,
};
const defaultMediaModelParams = {
  modelType: 'MediaModel',
  webContent: new WebContent(),
  guid: '',
  type: 'x-oli-webcontent',
  name: '',
  _attachments: {},
  referencingDocuments: Immutable.List<types.DocumentId>(),
};

export class MediaModel extends Immutable.Record(defaultMediaModelParams) {

  modelType: 'MediaModel';
  webContent: WebContent;
  guid: string;
  type: string;
  name: string;
  _attachments: any;
  referencingDocuments: Immutable.List<types.DocumentId>;

  constructor(params?: MediaModelParams) {
    params ? super(params) : super();
  }

  with(values: MediaModelParams) {
    return this.merge(values) as this;
  }

  static fromPersistence(json: Object): MediaModel {
    let model = new MediaModel();
    const m = json as any;
    model = model.with({ webContent: WebContent.fromPersistence(m) });
    model = model.with({ guid: m.guid });
    model = model.with({ name: m.name });
    model = model.with({ _attachments: m._attachments });
    model = model.with({ referencingDocuments: Immutable.List<types.DocumentId>(m.referencingDocuments) });

    return model;
  }

  toPersistence(): Object {
    return {
      modelType: 'MediaModel',
      name: this.name,
      _attachments: this._attachments,
      referencingDocuments: this.referencingDocuments.toArray(),
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

