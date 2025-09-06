const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const multer = require("multer");
const { Server } = require("socket.io");
const fs = require("fs");
const os = require("os");
const machineId = require("node-machine-id");
const AdmZip = require("adm-zip");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const activationFile = path.join(os.homedir(), "activation.activation");
const dotenvAbsolutePath = path.join(__dirname, ".env");

// ✅ تحميل ملف البيئة باستخدام المسار المطلق
const dotenv = require("dotenv").config({ path: dotenvAbsolutePath });
if (dotenv.error) {
  throw dotenv.error;
}

// ✅ التحقق من وجود `ENCRYPTION_KEY`
if (!process.env.ENCRYPTION_KEY) {
  console.error("❌ ERROR: ENCRYPTION_KEY is not defined in environment variables!");
  process.exit(1); // إنهاء التطبيق عند حدوث الخطأ
}

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Function to get the local network IP
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const key in interfaces) {
    for (const iface of interfaces[key]) {
      if (!iface.internal && iface.family === "IPv4") {
        return iface.address;
      }
    }
  }
  return "127.0.0.1"; // Default to localhost
};

app.use(cors());
app.use(express.json()); // Parse JSON request body

// WebSocket setup
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("message", (message) => io.emit("message", message));

  socket.on("std_result", (data, callback) => {
    io.emit("std_result", data);
    if (callback) callback({ done: true });
  });

  socket.on("std_leave", (data) => io.emit("std_leave", data));
  socket.on("std_leave_page", (data) => io.emit("std_leave_page", data));
  socket.on("exm_finish", () => {
    io.emit("exm_finish");
    finished = true;
  });
  socket.on("std_finish_id", (data) => io.emit("std_finish_id", data));
  socket.on("std_leave_id", (data) => io.emit("std_leave_id", data));
  socket.on("std_stop_id", (data) => io.emit("std_stop_id", data));

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Store exams in memory (Temporary)
let exam = {};
let finished = false;
let teacher = "";



// Serve static files from the "dist" directory
app.use(express.static(path.join(process.cwd(), "dist")));

// ✅ Ensure `uploads` directory is writable & exists
const uploadDir = path.join(process.cwd(), "uploads"); // Use process.cwd() for compatibility
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// API Route for image upload
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

const examUploadDir = path.join(process.cwd(), "exams");
if (!fs.existsSync(examUploadDir)) {
  fs.mkdirSync(examUploadDir, { recursive: true });
}

// Set up Multer for `.exam` (or `.zip`) file uploads
const examStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, examUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const examUpload = multer({ storage: examStorage });
app.post("/api/upload/exam", examUpload.single("examFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const uploadedFilePath = path.join(examUploadDir, req.file.filename);
  const currentMachineId = await machineId.machineId();

  try {
    const zip = new AdmZip(uploadedFilePath);
    const zipEntries = zip.getEntries();

    // ✅ البحث عن ملف `exam.json` داخل الـ ZIP
    const examJsonEntry = zipEntries.find(entry => entry.entryName === "exam.json");

    if (!examJsonEntry) {
      return res.status(400).json({ message: "Invalid exam file. Missing exam.json" });
    }

    // ✅ قراءة محتوى `exam.json`
    const examJsonContent = JSON.parse(examJsonEntry.getData().toString("utf8"));

    // ✅ الحصول على `machineId` من `exam.json`
    const examMachineId = examJsonContent.machineId;

    if (examMachineId && examMachineId === currentMachineId) {
      // ✅ إذا كان `machineId` مختلفًا → فك الضغط في `uploads/`
      zipEntries.forEach((entry) => {
        if (entry.entryName.startsWith("images/") && !entry.isDirectory) {
          const imageFileName = path.basename(entry.entryName); // Get only file name
          const imagePath = path.join(uploadDir, imageFileName); // Save directly in `uploads`

          fs.writeFileSync(imagePath, entry.getData()); // Save image
        }
      });
      fs.unlinkSync(uploadedFilePath); // حذف الملف الأصلي بعد فك الضغط

    }
    res.json({ exam: examJsonContent });



  } catch (error) {
    return res.status(500).json({ message: "Error processing exam file", error: error.message });
  }
});
app.use("/exams", express.static(examUploadDir));

// API to add an exam
app.post("/api/add/exam", (req, res) => {
  exam = req.body.exam;
  teacher = exam.teacher;
  finished = false;
  res.json({ message: "Exam added successfully" });
});
app.get("/api/get/teacher", (req, res) => {
  res.json({ teacher: teacher });
})

// API to get the exam and notify students via WebSocket
app.post("/api/get/exam", (req, res) => {
  const { name, id } = req.body;
  if (finished || !exam?.questions?.length) {
    return res.status(404).json({ finished: true });
  }

  io.emit("std_join", { name, id });
  res.json({ exam });
});

// API to get the local IP
app.get("/api/ip", (req, res) => {
  res.json({ ip: getLocalIP() });
});

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
const IV_LENGTH = 16; // AES block size

// Encrypt data
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

// Decrypt data
function decrypt(text) {
  const [ivHex, encrypted] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

app.post("/api/active", async (req, res) => {
  const data = req.body;
  const deviceId = await machineId.machineId();

  try {
    // Encrypt activation data
    const activationData = { key: data.key, deviceId, activated: true };
    const encryptedData = encrypt(JSON.stringify(activationData));

    // Save encrypted data to file
    fs.writeFileSync(activationFile, encryptedData);

    // Send success response
    res.json({ success: true, message: "Activation successful" });
  } catch (error) {
    console.error("Activation failed:", error);
    res.status(400).json({ success: false, message: "Invalid activation code" });
  }
});

app.get("/api/is_app_activated", async (req, res) => {
  const deviceId = await machineId.machineId();

  if (fs.existsSync(activationFile)) {
    try {
      // Read and decrypt the activation file
      const encryptedData = fs.readFileSync(activationFile, "utf8");
      const decryptedData = decrypt(encryptedData);
      const activationData = JSON.parse(decryptedData);

      // Validate the device ID
      if (activationData.deviceId === deviceId && activationData.activated) {
        return res.json({ activated: true, machineId: deviceId });
      } else {
        return res.json({ activated: false, machineId: deviceId });
      }
    } catch (error) {
      console.error("Error reading activation file:", error);
      return res.json({ activated: false, machineId: deviceId });
    }
  }

  return res.json({ activated: false, machineId: deviceId });
});

// Catch-all route to serve `index.html` for non-API requests
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "dist", "index.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
