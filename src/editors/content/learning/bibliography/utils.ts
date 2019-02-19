
import * as contentTypes from 'data/contentTypes';

export const entryInstances = {
  Article: new contentTypes.Article(),
  Book: new contentTypes.Book(),
  Booklet: new contentTypes.Booklet(),
  Conference: new contentTypes.Conference(),
  InBook: new contentTypes.InBook(),
  InCollection: new contentTypes.InCollection(),
  InProceedings: new contentTypes.InProceedings(),
  Manual: new contentTypes.Manual(),
  MastersThesis: new contentTypes.MastersThesis(),
  PhdThesis: new contentTypes.PhdThesis(),
  Proceedings: new contentTypes.Proceedings(),
  TechReport: new contentTypes.TechReport(),
  Misc: new contentTypes.Misc(),
  Unpublished: new contentTypes.Unpublished(),
};
