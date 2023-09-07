const express = require('express');
const fs = require('fs');
const filePath = require('path');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
var parser = bodyParser.json();
const header = '<!DOCTYPE html><html><head> \
<title>Cabbage Connect</title> \
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script> \
[SCRIPTHERE] \
</head>';
const footer = '</html>';

// Landing
app.get('/', (request, response) => {
  text = header.concat('<body><a href="/files/">File Explorer</a></body>');
  text = text.concat(footer);
  response.send(text);
});

//File Browser
app.get('/files/:path?', (request, response) => {
  if (typeof request.params.path !== "undefined" && String(request.params.path).includes("..")){
    response.status(500).send('Something went wrong');
  }
  names = header.concat('<body><div>Current Directory</div>');
  root = '/mnt/usb/';
  rawPathVar = typeof request.params.path !== "undefined" ? String(request.params.path) : '';
  pathVar = typeof request.params.path !== "undefined" ? String(request.params.path).replace(/\+/g, '/').replace(/\%20/g, ' ') : '';

  // File Path with links
  names = names.concat('<a>/ </a><a href=\"/files/\">root</a>');
  pathArr = typeof request.params.path !== "undefined" ? request.params.path.split("+") : '';
  for (let i = 0; i < pathArr.length; i++){
    subPath = '';
    for (let j = 0; j <= i; j++){
      subPath = subPath.concat("+", pathArr[j]);
    }
    if (subPath.startsWith("+")){
      subPath = subPath.slice(1);
    }
    names = names.concat("<a> / </a><a href=\"/files/", subPath, "\">", pathArr[i], "</a>");
  }

  // List Files and Folders
  fullPath = root.concat(pathVar)
  names = names.concat('<table>')
  buttonIndex = 0;
  buttonScript = '<script>';
  fs.readdir(fullPath, (err, files) => {
    files.forEach(file => {
      if (!(String(file) === 'System Volume Information') && !(String(file) === '.Trash-1000')){

        // File
        if (filePath.extname(file).length > 0){
          names = names.concat("<tr> \
          <td><a>", file, "</a></td> \
          <td><button id=\"button0-", buttonIndex, "\">Rename</button></td> \
          <td><button id=\"button1-", buttonIndex, "\">Delete</button></td> \
          </tr>");

          // File rename
          buttonScript = buttonScript.concat("$(document).ready(function () { \
            $(\"#button0-", buttonIndex, "\").click(function () { \
              newName = prompt(\"Enter a new name for ", file, "\"); \
              if(newName != null){ \
                $.post(\"/buttonPress\", { \
                pressed: \"", file, "\", \
                type: \"file\", \
                name: newName, \
                href: window.location.href, \
                action: \"rename\" }, \
                function (data, status) {console.log(data);});} \
              else{}});});");

          // File delete
          buttonScript = buttonScript.concat("$(document).ready(function () { \
            $(\"#button1-", buttonIndex, "\").click(function () { \
              if(confirm(\"Are you sure you want to delete ", file, "?\")){ \
                $.post(\"/buttonPress\", { \
                  pressed: \"", file, "\", \
                  type: \"file\", \
                  href: window.location.href, \
                  action: \"delete\" }, \
                function (data, status) {console.log(data);});} \
              else{}});});");
          buttonIndex++;

        // Folder
        }else{
          trail = rawPathVar.concat("+", file);
          if (trail.startsWith("+")){
            trail = trail.slice(1);
          }
          names = names.concat("<tr> \
          <td><a href=\"", trail, "\">", file, "</a></td> \
          <td><button id=\"button0-", buttonIndex, "\">Rename</button></td> \
          <td><button id=\"button1-", buttonIndex, "\">Delete</button></td> \
          </tr>");

          // Folder rename
          buttonScript = buttonScript.concat("$(document).ready(function () { \
            $(\"#button0-", buttonIndex, "\").click(function () { \
              newName = prompt(\"Enter a new name for ", file, "\"); \
              if(newName != null){ \
                $.post(\"/buttonPress\", { \
                pressed: \"", file, "\", \
                type: \"folder\", \
                href: window.location.href, \
                name: newName, \
                action: \"rename\" }, \
                function (data, status) {console.log(data);});} \
              else{}});});");

          // Folder delete
          buttonScript = buttonScript.concat("$(document).ready(function () { \
            $(\"#button1-", buttonIndex, "\").click(function () { \
              if(confirm(\"Are you sure you want to delete ", file, "?\")){ \
                $.post(\"/buttonPress\", { \
                  pressed: \"", file, "\", \
                  type: \"folder\", \
                  href: window.location.href, \
                  action: \"delete\" }, \
                function (data, status) {console.log(data);});} \
              else{}});});");
          buttonIndex++;
        }
      }
    });
    if (err) {
      response.status(500).send('Something went wrong')
    }
    buttonScript = buttonScript.concat("console.log(\"Scripts executed\") </script>");
    names = names.replace("[SCRIPTHERE]", buttonScript);
    names = names.concat("</body>", footer);
    response.send(names);
  });
});

app.post("/buttonPress", bodyParser.urlencoded(), (req, res) => {
  fileName = String(req.body.pressed);
  type = String(req.body.type);
  newName = typeof req.body.name !== "undefined" ? String(req.body.name) : "";
  action = String(req.body.action);
  href = "mnt/usb/".concat(String(req.body.href).split("/").slice(-1));
  href = href.replace(/\+/, "/").replace(/\%20/, " ").concat("/");
  res.status(200).send("file: ".concat(href, fileName, " | type: ", type, " | newName: ", newName, " | action: ", action));
});

app.listen(process.env.PORT || 3000, () => console.log('Online'))
