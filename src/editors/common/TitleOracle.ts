
export interface TitleOracle {
  getTitle: (id: string, type: string) => Promise<string>;
}

// TODO create a title oracle that pulls from 
// a prepopulated cache or just simply makes a server
// request to retrieve the title

export class MockTitleOracle implements TitleOracle {
  
  getTitle(id: string, type: string) : Promise<string> {
    return Promise.resolve('Skill' + id)
  }

}