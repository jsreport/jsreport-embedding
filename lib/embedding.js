﻿/*! 
 * Copyright(c) 2014 Jan Blaha 
 *
 * This extension adds wrapped-html recipe and js libraries for requesting jsreport from the browser.
 */

var q = require("q"),
  path = require("path"),
  FS = require("q-io/fs"),
  extend = require("node.extend");

module.exports = function (reporter, definition) {
  reporter.extensionsManager.recipes.push({
    name: "wrapped-html",
    execute: function (request, response) {
      response.headers["Content-Type"] = "text/html";
      response.headers["File-Extension"] = "html";
      response.headers["Content-Disposition"] = "inline; filename=\"report.html\"";

      var template = extend(true, {}, request.template);
      template.options = extend(true, {}, request.options);

      reporter.express.app.enable('trust proxy');
      var serverUrl = request.protocol + '://' + request.get('host') + reporter.options.appPath;
      serverUrl = serverUrl.substring(0, serverUrl.length - 1); //remove last /
      return FS.read(path.join(__dirname, "wrapper.html")).then(function (wrapper) {
        response.content = wrapper
          .replace("$template", encodeURIComponent(JSON.stringify(template)))
          .replace("$data", request.data ? JSON.stringify(request.data, null, 2) : "null")
          .replace("$html", encodeURIComponent(response.content))
          .replace(/\$serverUrl/g, serverUrl );
      });
    }
  });
};
