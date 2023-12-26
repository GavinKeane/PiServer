const { execSync } = require('child_process');
trans_status = execSync("sudo /home/gavin/Desktop/project/check-trans.sh", { timeout: 10000 }).toString();
console.log(`Transmission open? ${trans_status}`)
if (trans_status.includes("tno")) {
  execSync("transmission-gtk&");
}