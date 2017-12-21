import * as t from '../../../../data/contentTypes';

import { AddModuleCommand } from './new/module';
import { AddSectionCommand } from './new/section';
import { AddUnitCommand } from './new/unit';
import { CreateNewAssessmentCommand } from './new/assessment';
import { CreateNewWorkbookPageCommand } from './new/workbookpage';


import { AddExistingWorkbookPageCommand } from './existing/workbookpage';
import { AddExistingAssessmentCommand } from './existing/assessment';

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
