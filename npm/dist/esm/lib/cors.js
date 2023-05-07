const cors = (opts = {}) => (rev, next) => {
  if (opts.origin !== false) {
    if (opts.origin === true)
      opts.origin = "*";
    rev.response.setHeader("access-control-allow-origin", opts.origin?.toString() ?? "*");
  }
  opts.optionsStatus ??= 204;
  opts.preflight ??= false;
  if (opts.credentials) {
    rev.response.setHeader("access-control-allow-credentials", "true");
  }
  if (opts.exposeHeaders) {
    rev.response.setHeader("access-control-expose-headers", opts.exposeHeaders.toString());
  }
  if (opts.customHeaders)
    rev.response.header(opts.customHeaders);
  if (rev.request.method === "OPTIONS") {
    opts.allowMethods ??= "GET,HEAD,PUT,PATCH,POST,DELETE";
    rev.response.setHeader("access-control-allow-headers", opts.allowHeaders?.toString() ?? rev.request.headers.get("access-control-request-headers") ?? "*");
    rev.response.setHeader("access-control-allow-methods", opts.allowMethods.toString());
    if (opts.maxAge) {
      rev.response.setHeader("access-control-max-age", opts.maxAge.toString());
    }
    if (opts.preflight)
      return next();
    rev.response.status(opts.optionsStatus);
    return null;
  }
  return next();
};
var cors_default = cors;
export {
  cors,
  cors_default as default
};
