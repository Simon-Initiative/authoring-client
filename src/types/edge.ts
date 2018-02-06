type PathElement = {
  name: string;
  parent: PathElement;
};

export type Edge = {
  rev: number;
  guid: string;
  relationship: string;
  sourceId: string;
  sourceType: string;
  destinationId: string;
  destinationType: string;
  referenceType: string;
  status: string;
  metadata: {
    jsonObject: {
      pathInfo: PathElement;
      sourceGuid: string;
    };
  };
};
