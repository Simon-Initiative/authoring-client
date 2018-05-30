import { LegacyTypes } from 'data/types';

type PathElement = {
  name: string;
  parent: PathElement;
};

export type Edge = {
  rev: number;
  guid: string;
  relationship: string;
  sourceGuid: string;
  sourceId: string;
  sourceType: LegacyTypes;
  destinationGuid: string;
  destinationId: string;
  destinationType: LegacyTypes;
  referenceType: string;
  status: string;
  metadata: {
    jsonObject: {
      pathInfo: PathElement;
      sourceGuid: string;
    };
  };
};
