const express = require('express');
const fs = require('fs');
const filePath = require('path');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon')
const app = express();
app.use(express.json());
app.use(favicon('./cabbage.ico'));
var parser = bodyParser.json();
output1 = '';
var execs = require('child_process');

trans_status = execs.execSync("sudo /home/gavin/Desktop/project/check-trans.sh", {timeout:10000}).toString();
if (trans_status.includes("no")){
  execs.exec("transmission-gtk&");
}
const header = '<!DOCTYPE html><html><head> \
<title>Cabbage Connect</title> \
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script> \
[SCRIPTHERE] \
<style> \
 .good {color:green; text-decoration:underline} \
 .bad {color:red; text-decoration:underline} \
</style> \
</head>';
const footer = '</html>';

// Landing
app.get('/', (request, response) => {
  var execs = require('child_process');
  wind_status = execs.execSync("windscribe status", {timeout: 10000}).toString();
  wind_fire = execs.execSync("windscribe firewall", {timeout: 10000}).toString().includes("Firewall mode: on") ? "<span class=\"good\">on</span>" : "<span class=\"bad\">off</span>";
  trans_status = execs.execSync("/home/gavin/Desktop/project/check-trans.sh", {timeout: 10000}).toString();
  wind = '';
  trans ='';
  if (wind_status.includes("CONNECTED") && !wind_status.includes("DISCONNECTED")){
    wind = "<div>Windscribe is <span class=\"good\">connected</span> and firewall is ".concat(wind_fire, "</div>");
  }else{
    wind = "<div>Windscribe is <span class=\"bad\">disonnected</span> and firewall is ".concat(wind_fire, "</div>");
  }
  if (trans_status.includes("yes")){
   trans = "<div>Transmission is <span class=\"good\">running</span></div>";
  }else if (trans_status.includes("no")){
   trans = "<div>Transmission is <span class=\"bad\">not running</span></div>";
  }
  text = header.concat('<body> \
  <div><button id=\"reboot\">Reboot Pi</button></div>', wind, trans, ' \
  <div><a href="/files/">File Explorer</a></div> \
  <div><a href=\"http://192.168.50.156:9095\" target=\"_blank">Transmission</a></div> \
  </body>');

  buttonScript = "<script>$(document).ready(function () { \
    $(\"#reboot\").click(function () \
    { if(confirm(\"Are you sure you want to reboot?\")){ \
      \$.post(\"/reboot\", {  }, \
        function (data, status) {console.log(data);})} \
        })});</script>";
  text = text.replace("[SCRIPTHERE]", buttonScript);
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

  // GitHub Test
  // List Files and Folders
  dropdownOptions = '';
  folders = folderNames("/mnt/usb");
  folders.forEach(folder => {
    dropdownOptions = dropdownOptions.concat("<option value=\"", folder, "\">", folder, "</option>");
  })
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
          <td><select name=\"loc\" id=\"select2-", buttonIndex, "\">", dropdownOptions, "</select><button id=\"button2-", buttonIndex, "\">Move</button></td> \
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

          // File move
          buttonScript = buttonScript.concat("$(document).ready(function () { \
            $(\"#button2-", buttonIndex, "\").click(function () { \
              var loc = document.getElementById(\"select2-", buttonIndex, "\").value; \
              var message = \"Are you sure you want to move \".concat(\"", file, " to \", loc, \"?\"); \
              if(confirm(message)){ \
                $.post(\"/buttonPress\", { \
                  pressed: \"", file, "\", \
                  type: \"file\", \
                  href: window.location.href, \
                  destination: loc, \
                  action: \"move\" }, \
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
          <td><select name=\"loc\" id=\"select2-", buttonIndex, "\">", dropdownOptions, "</select><button id=\"button2-", buttonIndex, "\">Move</button></td> \
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

          // Folder move
          buttonScript = buttonScript.concat("$(document).ready(function () { \
            $(\"#button2-", buttonIndex, "\").click(function () { \
              var loc = document.getElementById(\"select2-", buttonIndex, "\").value; \
              var message = \"Are you sure you want to move \".concat(\"", file, " to \", loc, \"?\"); \
              if(confirm(message)){ \
                $.post(\"/buttonPress\", { \
                  pressed: \"", file, "\", \
                  type: \"folder\", \
                  href: window.location.href, \
                  destination: loc, \
                  action: \"move\" }, \
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
  dest = typeof req.body.destination !== "undefined" ? String(req.body.destination) : "";
  action = String(req.body.action);
  href = "mnt/usb/".concat(String(req.body.href).split("/").slice(-1));
  href = href.replace(/\+/g, "/").replace(/\%20/g, " ").concat("/");
  href = href.replace("//", "/");
  // Delete file
  if (type == "file" && action == "delete"){
      fs.unlinkSync("/".concat(href, fileName).replace(/\+/g, "/").replace(/\%20/g, " "));
  }
  // Rename file
  if (type == "file" && action == "rename"){
      fs.rename("/".concat(href,fileName).replace(/\+/g, "/").replace(/\%20/g, " "), "/".concat(href,newName).replace(/\+/g, "/").replace(/\%20/g, " "), () => {});
  }
  // Delete folder
  if (type == "folder" && action == "delete"){
    fs.rmdir("/".concat(href, fileName).replace(/\+/g, "/").replace(/\%20/g, " "), {recursive: true}, (err) => {});
  }
  if (type == "folder" && action == "rename"){
    fs.rename("/".concat(href,fileName).replace(/\+/g, "/").replace(/\%20/g, " "), "/".concat(href,newName).replace(/\+/g, "/").replace(/\%20/g, " "), () => {});
  }
  res.status(200).send("file: ".concat("/", href, fileName, " | type: ", type, " | newName: ", newName, " | action: ", action, " | URL: ", req.body.href, " | Destination: ", dest));
});

app.post("/reboot", bodyParser.urlencoded(), (req, res) => {
  const { exec } = require('child_process');
  exec("sudo reboot", (error, stdout, stderr) => {
    if (error){}
    if (stderr) {}
  });
});

function folderNames(rootDir){
  const folders = [];
  function traverse(current) {
    const files = fs.readdirSync(current);
    files.forEach(file => {
      const filePath1 = filePath.join(current, file);
      const stats = fs.statSync(filePath1);
      if (stats.isDirectory() && !file.includes(".Trash-1000")){
        folders.push(filePath1);
        traverse(filePath1);
      }
    });
  }
  traverse(rootDir)
  return folders;
}

app.listen(process.env.PORT || 3000, () => console.log('Online'))
