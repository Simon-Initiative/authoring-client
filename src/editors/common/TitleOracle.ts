import * as persistence from '../../data/persistence';

export interface TitleOracle {
  getTitle: (courseId: string, id: string, type: string) => Promise<string>;
  putTitle: (id: string, title: string) => void; 
}

// TODO create a title oracle that pulls from 
// a prepopulated cache or just simply makes a server
// request to retrieve the title

const titleCache = {};

function fetchSkillTitles(courseId: string, titleOracle)
  : Promise<any> {
  
  return persistence.bulkFetchDocuments(
    courseId, ['x-oli-skills_model'],'byTypes')
    .then ((skills) => {
      skills
        .map(doc => (doc.model as any).skills)
        .reduce((p, c) => [...p, ...c])
        .forEach(r => titleOracle.putTitle(r.id, r.title));
    });
}

function fetchObjectiveTitles(courseId: string, titleOracle)
  : Promise<any> {
  
  return persistence.bulkFetchDocuments(
    courseId, ['x-oli-learning_objectives'],'byTypes')
    .then ((objectives) => {
      objectives
        .map(doc => (doc.model as any).los)
        .reduce((p, c) => [...p, ...c])
        .forEach(r => titleOracle.putTitle(r.id, r.title));
    });
}

export class CachingTitleOracle implements TitleOracle {
  
  constructor(courseId: string) {
    fetchSkillTitles(courseId, this);
    fetchObjectiveTitles(courseId, this);
  }

  putTitle(id: string, title: string) {
    titleCache[id] = title;
  }

  getTitle(courseId: string, id: string, type: string) : Promise<string> {
    
    if (titleCache[id] === undefined) {

      return new Promise((resolve, reject) => {

        if (type === 'skill') {
          fetchSkillTitles(courseId, this)
            .then(() => resolve(titleCache[id]));
        } else if (type === 'objective') {
          fetchObjectiveTitles(courseId, this)
            .then(() => resolve(titleCache[id]));
        } else {
          persistence.retrieveDocument(courseId, id)
            .then((doc) => {
              switch (doc.model.modelType) {
                case 'AssessmentModel':
                  titleCache[id] = doc.model.title.text;
                  resolve(titleCache[id]);
                  break;
              }
            });
        }
      });

    } else {
      return Promise.resolve(titleCache[id]);
    }

  }
}
