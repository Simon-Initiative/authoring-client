import * as persistence from '../../data/persistence';

export interface TitleOracle {
  getTitle: (courseId: string, id: string, type: string) => Promise<string>;
}

// TODO create a title oracle that pulls from 
// a prepopulated cache or just simply makes a server
// request to retrieve the title

const titleCache = {};

export class MockTitleOracle implements TitleOracle {
  
  getTitle(courseId: string, id: string, type: string) : Promise<string> {
    
    if (type !== 'AssessmentModel') {
      return Promise.resolve('Skill ' + id);
    }

    if (titleCache[id] === undefined) {

      return new Promise((resolve, reject) => {
        persistence.retrieveDocument(courseId, id)
        .then(doc => {
          switch (doc.model.modelType) {
            case 'AssessmentModel':
              titleCache[id] = doc.model.title.text;
              resolve(titleCache[id]);
              break;
          }
        });
      });

    } else {
      return Promise.resolve(titleCache[id]);
    }

  }

}