type LocaleCodes = {
  [Friendly in LocaleFriendly]: LocaleCode;
};

export type LocaleFriendly =
  | 'Arabic'
  | 'Chinese (Mandarin)'
  | 'English (Great Britain)'
  | 'English (USA)'
  | 'French'
  | 'German'
  | 'Italian'
  | 'Japanese'
  | 'Russian'
  | 'Spanish (LATAM)'
  | 'Spanish (Spain)';

export type LocaleCode =
  | 'ar'
  | 'de'
  | 'en_GB'
  | 'en_US'
  | 'es'
  | 'es_419'
  | 'fr'
  | 'it'
  | 'ja'
  | 'ru'
  | 'zh_CN';

export const localeCodes: LocaleCodes = {
  Arabic: 'ar',
  'Chinese (Mandarin)': 'zh_CN',
  'English (Great Britain)': 'en_GB',
  'English (USA)': 'en_US',
  French: 'fr',
  German: 'de',
  Italian: 'it',
  Japanese: 'ja',
  Russian: 'ru',
  'Spanish (LATAM)': 'es_419',
  'Spanish (Spain)': 'es',
};
