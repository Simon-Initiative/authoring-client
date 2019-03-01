import * as models from 'data/models';
import * as t from 'data/contentTypes';
import * as org from 'data/models/utils/org';

export interface Command {

  // Execute this command given state and context, yielding an
  // organization change request
  execute(
    org: models.OrganizationModel,
    node: t.Sequence | t.Unit | t.Module | t.Section | t.Item,
    courseModel: models.CourseModel,
    displayModal: (c) => void,
    dismissModal: () => void,
    dispatch,
  ): Promise<org.OrgChangeRequest>;

  // Determines if the preconditions required for this command to be able
  // to be executed are met.  This can be used to determine, for example, if
  // a toolbar button that exposes a command should be enabled or disabled.
  precondition(
    org: models.OrganizationModel,
    node: t.Sequence | t.Unit | t.Module | t.Section | t.Item): boolean;

  description(labels: t.Labels): string;
}

export abstract class AbstractCommand implements Command {

  abstract execute(
    org: models.OrganizationModel,
    node: t.Sequence | t.Unit | t.Module | t.Section | t.Item,
    courseModel: models.CourseModel,
    displayModal: (c) => void,
    dismissModal: () => void, dispatch): Promise<org.OrgChangeRequest>;

  precondition(
    org: models.OrganizationModel,
    node: t.Sequence | t.Unit | t.Module | t.Section | t.Item): boolean {

    return true;
  }

  abstract description(labels: t.Labels): string;
}
