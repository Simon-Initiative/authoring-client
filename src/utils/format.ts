import { measureTextWidth } from 'utils/measure';

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

  /**
   * Returns the string representation of bytes converted to the correct units.
   * Inspired by Bytes utility https://github.com/visionmedia/bytes.js
   * @param value value to convert to string
   * @param decimalPlaces number of decimal places to include in result
   */
  toByteNotation: (value: number, decimalPlaces: number = 2) => {
    if (!Number.isFinite(value)) {
      return null;
    }

    const UNIT_MAP = {
      b:  1,
      kb: 1 << 10,
      mb: 1 << 20,
      gb: 1 << 30,
      tb: ((1 << 30) * 1024),
    };

    const mag = Math.abs(value);
    let unit;

    if (mag >= UNIT_MAP.tb) {
      unit = 'TB';
    } else if (mag >= UNIT_MAP.gb) {
      unit = 'GB';
    } else if (mag >= UNIT_MAP.mb) {
      unit = 'MB';
    } else if (mag >= UNIT_MAP.kb) {
      unit = 'KB';
    } else {
      unit = 'B';
    }

    const val = value / UNIT_MAP[unit.toLowerCase()];
    const str = val.toFixed(decimalPlaces).replace(/^(.+)\.?[0]+$/, '$1').replace(/\.0$/, '');

    return `${str} ${unit}`;
  },
};

export const stringFormat = {
  /**
   * Returns a truncated version of a string with elipsis
   * @param text string to truncate
   * @param maxLength max length of the truncated string
   * @param postfixLength optional length of the end part of the truncated string to include
   */
  ellipsize: (text: string, maxLength: number, postfixLength: number = 0) => {
    if (maxLength <= postfixLength + 3) {
      throw Error('maxLength must be greater than postfixLength + 3');
    }
    if (text.length > maxLength) {
      const front = text.substr(0, Math.min(maxLength, text.length) - 3 - postfixLength);

      return `${front}...${text.substr(text.length - postfixLength, text.length)}`;
    }

    return text;
  },

  /**
   * Returns a truncated version of a string with ellipsis.
   *
   * WARNING: This might be an expensive call, as it renders the text into a canvas
   * element to measure it
   */
  ellipsizePx: (
    text: string, maxWidth: number, fontFamily: string,
    fontSize: number, fontWeight?: number, fontStyle?: string) => {
    const ellipsizeWidth = measureTextWidth({
      text: '...', fontFamily, fontSize, fontWeight, fontStyle });
    const textWidth = measureTextWidth({
      text, fontFamily, fontSize, fontWeight, fontStyle });

    if (textWidth <= maxWidth) {
      return text;
    }

    if (maxWidth <= ellipsizeWidth) {
      console.error('ellipsizePx: maxWidth must be greater than size of ellipsis \'...\'');
      return '...';
    }

    const findLargestString = (str: string) =>
      measureTextWidth({
        text: `${str}...`, fontFamily, fontSize, fontWeight, fontStyle }) <= maxWidth
        ? str
        : findLargestString(str.substr(0, str.length - 1));

    return findLargestString(text) + '...';
  },
};
