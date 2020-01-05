const express = require("express");
const browserify = require("browserify");
const fs = require("fs");
const http = require("http");
const ncp = require("ncp").ncp;
const reload = require("reload");
const watch = require("watch");
const app = express();
app.use(express.static("./dist"));

app.set("port", 3000);

var server = http.createServer(app);

// Reload code here
reload(app).then(reloadReturned => {
  watch.watchTree(__dirname + "/popup", function(f, curr, prev) {
    //copy from src to dist
    fs.copyFile("./popup/index.html", "./dist/index.html", _ => {});
    ncp("./popup/styles", "./dist/styles");
    ncp("./popup/assets", "./dist/assets");

    //bundle all dependency for browser
    let b = browserify("./popup/js/main.js");
    let bundleStream = fs.createWriteStream("./dist/bundle.js");
    b.bundle().pipe(bundleStream);
    bundleStream.on("close", () => {
      //reload browser when the stream is finished
      reloadReturned.reload();
    });
  });
});
server.listen(app.get("port"), function() {
  console.log("Web server listening on port " + app.get("port"));
});
