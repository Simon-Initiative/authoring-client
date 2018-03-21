
export function asDecimal(value: number) : string {
  return value + '';
}

export function asDecimalLeadingZero(value: number, maxNumber: number) : string {
  const totalDigits = Math.floor(Math.log10(maxNumber)) + 2;
  const asString = value + '';
  return '0'.repeat(totalDigits - asString.length) + asString;
}


const memoizedRomans = {};

const key = ['','C','CC','CCC','CD','D','DC','DCC','DCCC','CM',
  '','X','XX','XXX','XL','L','LX','LXX','LXXX','XC',
  '','I','II','III','IV','V','VI','VII','VIII','IX'];

export function asUpperRoman(value: number) : string {

  if (memoizedRomans[value] === undefined) {

    const digits = String(value).split('');

    let roman = '';
    let i = 3;
    while (i -= 1) {
      roman = (key[+digits.pop() + (i * 10)] || '') + roman;
    }
    memoizedRomans[value] = Array(+digits.join('') + 1).join('M') + roman;
  }
  return memoizedRomans[value];
}

export function asLowerRoman(value: number) : string {
  return asUpperRoman(value).toLowerCase();
}

// Does not support beyond 26, simply wraps around back to 'A'
export function asUpperAlpha(value: number) : string {
  return String.fromCharCode(64 + (value % 26));
}

// Does not support beyond 26, simply wraps around back to 'a'
export function asLowerAlpha(value: number) : string {
  return String.fromCharCode(96 + (value % 26));
}
