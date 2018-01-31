
export enum LogLevel {
  Debug,
  Info,
  Warning,
}

export enum Tags {
  Serialization = 'serialization',
  EditorActions = 'editorActions',
  EditorLifecyle = 'editorLifecycle',
}

const settings = {
  logLevel: LogLevel.Info,
  enabledTags: {},
};

export function log(message: string, logLevel: LogLevel, ...tags: Tags[]) {
  if ((tags.length === 0 || tags.some(t => settings.enabledTags[t]))
    && logLevel >= settings.logLevel) {
    console.log(message);
  }
}

export function setLogLevel(level: LogLevel) {
  settings.logLevel = level;
}

export function enableTags(...tags: Tags[]) {
  tags.forEach(t => settings.enabledTags[t] = true);
}

export function disableTags(...tags: Tags[]) {
  tags.forEach(t => delete settings.enabledTags[t]);
}
