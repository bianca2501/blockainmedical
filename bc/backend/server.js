const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const crypto = require("crypto");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const FileSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  data: Buffer,
  hash: String,
  owner: String,
});

const File = mongoose.model("File", FileSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const buffer = req.file.buffer;

    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    const file = new File({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      data: buffer,
      hash,
      owner: req.body.owner,
    });

    await file.save();

    res.json({ hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get files
app.get("/files", async (req, res) => {
  const files = await File.find({owner: req.query.owner});

  const result = files.map(file => ({
    id: file._id.toString(),
    filename: file.filename,
    hash: file.hash,
  }));

  res.json(result);
});

// Download file
app.get("/file/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).send("File not found");

    res.set({
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
    });

    res.send(file.data);
  } catch (err) {
    res.status(500).send("Error");
  }
});
app.get("/preview/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).send("File not found");

    res.set({
      "Content-Type": file.contentType,
    });

    res.send(file.data);
  } catch (err) {
    res.status(500).send("Error");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));