
const express = require('express');
const fs = require('fs');
const os = require('os');
const fsE = require('fs-extra');
const filePath = require('path');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const app = express();
app.use(express.json());
app.use(favicon('./cabbage.ico'));
var parser = bodyParser.json();
const puppeteer = require('puppeteer');
const ffs = require('fast-folder-size');
const { execSync } = require('child_process');
const cron = require('node-cron');
const disk = require('diskusage');
const { maxHeaderSize } = require('http');
app.use(express.static('public'));

localIPGlobal = '';
try {
  output1 = '';
  maxCacheSize = 16107212288;
  const networkInterfaces = os.networkInterfaces();
  let localIP = "1.1.1.1";
  const interfaces = os.networkInterfaces();
  const interfaceKeys = Object.keys(interfaces);
  for (let i = 0; i < interfaceKeys.length && localIP === "1.1.1.1"; i++) {
    key = interfaceKeys[i];
    for (const iface of interfaces[key]) {
      if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith('192.168.')) {
        localIP = iface.address;
        localIPGlobal = localIP;
      }
      if (localIP !== "1.1.1.1") {
        break;
      }
    }
    if (localIP !== "1.1.1.1") {
      break;
    }
  }
  console.log(`IP Evaluated to: ${localIP}`);
  if (localIP === "1.1.1.1") {
    console.log("It restarted");
    yo = execSync("pm2 restart index", { timeout: 15000 }).toString();
  }

  const fileListFile = '/home/gavin/Documents/projectv2/PiServer/files.txt';
  const fileList = generateFileList('/mnt');
  fs.writeFileSync(fileListFile, fileList);

  const { url } = require('inspector');
  const { Console } = require('console');
  const { allowedNodeEnvironmentFlags } = require('process');
  const fastFolderSize = require('fast-folder-size');
  try {
    const cachePath = '/var/lib/plexmediaserver/Library/Application Support/Plex Media Server/Cache';
    ffs(cachePath, (err, size) => {
      if (err) {
        console.error(err);
      } else {
        if (size > maxCacheSize) {
          delCache = execSync("sudo rm -r \"/var/lib/plexmediaserver/Library/Application Support/Plex Media Server/Cache/PhotoTranscoder\"", { timeout: 15000 }).toString();
          delCache = execSync("sudo rm -r \"/var/lib/plexmediaserver/Library/Application Support/Plex Media Server/Cache/Transcode\"", { timeout: 15000 }).toString();
        }
      }
    })
  } catch { }

  const header = '<!DOCTYPE html><html><head> \
<title>Cabbage Connect</title> \
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script> \
<link rel="stylesheet" type="text/css" href="/styles.css"> \
[SCRIPTHERE] \
</head>';
  const footer = '</html>';

  function formatBytes(bytes, decimals = 2) {
    if (bytes == 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  //Landing
  app.get('/', (request, response) => {
    const cachePath = '/var/lib/plexmediaserver/Library/Application Support/Plex Media Server/Cache';
    const hdd = '/mnt/usb';
    disk.check(hdd, (err, info) => {
      ffs(cachePath, (err, size) => {
        if (err) {
          console.error(err);
        }
        comm = execSync("bash /home/gavin/Documents/projectv2/PiServer/check-wind.sh && bash /home/gavin/Documents/projectv2/PiServer/check-trans.sh", { timeout: 15000 }).toString();
        wind = '';
        trans = '';
        if (comm.includes("CONNECTED") && !comm.includes("DISCONNECTED")) {
          wind = 'progress-good';
        } else {
          wind = 'progress-bad';
        }
        if (comm.includes("tyes")) {
          trans = 'progress-good';
        } else if (comm.includes("tno")) {
          trans = 'progress-bad';
        }
        text = header.concat('<body> \
        ', generateNavbar(), ' \
        <div class="home-info"> \
        <div class="progress-container"> \
        <div class="progress-wrapper"> \
        <p class="progress-text">Plex Cache: ', formatBytes(size), ' / ', formatBytes(maxCacheSize), '</p> \
        <progress value="', ((size / maxCacheSize) * 100).toFixed(0), '" max="100"></progress> \
        </div></div> \
        <div class="progress-container"> \
        <div class="progress-wrapper"> \
        <p class="progress-text">HDD Storage: ', formatBytes(info.total - info.available), ' / ', formatBytes(info.total), '</p> \
        <progress value="', (((info.total - info.available) / info.total) * 100).toFixed(0), '" max="100"></progress> \
        </div></div> \
        <div class="progress-container"> \
        <div class="progress-wrapper"> \
        <p class="progress-text">Windscribe</p> \
        <progress class="', wind, '" value="100" max="100"></progress> \
        </div></div> \
        <div class="progress-container last"> \
        <div class="progress-wrapper"> \
        <p class="progress-text">Transmission</p> \
        <progress class="', trans, '" value="100" max="100"></progress> \
        </div></div> \
        </div> \
  <div><button class=\"reboot-button\" id=\"reboot\">Reboot Pi</button></div> \
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
    });
  });

  //File Browser
  app.get('/files/:path?', (request, response) => {
    if (typeof request.params.path !== "undefined" && String(request.params.path).includes("..")) {
      response.status(500).send('Something went wrong');
    }
    names = header.concat('<body>', generateNavbar(), '</div><div class=\"explorer-top\">Current Directory</div>');
    root = '/mnt/usb/';
    rawPathVar = typeof request.params.path !== "undefined" ? String(request.params.path) : '';
    pathVar = typeof request.params.path !== "undefined" ? String(request.params.path).replace(/\+/g, '/').replace(/\%20/g, ' ') : '';

    // File Path with links
    names = names.concat('<div class=\"path-links\"><a>/ </a><a class=\"b-link\" href=\"/files/\">root</a>');
    pathArr = typeof request.params.path !== "undefined" ? request.params.path.split("+") : '';
    for (let i = 0; i < pathArr.length; i++) {
      subPath = '';
      for (let j = 0; j <= i; j++) {
        subPath = subPath.concat("+", pathArr[j]);
      }
      if (subPath.startsWith("+")) {
        subPath = subPath.slice(1);
      }
      names = names.concat("<a>  /  </a><a class=\"b-link\" href=\"/files/", subPath, "\">", pathArr[i], "</a>");
    }

    //New folder button
    names = names.concat("</div><div><button class=\"new-folder\" id=\"newfolder\">New Folder</button></div>");

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
    refreshDelay = 275;
    fs.readdir(fullPath, (err, files) => {
      files.forEach(file => {
        if (!(String(file) === 'System Volume Information') && !(String(file) === '.Trash-1000')) {
          isFile = fs.statSync(filePath.join(fullPath, file)).isFile();
          // File
          if (isFile) {
            names = names.concat("<tr> \
          <td><a>", file, "</a></td> \
          <td><button id=\"button0-", buttonIndex, "\">Rename</button></td> \
          <td><button id=\"button1-", buttonIndex, "\">Delete</button></td> \
          <td><select class=\"folder-drop-down\" name=\"loc\" id=\"select2-", buttonIndex, "\">", dropdownOptions, "</td><td></select><button id=\"button2-", buttonIndex, "\">Move</button></td> \
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
              else{} setTimeout (function () {location.reload();}, ", refreshDelay, ");\
            });});");

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
              else{} setTimeout (function () {location.reload();}, ", refreshDelay, ");});});");

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
              else{} setTimeout (function () {location.reload();}, ", refreshDelay, ");});});");
            buttonIndex++;

            // Folder
          } else {
            trail = rawPathVar.concat("+", file);
            if (trail.startsWith("+")) {
              trail = trail.slice(1);
            }
            names = names.concat("<tr> \
          <td><a class=\"b-link\" href=\"", trail, "\">", file, "</a></td> \
          <td><button id=\"button0-", buttonIndex, "\">Rename</button></td> \
          <td><button id=\"button1-", buttonIndex, "\">Delete</button></td> \
          <td><select class=\"folder-drop-down\" name=\"loc\" id=\"select2-", buttonIndex, "\">", dropdownOptions, "</td><td></select><button id=\"button2-", buttonIndex, "\">Move</button></td> \
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
              else{} setTimeout (function () {location.reload();}, ", refreshDelay, ");});});");

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
              else{} setTimeout (function () {location.reload();}, ", refreshDelay, ");});});");

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
              else{} setTimeout (function () {location.reload();}, ", refreshDelay, ");});});");
            buttonIndex++;
          }
        }
      });
      // New Folder
      buttonScript = buttonScript.concat("$(document).ready(function () { \
      $(\"#newfolder\").click(function () { \
        newName = prompt(\"Enter a name for the new folder\"); \
        if(newName != null){ \
          $.post(\"/buttonPress\", { \
          pressed: \"", root.concat(pathVar), "\", \
          type: \"folder\", \
          name: newName, \
          href: window.location.href, \
          action: \"newfolder\" }, \
          function (data, status) {console.log(data);});} \
        else{} setTimeout (function () {location.reload();}, ", refreshDelay, ");});});");
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
    if (type == "file" && action == "delete") {
      fs.unlinkSync("/".concat(href, fileName).replace(/\+/g, "/").replace(/\%20/g, " "));
    }
    // Rename file
    if (type == "file" && action == "rename") {
      fs.rename("/".concat(href, fileName).replace(/\+/g, "/").replace(/\%20/g, " "), "/".concat(href, newName).replace(/\+/g, "/").replace(/\%20/g, " "), () => { });
    }
    // Move file
    if (type == "file" && action == "move") {
      source = "/".concat(href, fileName);
      destination = dest.concat("/", fileName);
      fs.rename(source, destination, (err) => { });
    }
    // Delete folder
    if (type == "folder" && action == "delete") {
      fs.rmdir("/".concat(href, fileName).replace(/\+/g, "/").replace(/\%20/g, " "), { recursive: true }, (err) => { });
    }
    // Rename folder
    if (type == "folder" && action == "rename") {
      fs.rename("/".concat(href, fileName).replace(/\+/g, "/").replace(/\%20/g, " "), "/".concat(href, newName).replace(/\+/g, "/").replace(/\%20/g, " "), () => { });
    }
    // Move folder
    if (type == "folder" && action == "move") {
      s = "/".concat(href, fileName);
      d = dest;
      moveFolder(s, filePath.join(d, filePath.basename(s)));
    }
    // New folder
    if (type == "folder" && action == "newfolder") {
      loc = filePath.join(fileName, newName);
      try {
        fs.mkdirSync(loc);
      } catch { }
    }
    res.status(200).send("file: ".concat("/", href, fileName, " | filename: ", fileName, " | type: ", type, " | newName: ", newName, " | action: ", action, " | URL: ", req.body.href, " | Destination: ", dest));
  });

  app.get('/search/:terms?', (request, response) => {
    result = '';
    terms = typeof request.params.terms !== "undefined" ? request.params.terms : "[blank]";
    text = header.concat("<body> \
    ", generateNavbar(), " \
    <div class=\"search-container\"><input class=\"searchbox\" type=\"text\" id=\"search\" placeholder=\"Search for a show or movie\"> \
    <button class=\"search-button\" onclick=\"searchRedirect()\">Search</button></div> \
    <script> \
    function searchRedirect() { \
      var searchTerms = document.getElementById('search').value; \
      if (searchTerms !== '') { \
        window.location.href = \"/search/\".concat(searchTerms); \
      }} \
      function copyToClip(magnet) { \
        var textarea = document.createElement('textarea'); \
        textarea.value = magnet; \
        textarea.style.position = 'fixed'; \
        textarea.style.top = '0'; \
        textarea.style.left = '0'; \
        textarea.style.opacity = '0'; \
        document.body.appendChild(textarea); \
        textarea.focus(); \
        textarea.select(); \
        textarea.setSelectionRange(0, 99999); \
        document.execCommand('copy'); \
        document.body.removeChild(textarea); \
      } \
      </script>"
    ).replace("[SCRIPTHERE]", "");
    result = '';
    const baseUrl = "http://www.thepiratebay.org";
    const query = terms;
    run(baseUrl, query).then(() => {
      result = html1;
      resultSlice = result.split("<span class=\"list-item item-type\">");
      allItemsNameMagSeedLeech = [];
      for (let items = 1; items < resultSlice.length && items < 25; items++) {
        nameMagSeedLeech = [];
        cut1 = resultSlice[items].split("<span class=\"list-item item-name item-title\"><a href=")[1].split("\">")[1];
        nameMagSeedLeech[0] = cut1.split('<')[0];
        nameMagSeedLeech[1] = "magnet".concat(resultSlice[items].split("href=\"magnet")[1].split("\">")[0]).replace("&amp;", "&");
        nameMagSeedLeech[2] = resultSlice[items].split("list-item item-size\">")[1].split("<")[0].replace("&nbsp;", "").replace("i", "").replace("G", " G").replace("M", " M").replace("K", " K");
        nameMagSeedLeech[3] = resultSlice[items].split("list-item item-seed\">")[1].split("<")[0].replace("&nbsp;", "");
        nameMagSeedLeech[4] = resultSlice[items].split("list-item item-leech\">")[1].split("<")[0].replace("&nbsp;", "");
        if (!resultSlice[items].includes(":500\">Porn")) {
          allItemsNameMagSeedLeech[items] = nameMagSeedLeech;
        }
      }
      hidden = allItemsNameMagSeedLeech.length > 0 ? "" : " style=\"display: none;\"";
      text = text.concat("<div", hidden, "><table><tr><th>Name</th><th>Size</th><th>Seeds</th><th>Leeches</th></tr>");
      for (let tors = 1; tors < allItemsNameMagSeedLeech.length; tors++) {
        try {
          if (allItemsNameMagSeedLeech[tors][0] !== "") {
            text = text.concat("<tr>");
            text = text.concat("<td class=\"movie-cell\"><a class=\"b-link\" href=\"javascript:void(0)\" onclick=\"copyToClip('", allItemsNameMagSeedLeech[tors][1], "')\">", allItemsNameMagSeedLeech[tors][0], "</a></td>");
            for (let ind = 2; ind < 5; ind++) {
              text = text.concat("<td>", allItemsNameMagSeedLeech[tors][ind], "</td>");
              if (ind == 0) {
                ind++;
              }
            }
            text = text.concat("</tr>");
          }
        } catch (error) { }
      }
      text = text.concat("</table></div></body>");
      response.send(text);
    });
  });

  html1 = '';

  async function run(baseUrl, query) {
    if (query !== "[blank]") {
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.goto(`${baseUrl}/search.php?q=${encodeURIComponent(query)}`);
      const htmlString = await page.content();
      await browser.close();
      html1 = htmlString;
    }
  }

  function moveFolder(s, d) {
    const items = fs.readdirSync(s);
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d);
    }
    items.forEach((item) => {
      const sItemPath = filePath.join(s, item);
      const dItemPath = filePath.join(d, item);
      if (fs.lstatSync(sItemPath).isDirectory()) {
        moveFolder(sItemPath, dItemPath);
      } else {
        fs.renameSync(sItemPath, dItemPath);
      }
    });
    fs.rmdirSync(s);
  }

  app.post("/reboot", bodyParser.urlencoded(), (req, res) => {
    const { exec } = require('child_process');
    exec("sudo reboot", (error, stdout, stderr) => {
      if (error) { }
      if (stderr) { }
    });
  });

  function generateFileList(rootFolder, indent = '') {
    const items = fs.readdirSync(rootFolder);
    let structureString = '';
    items.forEach((item, index) => {
      const itemPath = filePath.join(rootFolder, item);
      if (!itemPath.includes(".Trash-1000")) {
        const isDirectory = fs.statSync(itemPath).isDirectory();
        structureString += `${indent}${isDirectory ? item + '/' : item}`;
        if (isDirectory) {
          const substructure = generateFileList(itemPath, `${indent}  `);
          if (substructure.length > 0) {
            structureString += '\n';
            structureString += substructure;
          }
        }
        if (index < items.length - 1) {
          structureString += '\n';
        }
      }
    });
    return structureString;
  }

  // New Transmission
  app.get('/transmission', (request, response) => {
   contents = '<!DOCTYPE html><html><head> \
   <title>Transmission</title> \
   <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script> \
   <link rel="stylesheet" type="text/css" href="/styles.css"> \
   </head>'
   contents = contents.concat(' \
   <body> \
   ', generateNavbar(), ' \
   <iframe src="http://', localIPGlobal , ':9095\" width="100%" height="600px" frameborder="0"></iframe>'
   );
   response.send(contents);
  });

    // New Plex Portal
    app.get('/plex', (request, response) => {
      contents = '<!DOCTYPE html><html><head> \
      <title>Plex Portal</title> \
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script> \
      <link rel="stylesheet" type="text/css" href="/styles.css"> \
      </head>'
      contents = contents.concat(' \
      <body> \
      ', generateNavbar(), ' \
      <iframe src="http://', localIPGlobal , ':32400\" width="100%" height="1235px" frameborder="0"></iframe>'
      );
      response.send(contents);
     });

  function folderNames(rootDir) {
    const folders = [];
    function traverse(current) {
      const files = fs.readdirSync(current);
      files.forEach(file => {
        const filePath1 = filePath.join(current, file);
        const stats = fs.statSync(filePath1);
        if (stats.isDirectory() && !file.includes(".Trash-1000")) {
          folders.push(filePath1);
          traverse(filePath1);
        }
      });
    }
    traverse(rootDir)
    return folders;
  }
  console.log("Is anyone out there?")
  app.listen(3000, () => console.log('Online'));
} catch (error) {
  console.error(`from trycatch ${error}`);
}

