// Date related utils

import { fetchServerTime } from '../data/persistence';


export function determineServerTimeSkewInMs() : Promise<number> {

  return new Promise((resolve, reject) => {
    fetchServerTime()
      .then(serverDate => resolve(serverDate.getTime() - Date.now()))
      .catch((err) => {
        resolve(0);
      });
  });
}
 
export function compareDates(a: Date, b: Date) : number {
  return a.valueOf() - b.valueOf();
}

export function relativeToNow(a: Date) : string {
  return relativeTo(a, new Date());
}

// Take a date and return a new date taking into account
// some amount of time skew
export function adjustForSkew(a: Date, skewInMs: number) : Date {
  return new Date(a.getTime() + skewInMs);
}

/**
 * Returns a string indicating how long it is been from one date
 * to another, in the most reasonable unit.
 * @param dateFrom the date to compare against
 * @param dateNow the date to compare
 */
function relativeTo(dateFrom: Date, dateNow: Date) : string {

  const delta = dateNow.getTime() - dateFrom.getTime();

  const MS_IN_SECOND = 1000;
  const MS_IN_MINUTE = 60 * MS_IN_SECOND;
  const MS_IN_HOUR = 60 * MS_IN_MINUTE;
  const MS_IN_DAY = 24 * MS_IN_HOUR;
  const MS_IN_WEEK = 7 * MS_IN_DAY;
  const MS_IN_MONTH = 30.5 * MS_IN_DAY;
  const MS_IN_YEAR = 365 * MS_IN_DAY;


  if (delta >= (MS_IN_YEAR * 2)) {
    return  Math.floor(delta / MS_IN_YEAR) + ' years ago';
  } else if (delta >= (MS_IN_YEAR - MS_IN_MONTH)) {
    return 'a year ago';
  } else if (delta >= (MS_IN_MONTH * 2)) {
    return Math.floor(delta / MS_IN_MONTH) + ' months ago';
  } else if (delta > (MS_IN_MONTH)) {
    return 'a month ago';
  } else if (delta >= (MS_IN_WEEK * 2)) {
    return  Math.floor(delta / MS_IN_WEEK) + ' weeks ago';
  } else if (delta >= MS_IN_WEEK - MS_IN_DAY) {
    return 'a week ago';
  } else if (delta >= MS_IN_DAY * 2) {
    return Math.floor(delta / MS_IN_DAY) + ' days ago';
  } else if (delta >= MS_IN_DAY) {
    return 'a day ago';
  } else if (delta >= MS_IN_HOUR * 2) {
    return Math.floor(delta / MS_IN_HOUR) + ' hours ago';
  } else if (delta >= MS_IN_HOUR) {
    return 'an hour ago';
  } else if (delta >= MS_IN_MINUTE * 2) {
    return Math.floor(delta / MS_IN_MINUTE) + ' minutes ago';
  } else if (delta >= MS_IN_MINUTE) {
    return 'a minute ago';
  } else if (delta >= 7 * MS_IN_SECOND) {
    return Math.floor(delta / MS_IN_SECOND) + ' seconds ago';
  } else if (delta >= 2 * MS_IN_SECOND) {
    return 'a few seconds ago';
  } else {
    return 'just now';
  }
}
