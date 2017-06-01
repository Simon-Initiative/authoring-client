
export type DocumentId = string;
export type CourseId = string;
export type UserId = string;

// Create an actual type
export const LegacyTypes = {
  package: 'x-oli-package',
  workbook_page: 'x-oli-workbook_page',
  assessment2: 'x-oli-assessment2',
  inline: 'x-oli-inline-assessment',
  organization: 'x-oli-organization',
  learning_objectives: 'x-oli-learning_objectives',
  skills_model: 'x-oli-skills_model',
  webcontent: 'x-oli-webcontent',
  assessment2_pool: 'x-oli-assessment2-pool',
};

/**
 * Utility function to create a K:V from a list of strings
 */
export function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
  return o.reduce((res, key) => {
    res[key] = key;
    return res;
  }, Object.create(null));
}
