import * as persistence from '../../../data/persistence';
import { titlesForCoursesResources } from '../../../data/domain';

export type CourseResource = {
  _id: string,
  title: string,
  type: string
}

export function fetchCourseResources(courseId: string) : Promise<CourseResource[]> {
  
  return new Promise((resolve, reject) => {
    persistence.queryDocuments(titlesForCoursesResources(courseId))
      .then(docs => {

        const resources : CourseResource[] = [];
        docs.forEach((doc : any) => {
          if (doc.modelType === 'WorkbookPageModel') {
            resources.push({ _id: doc._id, title: doc.workbook_page['#array'][0].head['#array'][0].title['#text'] , type: 'WorkbookPageModel'});
          } else {
            resources.push({ _id: doc._id, title: doc.assessment['#array'][0].title['#text'] , type: 'AssessmentModel'});
          }
        })

        resolve(resources);

    });
  });
  
}