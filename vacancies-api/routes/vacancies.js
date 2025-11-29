const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const router = express.Router();

router.get("/", (req, res) => {
  res.send(">>> Vacancies API is running — from router");
});

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
  "image/jpeg",
  "image/png",
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, Word, ZIP, or image files are allowed."));
  }
};

const upload = multer({ storage, fileFilter });

// POST /apply
router.post("/apply", upload.array("attachments", 10), async (req, res) => {
  console.log(">>> Received application:", req.body);
  try {
    const {
      fullname,
      surname,
      email,
      phone,
      province,
      city,
      experience,
      motivation,
      job_title,
    } = req.body;

    const uploadedFiles = req.files;
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one attachment is required." });
    }

    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "application-email.html"
    );
    let messageHtml = fs.readFileSync(templatePath, "utf8");

    messageHtml = messageHtml
      .replace(/{{job_title}}/g, job_title || "N/A")
      .replace(/{{fullname}}/g, fullname || "N/A")
      .replace(/{{surname}}/g, surname || "N/A")
      .replace(/{{email}}/g, email || "N/A")
      .replace(/{{phone}}/g, phone || "N/A")
      .replace(/{{province}}/g, province || "N/A")
      .replace(/{{city}}/g, city || "N/A")
      .replace(/{{experience}}/g, experience || "N/A")
      .replace(/{{motivation}}/g, motivation || "N/A");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    const attachments = uploadedFiles.map((file) => ({
      filename: file.originalname,
      path: file.path,
    }));

    const mailOptions = {
      from: `"Logo Pop Ads Careers" <${process.env.SMTP_USER}>`,
      to: process.env.RECIPIENT_EMAIL,
      subject: `New Application: ${fullname} ${surname} (${job_title})`,
      html: messageHtml,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    return res.redirect("/vacancies-thank-you.html");
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: "Failed to send application" });
  }
});

module.exports = router;
