const { ipcRenderer } = require("electron");

function restartApp() {
    ipcRenderer.send("restart-app");
}

function closeApp() {
    window.close();
}

window.onload = () => {
    document.getElementById("restartBtn").addEventListener("click", restartApp);
    document.getElementById("closeBtn").addEventListener("click", closeApp);
};
