import serverless from 'serverless-http';
import app from '../../index.js';

// If app is imported from an ESM module, it might be nested under .default
const handlerApp = app.default || app;
export const handler = serverless(handlerApp);
