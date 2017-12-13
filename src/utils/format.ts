export const convert = {
  toAlphaNotation: (num: number): string => {
    // TODO - handle case where num > 26
    return String.fromCharCode(65 + num);
  },
};
