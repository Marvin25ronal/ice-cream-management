/**
 * AppConfig.ts
 *
 * Centralized configuration file for application-wide constants
 * including version, app name, and other metadata.
 */

export const AppConfig = {
  /**
   * Application version
   * Update this when releasing new versions
   */
  VERSION: '0.0.1',

  /**
   * Application name
   */
  APP_NAME: 'Ice Cream Management',

  /**
   * Application short name (for compact displays)
   */
  APP_SHORT_NAME: 'ICM',

  /**
   * Copyright year
   */
  COPYRIGHT_YEAR: '2024',

  /**
   * Company/Developer name
   */
  COMPANY_NAME: 'Ice Cream Management',

  /**
   * Build environment
   */
  ENVIRONMENT: __DEV__ ? 'development' : 'production',

  /**
   * Currency symbol (Guatemalan Quetzales)
   */
  CURRENCY_SYMBOL: 'Q',
} as const;

/**
 * Helper to get formatted version string
 */
export const getVersionString = (includePrefix = true): string => {
  return includePrefix ? `v${AppConfig.VERSION}` : AppConfig.VERSION;
};

/**
 * Helper to get copyright text
 */
export const getCopyrightText = (): string => {
  return `© ${AppConfig.COPYRIGHT_YEAR} ${AppConfig.COMPANY_NAME}`;
};

/**
 * Helper to get full app title with version
 */
export const getAppTitle = (): string => {
  return `${AppConfig.APP_NAME} ${getVersionString()}`;
};
