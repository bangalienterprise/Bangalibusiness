import * as Sentry from "@sentry/react";

export const logger = {
  error: (message, error) => {
    console.error(message, error);
    Sentry.captureException(error, {
      extra: { message }
    });
  },
  info: (message, data) => {
    console.log(message, data);
    Sentry.addBreadcrumb({
      category: 'info',
      message: message,
      data: data,
      level: 'info'
    });
  },
  warn: (message, data) => {
    console.warn(message, data);
    Sentry.addBreadcrumb({
      category: 'warning',
      message: message,
      data: data,
      level: 'warning'
    });
  }
};
