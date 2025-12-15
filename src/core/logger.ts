/**
 * Simple logger for engine debugging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

let currentLogLevel = LogLevel.INFO;

export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

export function debug(...args: unknown[]): void {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.debug('[VERTO]', ...args);
  }
}

export function info(...args: unknown[]): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.log('[VERTO]', ...args);
  }
}

export function warn(...args: unknown[]): void {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn('[VERTO]', ...args);
  }
}

export function error(...args: unknown[]): void {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error('[VERTO]', ...args);
  }
}
