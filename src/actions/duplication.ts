
import { State } from 'reducers';
import * as Immutable from 'immutable';
import { Dispatch } from 'redux';
import * as persistence from 'data/persistence';
import { ContentModel } from 'data/models';
import * as viewActions from 'actions/view';
import * as courseActions from 'actions/course';
import { LegacyTypes } from 'data/types';
import guid from 'utils/guid';
import { Resource } from 'data/content/resource';
import * as messageActions from 'actions/messages';
import * as Messages from 'types/messages';
import { Priority } from 'types/messages/message';
import { Title } from 'data/contentTypes';
import { dupeOrgNode } from 'actions/models';
import { Sequences } from 'data/content/org/sequences';
import { orgLoaded } from 'actions/orgs';

function buildMessage() {
  const content = new Messages.TitledContent().with({
    title: 'Resource copied',
    message: 'You are now editing the copy.',
  });

  return new Messages.Message().with({
    content,
    scope: Messages.Scope.Resource,
    severity: Messages.Severity.Information,
    priority: Priority.High,
    canUserDismiss: true,
  });
}

export function duplicate(model: ContentModel) {
  return function (dispatch: Dispatch, getState: () => State) {

    if (model.modelType === 'AssessmentModel'
      || model.modelType === 'WorkbookPageModel'
      || model.modelType === 'PoolModel'
      || model.modelType === 'FeedbackModel'
      || model.modelType === 'OrganizationModel') {

      const courseId = getState().course.guid;

      // Adjust the title to reflect that it is a copy
      const title = model.resource.title + ' (copy)';
      const resource = model.resource.with({ id: guid(), title });
      let updated = model.with({ resource });

      // For certain resources the title is in other places beyond
      // the resource:
      if (updated.modelType === 'WorkbookPageModel') {
        const head = updated.head.with({ title: Title.fromText(title) });
        updated = updated.with({ head });
      } else if (updated.modelType === 'FeedbackModel') {
        updated = updated.with({ title: Title.fromText(title) });
      } else if (updated.modelType === 'AssessmentModel') {
        updated = updated.with({ title: Title.fromText(title) });
      } else if (updated.modelType === 'PoolModel') {
        updated = updated.with({ id: resource.id });
        updated = updated.with({ pool: updated.pool.with({ id: resource.id }) });
      } else if (model.modelType === 'OrganizationModel') {
        const id = updated.id;
        updated = updated.with({
          title,
          guid: id,
          id: courseId + '_' + title.toLowerCase().split(' ')[0] +
            '_' + id.substring(id.lastIndexOf('-') + 1),
          sequences: dupeOrgNode(model.sequences) as Sequences,
        });
      }

      return persistence.createDocument(courseId, updated)
        .then((doc) => {

          // Use the current org from the router, if one present (which
          // it should be), otherwise just grab the first org we find
          // in the course
          let orgId = getState().router.orgId.caseOf({
            just: id => id,
            nothing: () => getState().course.resources
              .toArray()
              .filter(r => r.type === LegacyTypes.organization)[0].guid,
          });
          // If we are duplicating an org, switch to it
          if (model.modelType === 'OrganizationModel') {
            orgId = doc.model.guid;
            // This is required to keep the app in sync with the newly active org
            dispatch(orgLoaded(doc));
          }

          const updatedResources = Immutable.OrderedMap<string, Resource>(
            [[(doc as any).model.resource.guid, (doc as any).model.resource]]);
          dispatch(courseActions.updateCourseResources(updatedResources));
          dispatch(viewActions.viewDocument(doc._id, courseId, orgId));

          // This is unfortunate, but we must delay showing the message until
          // we suspec that the view has been completely transitioned, otherwise
          // the view transition will dismiss resource scoped messages
          setTimeout(
            () => dispatch(messageActions.showMessage(buildMessage())),
            2000);

          return doc;
        });
    }

  };
}
