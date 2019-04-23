import { List } from 'immutable';

const DEFAULT_MAX_HISTORY = Infinity;

export enum LogTag {
  DEFAULT = 'DEFAULT',
  EDITOR = 'EDITOR',
  RAW_HTTP = 'RAW_HTTP',
}

export type Log = {
  tag: LogTag,
  message: string,
  date: Date,
  args: any[],
};

export enum LogLevel {
  SILENT = 'silent',
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  LOG = 'log',
  DEBUG = 'debug',
}

export enum LogAttribute {
  TAG = 'tag',
  DATE = 'date',
  MESSAGE = 'message',
  ARGS = 'args',
}

export enum LogStyle {
  NORMAL = 'font-size: 11px; font-weight: normal; color: black;',
  HEADER = 'font-size: 14px; font-weight: bold;',
  SUBTLE = 'color: gray; font-weight: lighter;',

  BOLD = 'font-weight: bold;',
  ITALIC = 'font-style: italic;',
  BLACK = 'color: black;',
  BLUE = 'color: #2980b9;',
  GREEN = 'color: #27ae60;',
  RED = 'color: #c0392b;',
  ORANGE = 'color: #f39c12;',
  PURPLE = 'color: #8e44ad;',
}

const logLevelValue = (level: LogLevel) => {
  const values = {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
    log: 4,
    debug: 5,
  };

  return values[level] || 5;
};

export type LoggerOptions = {
  maxHistory?: number,
  console?: {
    tagFilters?: LogTag[],
    level?: number,
    visibility?: {
      type?: boolean,
      tag?: boolean,
      date?: boolean,
      message?: boolean,
      args?: boolean,
    },
    colors?: {
      info: string,
      log: string,
      warn: string,
      error: string,
      debug: string,
    },
  },
};

const defaultOptions = {
  maxHistory: DEFAULT_MAX_HISTORY,
  console: {
    tagFilter: undefined,
    level: logLevelValue(LogLevel.LOG),
    visibility: {
      tag: true,
      date: true,
      message: true,
      args: true,
    },
    colors: {
      info: '#2980b9',
      log: '#27ae60',
      warn: '#f39c12',
      error: '#c0392b',
      debug: '#8e44ad',
    },
  },
};

export class Logger {
  options: LoggerOptions;
  history: {
    info: List<Log>,
    log: List<Log>,
    warn: List<Log>,
    error: List<Log>,
    debug: List<Log>,
  };

  constructor() {
    this.options = defaultOptions;

    this.history = {
      info: List<Log>(),
      log: List<Log>(),
      warn: List<Log>(),
      error: List<Log>(),
      debug: List<Log>(),
    };
  }

  error(tag: LogTag, message: string, ...args) {
    const date = new Date();
    this.updateLog(LogLevel.ERROR, tag, date, message, args);
    this.consolePrint(LogLevel.ERROR, tag, date, message, args);

    return this;
  }

  warn(tag: LogTag, message: string, ...args) {
    const date = new Date();
    this.updateLog(LogLevel.WARN, tag, date, message, args);
    this.consolePrint(LogLevel.WARN, tag, date, message, args);

    return this;
  }

  info(tag: LogTag, message: string, ...args) {
    const date = new Date();
    this.updateLog(LogLevel.INFO, tag, date, message, args);
    this.consolePrint(LogLevel.INFO, tag, date, message, args);

    return this;
  }

  log(tag: LogTag, message: string, ...args) {
    const date = new Date();
    this.updateLog(LogLevel.LOG, tag, date, message, args);
    this.consolePrint(LogLevel.LOG, tag, date, message, args);

    return this;
  }

  debug(tag: LogTag, message: string, ...args) {
    const date = new Date();
    this.updateLog(LogLevel.DEBUG, tag, date, message, args);
    this.consolePrint(LogLevel.DEBUG, tag, date, message, args);

    return this;
  }

  styled(type: LogLevel, tag: LogTag, message: string, style: string) {
    const date = new Date();
    this.updateLog(type, tag, date, message, undefined);

    const consoleOptions = this.options.console;
    if (logLevelValue(type) <= consoleOptions.level) {
      console[type]('%c' + message, style);
    }

    return this;
  }

  raw(type: LogLevel, tag: LogTag, ...args) {
    const date = new Date();
    this.updateLog(type, tag, date, ...args);

    const consoleOptions = this.options.console;
    if (logLevelValue(type) <= consoleOptions.level) {
      console[type](...args);
    }

    return this;
  }

  group(
    type: LogLevel, tag: LogTag, message: string,
    cb: (logger: Logger) => void, style?: string) {
    const consoleOptions = this.options.console;

    const loggerWithNewOptions = Object.assign(new Logger(), this, {
      options: JSON.parse(JSON.stringify(this.options)),
    });

    if (logLevelValue(type) <= consoleOptions.level) {
      if (style) {
        console.group(`%c${message}`, style);
      } else {
        console.group(message);
      }
      cb(loggerWithNewOptions);
      console.groupEnd();
    } else {
      cb(loggerWithNewOptions);
    }
  }

  groupCollapsed(
    type: LogLevel, tag: LogTag, message: string,
    cb: (logger: Logger) => void, style?: string) {
    const consoleOptions = this.options.console;

    const loggerWithNewOptions = Object.assign(new Logger(), this, {
      options: JSON.parse(JSON.stringify(this.options)),
    });

    if (logLevelValue(type) <= consoleOptions.level) {
      if (style) {
        console.groupCollapsed(`%c${message}`, style);
      } else {
        console.groupCollapsed(message);
      }
      cb(loggerWithNewOptions);
      console.groupEnd();
    } else {
      cb(loggerWithNewOptions);
    }
  }

  updateLog(type, tag, date, message?, args?) {
    this.history[type] = this.history[type].push({
      tag,
      message,
      date,
      args,
    });

    if (this.history[type].size > this.options.maxHistory) {
      this.history[type] = this.history[type].shift();
    }
  }

  consolePrint(type, tag, date, message, args) {
    const consoleOptions = this.options.console;

    if (logLevelValue(type) <= consoleOptions.level) {
      console[type](...([
        consoleOptions.visibility.tag ? [tag] : undefined,
        consoleOptions.visibility.date ? [date] : undefined,
        consoleOptions.visibility.message ? [message] : undefined,
        consoleOptions.visibility.args ? [...args] : undefined,
      ]).filter(i => i).reduce((acc, i) => acc.concat(i)),
      );
    }

    return this;
  }

  setVisibility(attr: LogAttribute, visible: boolean) {
    this.options.console.visibility[attr] = visible;
    return this;
  }

  setLevel(level: LogLevel) {
    if (this !== (window as any).logger) {
      throw Error('Logger.setLevel can only be called on the global logger (window.logger)');
    }

    this.options.console.level = logLevelValue(level);
    // tslint:disable-next-line:no-console
    console.log('Log level set to ' + level);
    return this;
  }

  setTagFilters(tagFilters: LogTag[]) {
    this.options.console.tagFilters = tagFilters;
    return this;
  }

  resetOptions() {
    this.options = defaultOptions;
    return this;
  }

  clear() {
    this.history = {
      info: List<Log>(),
      log: List<Log>(),
      warn: List<Log>(),
      error: List<Log>(),
      debug: List<Log>(),
    };
    return this;
  }

  setGlobalLogger() {
    (window as any).logger = this;
    return this;
  }
}

export const logger = new Logger().setGlobalLogger();
