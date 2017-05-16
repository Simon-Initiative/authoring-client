import * as persistence from '../data/persistence';
import * as models from '../data/models';
import { requestActions } from './requests';
import { credentials, getHeaders } from './utils/credentials';
import { configuration } from './utils/config';

export type COURSE_CHANGED = 'COURSE_CHANGED';
export const COURSE_CHANGED = 'COURSE_CHANGED';

export type courseChangedAction = {
	type: COURSE_CHANGED,
	model: models.CourseModel
}


export function courseChanged(model: models.CourseModel) : courseChangedAction {
	return {
		type: COURSE_CHANGED,
		model
	}
}

