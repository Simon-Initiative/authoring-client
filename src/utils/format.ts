

export const convert = {



  // Converts a zero-based index to an alpha notation.
  //
  // Examples:
  //   0 -> 'A'
  //   1 -> 'B'
  //   25 -> 'Z'
  //   26 -> 'AA'
  //   27 -> 'AB'
  //
  toAlphaNotation: (index: number): string => {

    let num = index;
    let rem;

    let result = '';

    do {

      rem = num % 26;
      num = Math.floor(num / 26);

      // A pure conversion to base 26 that didn't use 0-9 would
      // have to treat A as the zero.  This leads to a problem where
      // we cannot yield our 'AA' as a desired representation for the
      // value 26, since that effectively is '00', instead this algorithm
      // would produce 'BA' aka '10' in regular base 26.  We can correct
      // this by simply adjusting the first, leftmost digit, when there are
      // more than one digits, by one (turning that leading B into an A).
      const adjustment = num === 0 && result.length !== 0 ? -1 : 0;
      result = String.fromCharCode((rem + adjustment + 65)) + result;

    } while (num !== 0);

    return result;

  },
};
