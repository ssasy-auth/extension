import type { RuntimeContext } from 'webext-bridge';

const LOG_LABEL = 'ssasy-ext';

export type LogType = 'info' | 'error';

interface Log {
  type: LogType;
  title: string;
  message: unknown;
}

export type GenericLog = Log;

export type InfoLog = Log & { type: 'info' };

export type ErrorLog = Log & { type: 'error', status?: number };

function getContextLabel(context?: RuntimeContext): string | undefined{
  let label: string | undefined = undefined;

  switch (context) {
  case 'popup':
    label = 'pop'
    break;

  case 'options':
    label = 'opt'
    break;

  case 'content-script':
    label = 'cs'
    break;

  case 'background':
    label = 'bg'
    break;
  }

  return label;
}

/**
 * Returns a formatted notification
 * 
 * @param notification - Notification to format
 * @returns string
 */
export function formatLog(log: Log, context?: RuntimeContext){
  /**
   * emoji for log type
   */
  const emoji = log.type === 'error' ? '❗️' : '📣';

  /**
   * context label, if context is provided
   */
  const contextLabel = getContextLabel(context);

  /**
   * label for log
   */
  const label = contextLabel ? `[${LOG_LABEL}-${contextLabel}]` : `[${LOG_LABEL}]`;

  /**
   * text for log. shows title and message if they are provided
   */
  const text = log.title && log.message ? `${log.title} - ${log.message}` : log.title || log.message;


  return `${label} ${emoji} ${text}`;
}

function logInfo (log: InfoLog, context?: RuntimeContext): string;
function logInfo (title: string, message: unknown, context?: RuntimeContext): string;
function logInfo (...args: any[]): string {
  let log: InfoLog;
  let context: RuntimeContext | undefined;
  
  if(args.length === 2){
    log = args[0];
    context = args[1];
  } else {
    log = {
      type: 'info',
      title: args[0],
      message: args[1]
    }
    context = args[2];
  }

  const formattedLog: string = formatLog(log, context);
  console.info(formattedLog);
  return formattedLog;
}

function logError (log: ErrorLog, context?: RuntimeContext): string;
function logError (title: string, message: unknown, context?: RuntimeContext): string;
function logError (...args: any[]): string {
  let log: ErrorLog;
  let context: RuntimeContext | undefined;
  
  if(args.length === 2){
    log = args[0];
    context = args[1];
  } else {
    log = {
      type: 'error',
      title: args[0],
      message: args[1]
    }
    context = args[2];
  }

  const formattedLog: string = formatLog(log, context);
  console.warn(formattedLog);
  return formattedLog;
}

export const Logger = {
  info: logInfo,
  error: logError
}