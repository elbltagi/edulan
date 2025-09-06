const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let mainWindow;
let activationWindow;
let serverProcess;
const activationFile = path.join(app.getPath("userData"), "activation.key"); // Store activation

app.whenReady().then(() => {
    startServer();
    setTimeout(createMainWindow, 3000); // ✅ Open app with limits if not activated
});

// ✅ Create Main Window (Works with limits if not activated)
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Needed for IPC
        }
    });

    mainWindow.loadURL("http://localhost:3000/#/admin"); // ✅ Load the UI

    mainWindow.on("closed", () => {
        stopServer();
        mainWindow = null;
    });
}

// ✅ Create Activation Window


// ✅ Check Activation Status



// ✅ Start Server
function startServer() {
    const exePath = app.isPackaged
        ? path.join(process.resourcesPath, "app.exe")
        : path.join(__dirname, "assets", "app.exe");

    serverProcess = spawn(exePath, [], { detached: true });

    serverProcess.stdout.on("data", (data) => {
        console.log(`Server Output: ${data}`);
    });

    serverProcess.stderr.on("data", (data) => {
        console.error(`Server Error: ${data}`);
    });

    serverProcess.on("close", (code) => {
        console.log(`Server Closed with code: ${code}`);
        serverProcess = null;
    });
}

// ✅ Stop Server when app closes
function stopServer() {
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
        console.log("Server process terminated.");
    }
}

app.on("window-all-closed", () => {
    stopServer();
    app.quit();
});
