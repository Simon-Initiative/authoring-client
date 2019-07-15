export function iLiterallyCantEven(...args: any[]):
  never { throw new Error('Type validation error: \'' + args + '\''); }

const identity = <T>(t: T) => t;

export class Id {
  private type: string;
  private val: string;

  constructor(type: string, val: string) {
    this.type = type;
    this.val = val;
  }

  // canonicalize can be used to trim or parse wrapped strings
  static create = (
    canonicalize: <T>(t: T) => T,
    type: string,
    s: string) =>
    new Id(type, canonicalize(s))

  apply = (f: (s: string) => any) => f(this.val);
  value: () => string = () => this.apply(identity);
  toString = this.value;
  eq = (x: Id) => this.type === x.type && this.val === x.val;
}

// In OLI, a course is technically different from a package. A course is a set of packages.
// For example the course "computing at carnegie mellon" has a package for each course version.
// However, we generally use course and package synonymously in the author.
// Authoring "courses" are saved as packages in the database with a unique GUID and a globally
// unique id-version combo, something like `c_at_cm-3.3`.
// The id-version combo is called an identifier, and fully qualifies the course in both the author
// and the legacy OLI database.

export class CourseId extends Id {
  static of = (id: string) => new CourseId('CourseId', id);
}
export class CourseGuid extends Id {
  static of = (guid: string) => new CourseGuid('CourseGuid', guid);
}
export class CourseIdVers extends Id {
  static of = (id: string, v: string) => {
    const courseIdentifier = id + '-' + v;
    return new CourseIdVers('CourseIdentifier', courseIdentifier);
  }
}

// Resources are saved directly in the authoring database with a unique GUID and
// unique-per-course ID
export class ResourceGuid extends Id {
  static of = (guid: string) => new ResourceGuid('ResourceGuid', guid);
}

export class ResourceId extends Id {
  static of = (guid: string) => new ResourceId('ResourceId', guid);
}

// A resource is built from many content items, which are generally identified by their
// ID in the xml, but not all content items have IDs.
export class ContentId extends Id {
  static of = (guid: string) => new ContentId('ContentId', guid);
}

export type CourseTitle = string;

// Documents are a wrapper that link a single resource (or course, if it's under active edit
// in the CourseEditor) to the course it belongs to. Resources do not contain any information
// about the course they belong to when fetched from the server.
export type DocumentId = ResourceId | ResourceGuid | CourseIdVers;

export type DataSetGuid = { type: 'DataSetGuid', value: string };

export type UserId = string;

// Create an actual type
export enum LegacyTypes {
  package = 'x-oli-package',
  workbook_page = 'x-oli-workbook_page',
  assessment2 = 'x-oli-assessment2',
  inline = 'x-oli-inline-assessment',
  feedback = 'x-oli-feedback',
  organization = 'x-oli-organization',
  learning_objective = 'x-oli-objective',
  learning_objectives = 'x-oli-learning_objectives',
  skill = 'x-oli-skill',
  skills_model = 'x-oli-skills_model',
  webcontent = 'x-oli-webcontent',
  assessment2_pool = 'x-oli-assessment2-pool',
}

export type FormativeAssessment = LegacyTypes.inline;
export type SummativeAssessment = LegacyTypes.assessment2;
export type FeedbackAssessment = LegacyTypes.feedback;
export type QuestionPool = LegacyTypes.assessment2_pool;

export type AssessmentType =
  FormativeAssessment |
  SummativeAssessment |
  FeedbackAssessment |
  QuestionPool;

export interface HasGuid {
  guid: string;
}

export interface Cloneable<T> {
  clone(): T;
}

export interface Persistable {
  toPersistence(): Object;
}

export type PaginatedResponse<T> = {
  offset: number;
  limit: number;
  order: string;
  orderBy: string;
  numResults: number;
  totalResults: number;
  results: T[];
};
