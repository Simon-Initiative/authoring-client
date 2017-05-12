import * as persistence from '../data/persistence';
import * as models from '../data/models';
import { requestActions } from './requests';
import { credentials, getHeaders } from './utils/credentials';
import { configuration } from './utils/config';

export type COURSE_CHANGED = 'COURSE_CHANGED';
export const COURSE_CHANGED = 'COURSE_CHANGED';


// export type courseChangedAction = {
// 	type: COURSE_CHANGED,
// 	courseId: string,
// 	title: string,
// 	organizationId: string,
// 	LOId: string,
// 	skillsId: string
// }

export type courseChangedAction = {
	type: COURSE_CHANGED,
	model: models.CourseModel
}

// export function courseChanged(courseId: string, title: string, organizationId: string, LOId: string, skillsId: string) : courseChangedAction {
// 	return {
// 		type: COURSE_CHANGED,
// 		courseId,
// 		title,
// 		organizationId,
//     LOId,
//     skillsId
// 	}
// }

export function courseChanged(model: models.CourseModel) : courseChangedAction {
	return {
		type: COURSE_CHANGED,
		model
	}
}

// export function changeCourse(courseId: string) {
// 	return function(dispatch) {
// 		persistence.retrieveDocument(courseId)
//       .then(document => {
//         switch (document.model.modelType) {
// 					case models.ModelTypes.CourseModel:
// 						const model : models.CourseModel = document.model;
// 						dispatch(courseChanged(courseId,
// 							model.title.text,
// 							model.organizations.get(0),
// 							model.learningobjectives.get(0),
// 							model.skills.get(0)));
// 					default:
// 						console.log('unexpected model type');
// 				}
//       })
//       .catch(err => console.log(err));
// 	}
// }
