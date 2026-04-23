const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

require("dotenv").config(); // 👈 load env

const app = express();
app.use(cors());
app.use(express.json());

// multer setup
const upload = multer({ dest: "uploads/" });

// route
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const results = [];
    const labels = [];
    const values = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {

        results.forEach(row => {
          const keys = Object.keys(row);

          labels.push(row[keys[0]]);
          values.push(Number(row[keys[1]]));
        });

        // delete file after processing
        fs.unlinkSync(req.file.path);

        res.json({ labels, values });
      })
      .on("error", (err) => {
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: "CSV parsing error" });
      });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// health check
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});