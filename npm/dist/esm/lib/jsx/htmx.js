import { createHookScript } from "./hook.js";
const htmx = (opts = {}) => {
  opts.src ??= "//unpkg.com/htmx.org";
  return (rev, next) => {
    rev.hxRequest = rev.headers.has("hx-request");
    createHookScript(opts, rev);
    return next();
  };
};
export {
  htmx
};
