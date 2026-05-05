/**
 * Google Analytics Tracking Utility
 */

export const trackEvent = (eventName, params = {}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, params);
  }
};

export const trackPageView = (pagePath) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', 'G-MMTV498B8J', {
      page_path: pagePath,
    });
  }
};