async function runTest() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000");
  const htmlString = await page.content();
  await browser.close();
  console.log("A test of the website is being run...");
  html2 = htmlString;
}

function generateNavbar() {
  navbar = '';
  pirateLinkClass = '';
  pirateLink = '';
  comm = execSync("bash /home/gavin/Documents/projectv2/PiServer/check-wind.sh && bash /home/gavin/Documents/projectv2/PiServer/check-trans.sh", { timeout: 15000 }).toString();
  if (comm.includes("CONNECTED") && !comm.includes("DISCONNECTED")) {
    pirateLinkClass = 'active-link';
    pirateLink = pirateLink.concat("http://", localIPGlobal , ":3000/search/");
  } else {
    pirateLinkClass = 'inactive-link';
    pirateLink = "#";
  }
  navbar = navbar.concat("\
    <nav> \
      <img class=\"cabbage-logo\" src=\"/images/cabbage\" alt=\"Cabbage Connect Logo\"> \
      <a href=\"http://", localIPGlobal , ":3000\">Home</a> \
      <a href=\"http://", localIPGlobal , ":3000/files/\">File Explorer</a> \
      <a class=\"", pirateLinkClass, "\" href=\"", pirateLink, "\">Pirate Search</a> \
      <a href=\"http://", localIPGlobal , ":3000/transmission/\">Transmission</a> \
      <a href=\"http://", localIPGlobal , ":3000/plex/\">Plex Portal</a> \
    </nav> \
  ");
  return navbar;
}

cron.schedule('0 5 * * 1,3,5', () => {
  const { execSync } = require('child_process');
  execSync("sudo apt update && sudo apt upgrade && sudo reboot");
});