import { LegacyTypes } from 'data/types';

export type PathElement = {
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


/**
 * Edge sourceIds and destinationIds are guaranteed to have 3 parts e.g.
 * package:version:resourceid. This returns the last part, which is
 * the actual resource id
 * @param fullId sourceId or destinationId
 */
export const resourceId = (fullId: string) => fullId.split(':')[2];
