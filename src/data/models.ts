import * as Immutable from "immutable";
import * as types from "./types";
import * as contentTypes from "./contentTypes";
import {getKey} from "./common";
import guid from "../utils/guid";
import {Skill} from "./skills";
import {MetaData} from "./metadata";
import {WebContent} from "./webcontent";
import {Resource} from "./resource";

export type EmptyModel = 'EmptyModel';
export const EmptyModel: EmptyModel = 'EmptyModel';

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

export function createModel(object: any): ContentModel {
    console.log("createModel ()");
    switch (object.type) {
        case 'x-oli-package':
            return CourseModel.fromPersistence(object);
        case 'x-oli-workbook_page':
            return WorkbookPageModel.fromPersistence(object);
        case 'x-oli-assessment':
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
    // switch (object.modelType) {
    //   case ModelTypes.CourseModel:
    //     return CourseModel.fromPersistence(object);
    //   case ModelTypes.WorkbookPageModel:
    //     return WorkbookPageModel.fromPersistence(object);
    //   case ModelTypes.CoursePermissionModel:
    //     return CoursePermissionModel.fromPersistence(object);
    //   case ModelTypes.AssessmentModel:
    //     return AssessmentModel.fromPersistence(object);
    //   case ModelTypes.MediaModel:
    //     return MediaModel.fromPersistence(object);
    //   case ModelTypes.OrganizationModel:
    //     return OrganizationModel.fromPersistence(object);
    //   case ModelTypes.LearningObjectiveModel:
    //     return LearningObjectiveModel.fromPersistence(object);
    //   case ModelTypes.SkillModel:
    //     return SkillModel.fromPersistence(object);
    // }
}

export type CourseModelParams = {
    rev?: number,
    guid?: string,
    id?: string,
    version?: string,
    title?: contentTypes.Title,
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
    title: new contentTypes.Title(),
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
    title: contentTypes.Title;
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
        model = model.with({title: contentTypes.Title.fromPersistence(c.title, guid())});
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
        const values = {
            modelType: 'CourseModel',
            rev: this.rev,
            guid: this.guid,
            id: this.id,
            version: this.version,
            title: this.title.toPersistence(),
            type: this.type,
            description: this.description,
            metadata: this.metadata.toPersistence(),
            options: this.options,
            icon: this.icon.toPersistence(),
            resources: [...this.resources.toArray().map(resource => resource.toPersistence())],
            webContents: [...this.webContents.toArray().map(webContent => webContent.toPersistence())]
        }
        return Object.assign({}, values);
    }
}

export type WorkbookPageModelParams = {
    resource?: Resource,
    type?: string;
    head?: contentTypes.Head,
    body?: contentTypes.Html,
    lock?: contentTypes.Lock
};

const defaultWorkbookPageModelParams = {
    modelType: 'WorkbookPageModel',
    resource: new Resource(),
    type: 'x-oli-workbook_page',
    head: new contentTypes.Head(),
    body: new contentTypes.Html(),
    lock: new contentTypes.Lock()
}

export class WorkbookPageModel extends Immutable.Record(defaultWorkbookPageModelParams) {

    modelType: 'WorkbookPageModel';
    resource: Resource;
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
        model = model.with({type: wb.type});
        if (wb.lock !== undefined && wb.lock !== null) {
            model = model.with({lock: contentTypes.Lock.fromPersistence(wb.lock)});
        }

        wb.doc.workbook_page['#array'].forEach(item => {

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
        let resource = this.resource.toPersistence();
        let doc = [{
            "workbook_page": {
                "@id": this.resource.id,
                "#array": [
                    this.head.toPersistence(),
                    {body: this.body.toPersistence()}
                ]
            }
        }];
        const root = {
            "doc": doc
        };

        return Object.assign({}, resource, root, this.lock.toPersistence());
    }
}

export type AssessmentModelParams = {
    resource?: Resource,
    type?: string;
    lock?: contentTypes.Lock,
    title?: contentTypes.Title,
    nodes?: Immutable.OrderedMap<string, Node>
};
const defaultAssessmentModelParams = {
    modelType: 'AssessmentModel',
    type: '',
    resource: new Resource(),
    lock: new contentTypes.Lock(),
    title: new contentTypes.Title(),
    nodes: Immutable.OrderedMap<string, Node>()
}


export type Node = contentTypes.Question | contentTypes.Content | contentTypes.Unsupported;

export class AssessmentModel extends Immutable.Record(defaultAssessmentModelParams) {

    modelType: 'AssessmentModel';
    resource: Resource;
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

        let a = (json as any);
        model = model.with({resource: Resource.fromPersistence(a)});
        model = model.with({type: a.type});
        model = model.with({title: contentTypes.Title.fromPersistence(a.title, guid())})
        if (a.lock !== undefined && a.lock !== null) {
            model = model.with({lock: contentTypes.Lock.fromPersistence(a.lock)});
        }

