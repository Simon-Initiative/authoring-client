
export enum ContentTypes {
  Before = 'Before',
  Dependencies = 'Dependencies',
  Dependency = 'Dependency',
  Icon = 'Icon',
  Include = 'Include',
  Item = 'Item',
  Labels = 'Labels',
  Module = 'Module',
  Precondition = 'Precondition',
  Preconditions = 'Preconditions',
  PreferenceValues = 'PreferenceValues',
  ProgressConstraints = 'ProgressConstraints',
  ProgressConstraint = 'ProgressConstraint',
  ResourceRef = 'ResourceRef',
  Schedule = 'Schedule',
  Section = 'Section',
  Sequence = 'Sequence',
  Sequences = 'Sequences',
  SupplementGroup = 'SupplementGroup',
  Supplements = 'Supplements',
  Supplement = 'Supplement',
  Unit = 'Unit',
  Unordered = 'Unordered',
}

export enum AudienceTypes {
  Instructor = 'instructor',
  Student = 'student',
  All = 'all',
}

export enum DependencyTypes {
  Suggests = 'suggests',
  Requires = 'requires',
}

export enum GrainSizes {
  Sequence = 'sequence',
  Unit = 'unit',
  Module = 'module',
  Section = 'section',
  Item = 'item',
}

export enum ConditionTypes {
  None = 'none',
  Accessed = 'accessed',
  Started = 'started',
  Completed = 'completed',
}

export enum PurposeTypes {
  Alternate = 'alterante',
  Checkpoint = 'checkpoint',
  DidIGetThis = 'didigetthis',
  Lab = 'lab',
  LearnByDoing = 'learnbydoing',
  LearnMore = 'learnmore',
  ManyStudentsWonder = 'manystudentswonder',
  MyResponse = 'myresponse',
  Quiz = 'quiz',
  Simulation = 'simulation',
  Walkthrough = 'walkthrough',
}

export enum ActivityReportTypes {
  LikertBar = 'likert_bar',
}

export enum ScoringModes {
  Default = 'default',
  SuggestScored = 'suggest_scored',
  SuggestNotScored = 'suggest_not_scored',
  RequireNotScored = 'require_not_scored',
}

export enum CategoryTypes {
  Content = 'content',
  Introduction = 'introduction',
  Supplement = 'supplement',
}

