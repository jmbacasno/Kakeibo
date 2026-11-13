import helmet from "helmet";

// Configure helmet middleware prioritizing CSP policies that tolerate iframe-nested rendering and fast asset loads
export const securityHeadersMiddleware = helmet({
  frameguard: false, // Prevents loading issues in Google AI Studio embedded iframe preview
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "frame-ancestors": ["*"], // Enable embedded UI previewing
      "default-src": ["'self'", "https:", "http:"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
      "style-src": ["'self'", "'unsafe-inline'", "https:", "http:"],
      "img-src": ["'self'", "data:", "blob:", "https:", "http:"],
      "connect-src": ["'self'", "wss:", "ws:", "https:", "http:"],
    },
  },
});
