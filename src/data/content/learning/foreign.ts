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
  de: 'German',
  en_GB: 'English (Great Britain)',
  en_US: 'English (USA)',
  es: 'Spanish (Spain)',
  es_419: 'Spanish (LATAM)',
  fr: 'French',
  it: 'Italian',
  ru: 'Russian',
  zh_CN: 'Chinese (Mandarin)',
};