        a.doc.assessment['#array'].forEach(item => {

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
        let resource = this.resource.toPersistence();
        const children = [
            this.title.toPersistence(),
            ...this.nodes.toArray().map(node => node.toPersistence()),
        ]
        let doc = [{
            "assessment": {
                "@id": "id",
                "#array": children
            }
        }];
        const root = {
            "doc": doc
        };

        return Object.assign({}, resource, root, this.lock.toPersistence());
    }
}

export type OrganizationModelParams = {
    resource?: Resource,
    type?: string;
    title?: contentTypes.Title,
    lock?: contentTypes.Lock
};

const defaultOrganizationModel = {
    modelType: 'OrganizationModel',
    resource: new Resource(),
    type: 'x-oli-organization',
    title: new contentTypes.Title(),
    lock: new contentTypes.Lock()
}

export class OrganizationModel extends Immutable.Record(defaultOrganizationModel) {
    modelType: 'OrganizationModel';
    resource: Resource;
    type: string;
    title: contentTypes.Title;
    lock: contentTypes.Lock;

    constructor(params?: OrganizationModelParams) {
        params ? super(params) : super();
    }

    with(values: OrganizationModelParams) {
        return this.merge(values) as this;
    }

    static fromPersistence(json: Object): OrganizationModel {
        let model = new OrganizationModel();
        const id = guid();
        let a = (json as any);
        model = model.with({resource: Resource.fromPersistence(a)});
        model = model.with({type: a.type});
        let title = model.resource.title;
        model = model.with({title: contentTypes.Title.fromPersistence(title, id)});

        if (a.lock !== undefined && a.lock !== null) {
            model = model.with({lock: contentTypes.Lock.fromPersistence(a.lock)});
        }
        return model;
    }

    toPersistence(): Object {
        return {};
    }
}


//>------------------------------------------------------------------

export type LearningObjectiveModelParams = {
    courseId?: types.DocumentId,
    title?: contentTypes.Title
};

const defaultLearningObjectiveModel = {
    modelType: 'LearningObjectiveModel',
    courseId: '',
    title: new contentTypes.Title(),
}

export class LearningObjectiveModel extends Immutable.Record(defaultLearningObjectiveModel) {
    modelType: 'LearningObjectiveModel';
    courseId: types.DocumentId;
    title: contentTypes.Title;

    constructor(params?: LearningObjectiveModelParams) {
        params ? super(params) : super();
    }

    with(values: LearningObjectiveModelParams) {
        return this.merge(values) as this;
    }

    static fromPersistence(json: Object): LearningObjectiveModel {
        return new LearningObjectiveModel();
    }

    toPersistence(): Object {
        return {};
    }
}

//>------------------------------------------------------------------

export type SkillModelParams = {
    courseId?: types.DocumentId,
    title?: contentTypes.Title,
    skills?: any
};

const defaultSkillModel = {
    modelType: 'SkillModel',
    courseId: '',
    title: new contentTypes.Title(),
    skillDefaults: Skill,
    skills: []
}

export class SkillModel extends Immutable.Record(defaultSkillModel) {
    modelType: 'SkillModel';
    courseId: types.DocumentId;
    title: contentTypes.Title;
    skillDefaults: Skill;
    skills: Array<Skill>;

    constructor(params?: SkillModelParams) {
        console.log("constructor ()");
        params ? super(params) : super();
        //super();
        //console.log ("constructor postcheck: " + JSON.stringify (this.skills));
    }

    /*
     with(values: SkillModelParams) {
     return this.merge(values) as this;
     }
     */

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

        //return Object.assign({}, root, this.lock.toPersistence());
        return (root);
    }

    static fromPersistence(json: Object): SkillModel {
        console.log("SkillModel: fromPersistence ()");

        var replacementSkills: Array<Skill> = new Array<Skill>();

        let skillData: Array<Skill> = json ["skills"];

        console.log("Parsing: (" + skillData.length + ")" + JSON.stringify(skillData));

        for (let i = 0; i < skillData.length; i++) {
            console.log("Adding new skill [" + i + "] ...");
            let newSkill: Skill = new Skill();
            newSkill.fromJSONObject(skillData [i]);

            replacementSkills.push(newSkill);
        }

        console.log("New skill list: " + JSON.stringify(replacementSkills));

        return (SkillModel.updateModel(replacementSkills))
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

    static fromPersistence(json: Object): CoursePermissionModel {
        const model = new CoursePermissionModel();
        const p = json as any;
        return model.with({userId: p.userId, courseId: p.courseId});
    }

    toPersistence(): Object {
        return {
            modelType: 'CoursePermissionModel',
            userId: this.userId,
            courseId: this.courseId
        };
    }
}

export type MediaModelParams = {
    webContent?: WebContent,
    name?: string,
    _attachments?: any,
    referencingDocuments?: Immutable.List<types.DocumentId>
};
const defaultMediaModelParams = {
    modelType: 'MediaModel',
    webContent: new WebContent(),
    name: '',
    _attachments: {},
    referencingDocuments: Immutable.List<types.DocumentId>()
}

export class MediaModel extends Immutable.Record(defaultMediaModelParams) {

    modelType: 'MediaModel';
    webContent: WebContent;
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
    CoursePermissionModel |
    MediaModel |
    WorkbookPageModel |
    OrganizationModel |
    LearningObjectiveModel |
    SkillModel;

// A pure function that takes a content model as
// input and returns a changed content model
export type ChangeRequest = (input: ContentModel) => ContentModel;

