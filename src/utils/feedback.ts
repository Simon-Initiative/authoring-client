import { UserState } from 'reducers/user';

export function buildFeedback(name: string, email: string, currentUrl: string) : string {

  const baseUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfrkoCCe2cX5KFKcdzmtb'
    + 'LVNPkTSQeiJ4w0mEBqCNrT6hfceA/viewform?';

  // These keys correspond to named inputs in the Google Form
  const keyToValues = {
    'entry.1045781291': currentUrl,
    emailAddress: email,
    'entry.2005620554': name,
  };

  return Object
    .keys(keyToValues)
    .reduce(
      (url, key, index, arr) => {
        return url + key + '=' + encodeURIComponent(keyToValues[key])
          + ((arr.length === index + 1) ? '' : '&');
      },
      baseUrl);
}

export function buildFeedbackFromCurrent(name: string, email: string) : string {
  return buildFeedback(name, email, (window as any).location.href);
}

export const reportError = (user: UserState) => {
  const userName = user === null
    ? ''
    : user.profile.firstName + ' ' + user.profile.lastName;
  const email = user === null
    ? ''
    : user.profile.email;

  const url = buildFeedbackFromCurrent(userName, email);
  window.open(url, 'error');
};

