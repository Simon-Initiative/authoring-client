import * as t from '../../../../data/contentTypes';

import { AddModuleCommand } from './new/module';
import { AddSectionCommand } from './new/section';
import { AddSequenceCommand } from './new/sequence';
import { AddUnitCommand } from './new/unit';
import { CreateNewAssessmentCommand } from './new/assessment';
import { CreateNewWorkbookPageCommand } from './new/workbookpage';


import { AddExistingWorkbookPageCommand } from './existing/workbookpage';
import { AddExistingAssessmentCommand } from './existing/assessment';

export const VALID_COMMANDS = {
  [t.OrganizationContentTypes.Sequence]: [AddUnitCommand, AddModuleCommand],
  
  [t.OrganizationContentTypes.Unit]: [AddModuleCommand, 
    AddExistingWorkbookPageCommand, 
    AddExistingAssessmentCommand],
  
  [t.OrganizationContentTypes.Module]: [AddSectionCommand,
    AddExistingWorkbookPageCommand, 
    AddExistingAssessmentCommand],
  
  [t.OrganizationContentTypes.Section]: [AddSectionCommand, 
    AddExistingWorkbookPageCommand, 
    AddExistingAssessmentCommand],
  
  [t.OrganizationContentTypes.Item]: [],
  
  [t.OrganizationContentTypes.Include]: [],
};
