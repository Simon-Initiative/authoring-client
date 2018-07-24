import * as t from 'data/contentTypes';

import { AddModuleCommand } from 'editors/document/org/commands/new/module';
import { AddSectionCommand } from 'editors/document/org/commands/new/section';
import { AddUnitCommand } from 'editors/document/org/commands/new/unit';
import { CreateNewAssessmentCommand } from 'editors/document/org/commands/new/assessment';
import { CreateNewWorkbookPageCommand } from 'editors/document/org/commands/new/workbookpage';


import {
  AddExistingWorkbookPageCommand,
} from 'editors/document/org/commands/existing/workbookpage';
import { AddExistingAssessmentCommand } from 'editors/document/org/commands/existing/assessment';

export const ADD_EXISTING_COMMANDS = {
  [t.OrganizationContentTypes.Sequence]: [],

  [t.OrganizationContentTypes.Unit]: [AddExistingWorkbookPageCommand,
    AddExistingAssessmentCommand],

  [t.OrganizationContentTypes.Module]: [AddExistingWorkbookPageCommand,
    AddExistingAssessmentCommand],

  [t.OrganizationContentTypes.Section]: [AddExistingWorkbookPageCommand,
    AddExistingAssessmentCommand],

  [t.OrganizationContentTypes.Item]: [],

  [t.OrganizationContentTypes.Include]: [],
};


export const ADD_NEW_COMMANDS = {
  [t.OrganizationContentTypes.Sequence]: [AddUnitCommand, AddModuleCommand],

  [t.OrganizationContentTypes.Unit]: [AddModuleCommand,
    CreateNewWorkbookPageCommand,
    CreateNewAssessmentCommand],

  [t.OrganizationContentTypes.Module]: [AddSectionCommand,
    CreateNewWorkbookPageCommand,
    CreateNewAssessmentCommand],

  [t.OrganizationContentTypes.Section]: [AddSectionCommand,
    CreateNewWorkbookPageCommand,
    CreateNewAssessmentCommand],

  [t.OrganizationContentTypes.Item]: [],

  [t.OrganizationContentTypes.Include]: [],
};
