var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);
var etag_exports = {};
__export(etag_exports, {
  etag: () => etag,
  sendFile: () => sendFile
});
var import_deps = require("./deps");
const def = '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"';
const encoder = new TextEncoder();
const JSON_TYPE_CHARSET = "application/json; charset=UTF-8";
const build_date = new Date();
function cHash(entity) {
  let hash = 0, i = entity.length - 1;
  while (i !== 0)
    hash += entity[i--] ?? 0;
  return hash;
}
function entityTag(entity, type) {
  if (!entity)
    return def;
  if (entity.length == 0)
    return def;
  const hash = cHash(entity);
  return `"${entity.byteLength}-${hash}${type}"`;
}
function getContentType(path) {
  const iof = path.lastIndexOf(".");
  if (iof <= 0)
    return import_deps.MIME_LIST.arc;
  const ext = path.substring(path.lastIndexOf(".") + 1);
  return import_deps.MIME_LIST[ext];
}
async function beforeFile(opts, pathFile) {
  let stat = {}, subfix;
  const iof = pathFile.lastIndexOf("?");
  if (iof !== -1) {
    subfix = pathFile.substring(iof);
    pathFile = pathFile.substring(0, iof);
  }
  try {
    opts.readFile ??= Deno.readFile;
    opts.stat ??= Deno.stat;
    stat = await opts.stat(pathFile);
  } catch (_e) {
  }
  return { stat, subfix, path: pathFile };
}
function is304(nonMatch, response, stat, weak, subfix = "", cd) {
  if (!stat.size)
    return false;
  const mtime = stat.mtime ?? build_date;
  if (cd)
    subfix += cd;
  const hash = `"${stat.size}-${mtime.getTime()}${subfix ? cHash(encoder.encode(subfix)) : ""}"`;
  const etag2 = weak ? `W/${hash}` : hash;
  response.header("last-modified", mtime.toUTCString());
  response.header("etag", etag2);
  return nonMatch && nonMatch === etag2;
}
async function sendFile(rev, pathFile, opts = {}) {
  var _a, _b, _c;
  try {
    const weak = opts.weak !== false;
    const { response, request } = rev;
    const nonMatch = ((_b = (_a = request.headers) == null ? void 0 : _a.get) == null ? void 0 : _b.call(_a, "if-none-match")) ?? request.headers["if-none-match"];
    const { stat, subfix, path } = await beforeFile(opts, pathFile);
    response.type(response.header("content-type") ?? getContentType(path));
    const cd = response.header("content-disposition");
    if (is304(nonMatch, response, stat, weak, subfix, cd)) {
      return response.status(304).send();
    }
    const file = await ((_c = opts.readFile) == null ? void 0 : _c.call(opts, path));
    if (!file) {
      throw new Error("File error. please add options readFile");
    }
    return response.send(file);
  } catch (error) {
    throw error;
  }
}
const etag = (opts = {}) => {
  return (rev, next) => {
    const weak = opts.weak !== false;
    const send = rev.send.bind(rev);
    rev.send = (body) => {
      var _a, _b;
      if (body) {
        const { response, request } = rev;
        if (!response.header("etag") && !(body instanceof ReadableStream || body instanceof Blob)) {
          const nonMatch = ((_b = (_a = request.headers) == null ? void 0 : _a.get) == null ? void 0 : _b.call(_a, "if-none-match")) ?? request.headers["if-none-match"];
          if (typeof body === "object" && !(body instanceof Uint8Array || body instanceof Response)) {
            try {
              body = JSON.stringify(body);
            } catch (_e) {
            }
            response.type(JSON_TYPE_CHARSET);
          }
          const type = response.header("content-type");
          const hash = entityTag(body instanceof Uint8Array ? body : encoder.encode(body), type ? "" + cHash(encoder.encode(type)) : "");
          const _etag = weak ? `W/${hash}` : hash;
          response.header("etag", _etag);
          if (nonMatch && nonMatch == _etag) {
            response.status(304);
            if (response.end) {
              response.end();
              return;
            }
            return rev[import_deps.s_response] = new Response(null, response.init);
          }
        }
      }
      send(body);
    };
    return next();
  };
};
module.exports = __toCommonJS(etag_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  etag,
  sendFile
});
