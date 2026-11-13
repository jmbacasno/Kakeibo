import helmet from "helmet";

export const securityHeadersMiddleware = helmet({
  frameguard: false, // Allows embedded preview rendering
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "frame-ancestors": ["*"],
      "default-src": ["'self'", "https:", "http:"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
      "style-src": ["'self'", "'unsafe-inline'", "https:", "http:"],
      "img-src": ["'self'", "data:", "blob:", "https:", "http:"],
      "connect-src": ["'self'", "wss:", "ws:", "https:", "http:"],
    },
  },
});
