const { execSync } = require('child_process');
const os = require('os');
username = os.userInfo().username;
trans_status = execSync("sudo /home/".concat(username,"/Documents/projectv2/PiServer/check-trans.sh"), { timeout: 10000 }).toString();
console.log(`Transmission open? ${trans_status}`)
if (trans_status.includes("tno")) {
  execSync("sleep 30 && transmission-gtk&");
}