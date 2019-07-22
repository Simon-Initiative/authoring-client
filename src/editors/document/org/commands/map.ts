import * as t from 'data/contentTypes';
import { CreateNewAssessmentCommand } from 'editors/document/org/commands/new/assessment';
import { CreateNewWorkbookPageCommand } from 'editors/document/org/commands/new/workbookpage';
import {
  AddExistingWorkbookPageCommand,
} from 'editors/document/org/commands/existing/workbookpage';
import { AddExistingAssessmentCommand } from 'editors/document/org/commands/existing/assessment';
import { AddContainerCommand } from 'editors/document/org/commands/new/container';

export const ADD_EXISTING_COMMANDS = {
  [t.OrganizationContentTypes.Sequences]: [],
  [t.OrganizationContentTypes.Sequence]: [],
  [t.OrganizationContentTypes.Unit]: [
    AddExistingWorkbookPageCommand,
    AddExistingAssessmentCommand,
  ],
  [t.OrganizationContentTypes.Module]: [
    AddExistingWorkbookPageCommand,
    AddExistingAssessmentCommand,
  ],
  [t.OrganizationContentTypes.Section]: [
    AddExistingWorkbookPageCommand,
    AddExistingAssessmentCommand,
  ],
  [t.OrganizationContentTypes.Item]: [],
  [t.OrganizationContentTypes.Include]: [],
};

export const ADD_NEW_COMMANDS = {
  [t.OrganizationContentTypes.Sequences]: [
    AddContainerCommand,
  ],
  [t.OrganizationContentTypes.Sequence]: [
    AddContainerCommand,
  ],
  [t.OrganizationContentTypes.Unit]: [
    AddContainerCommand,
    CreateNewWorkbookPageCommand,
    CreateNewAssessmentCommand,
  ],
  [t.OrganizationContentTypes.Module]: [
    AddContainerCommand,
    CreateNewWorkbookPageCommand,
    CreateNewAssessmentCommand,
  ],
  [t.OrganizationContentTypes.Section]: [
    AddContainerCommand,
    CreateNewWorkbookPageCommand,
    CreateNewAssessmentCommand,
  ],
  [t.OrganizationContentTypes.Item]: [],
  [t.OrganizationContentTypes.Include]: [],
};
