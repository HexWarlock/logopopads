const express = require("express");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/contact", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      cc_me,
      fax_number, // honeypot field
    } = req.body;

    if (fax_number && fax_number.trim() !== "") {
      console.warn("Spam detected (honeypot filled):", fax_number);
      return res.redirect("/contact-us-thank-you.html"); // pretend it worked
    }

    // Load HTML email template
    const templatePath = path.join(
      __dirname,
      "../templates/contact-email.html"
    );
    let htmlTemplate = fs.readFileSync(templatePath, "utf8");

    // Inject values
    htmlTemplate = htmlTemplate
      .replace("{{name}}", name)
      .replace("{{email}}", email)
      .replace("{{phone}}", phone || "N/A")
      .replace("{{subject}}", subject)
      .replace("{{message}}", message);

    // Setup transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: `"Logo Pop Ads Contact" <${process.env.SMTP_USER}>`,
      to: "info@logopopads.com",
      subject: `Contact Form: ${subject}`,
      html: htmlTemplate,
    };

    if (cc_me === "yes") {
      mailOptions.cc = email;
    }

    await transporter.sendMail(mailOptions);

    return res.redirect("/contact-us-thank-you.html");
  } catch (err) {
    console.error("Contact form error:", err.message);
    return res.status(500).send("Error sending message");
  }
});

module.exports = router;
