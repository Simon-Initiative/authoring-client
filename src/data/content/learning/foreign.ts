type LocaleCodes = {
  [Code in LocaleCode]: string;
};

export type LocaleCode =
  | 'Default'
  | 'ar'
  | 'de'
  | 'en_GB'
  | 'en_US'
  | 'es'
  | 'es_419'
  | 'fr'
  | 'it'
  | 'ru'
  | 'zh_CN';

export const localeCodes: LocaleCodes = {
  Default: 'Default',
  ar: 'Arabic',
  zh_CN: 'Chinese (Mandarin)',
  en_GB: 'English (Great Britain)',
  en_US: 'English (USA)',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  ru: 'Russian',
  es_419: 'Spanish (LATAM)',
  es: 'Spanish (Spain)',
};
