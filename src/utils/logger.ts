const LOG_LABEL = 'ssasy-ext';

export type LogType = 'info' | 'error';

interface Log {
  type: LogType;
  title: string;
  message: any;
  timestamp: number;
}

export type GenericLog = Log;

export type InfoLog = Log & { type: 'info' };

export type ErrorLog = Log & { type: 'error' };

export type Context = 'background' | 'popup' | 'options' | 'content-script';

type ContextLable = 'cs' | 'bg' | 'pop' | 'opt' | 'unknown';

type ContextEmoji = '🖥️' | '⛓️' | '📣' | '⚙️' | '❓';

/**
 * Returns an abbreviated context label
 *
 * @param context - Runtime context
 * @returns abbreviated context label
 */
function getContextLabel(context?: Context): ContextLable {
  let label: ContextLable;

  switch (context) {
  case 'popup':
    label = 'pop';
    break;

  case 'options':
    label = 'opt';
    break;

  case 'content-script':
    label = 'cs';
    break;

  case 'background':
    label = 'bg';
    break;

  default:
    label = 'unknown';
  }

  return label;
}

/**
 * Returns an emoji for the context
 * 
 * @param context - Runtime context
 * @returns emoji for context
 */
function getContextEmoji(context?: Context): ContextEmoji {
  let emoji: ContextEmoji;

  switch (context) {
  case 'popup':
    emoji = '📣';
    break;

  case 'options':
    emoji = '⚙️';
    break;

  case 'content-script':
    emoji = '🖥️';
    break;

  case 'background':
    emoji = '⛓️';
    break;

  default:
    emoji = '❓';
  }

  return emoji;
}

/**
 * Converts text to JSON string if it is an object
 *
 * @param text - Text to format
 * @returns text
 */
function formatText(text: any) {
  if (typeof text === 'object') {
    return JSON.stringify(text);
  }

  return text;
}

/**
 * Returns a formatted notification
 *
 * @param notification - Notification to format
 * @returns string
 */
export function formatLog(log: Log, context?: Context): string {
  const contextLabel: string = getContextLabel(context);
  const contextEmoji: string = getContextEmoji(context);

  // context shows where the log was called from
  const extensionContext: string = `[${LOG_LABEL}-${contextLabel}] ${contextEmoji}`;
  
  // text is the title and message of the log
  let text = log.title && log.message
    ? `${log.title}: ${formatText(log.message)}`
    : log.title || formatText(log.message);

  // capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1);

  return `${extensionContext} ${text}`;
}

/**
 * Returns log and context from arguments passed to log function
 * @param args - arguments passed to the log function
 * @param type - type of log
 * @returns
 */
function extractLogDetails(
  args: any[],
  type: LogType
): { log: Log; context?: Context } {
  let log: Log;
  let context: Context | undefined;

  // only title or log was provided
  if (args.length === 1) {
    if (typeof args[0] === 'string') {
      log = {
        type: type,
        title: args[0],
        message: undefined,
        timestamp: Date.now()
      };
    } else {
      log = args[0];
    }

    context = undefined;
  }

  // title and message or log and context were provided
  else if (args.length === 2) {
    if (typeof args[0] === 'string') {
      log = {
        type: type,
        title: args[0],
        message: args[1],
        timestamp: Date.now()
      };

      context = undefined;
    } else {
      log = args[0];
      context = args[1];
    }
  }

  // title, message and context were provided
  else {
    log = {
      type: type,
      title: args[0],
      message: args[1],
      timestamp: Date.now()
    };

    context = args[2];
  }

  return { log, context };
}

function logInfo(log: InfoLog, context?: Context): string;
function logInfo(title: string, message: unknown, context?: Context): string;
function logInfo(...args: any[]): string {
  const { log, context } = extractLogDetails(args, 'info');
  const formattedLog: string = formatLog(log, context);
  console.info(formattedLog);
  return formattedLog;
}

function logError(log: ErrorLog, context?: Context): string;
function logError(title: string, message: unknown, context?: Context): string;
function logError(...args: any[]): string {
  const { log, context } = extractLogDetails(args, 'error');
  const formattedLog: string = formatLog(log, context);
  console.warn(formattedLog);
  return formattedLog;
}

export const Logger = {
  info: logInfo,
  error: logError
};
