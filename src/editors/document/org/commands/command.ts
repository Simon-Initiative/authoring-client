import * as models from '../../../../data/models';
import { AppServices } from '../../../common/AppServices';
import { AppContext } from '../../../common/AppContext';
import * as t from '../../../../data/contentTypes';

export interface Command {

  // Execute this command given state and context. 
  execute(
    org: models.OrganizationModel, 
    node: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include,
    context: AppContext, 
    services: AppServices) : Promise<models.OrganizationModel>;

  // Determines if the preconditions required for this command to be able
  // to be executed are met.  This can be used to determine, for example, if
  // a toolbar button that exposes a command should be enabled or disabled. 
  precondition(
    org: models.OrganizationModel, 
    node: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include,
    context: AppContext): boolean;

  description() : string;
}

export abstract class AbstractCommand implements Command {
  
  abstract execute(
    org: models.OrganizationModel, 
    node: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include,
    context: AppContext, 
    services: AppServices) : Promise<models.OrganizationModel>;
  
  precondition(
    org: models.OrganizationModel, 
    node: t.Sequences | t.Sequence | t.Unit | t.Module  | t.Section | t.Item | t.Include,
    context: AppContext): boolean {
    
    return true;
  }

  abstract description() : string;
}
