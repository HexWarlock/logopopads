require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse form fields
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (if needed)
app.use(express.static(path.join(__dirname, ".."))); // or just __dirname if serving from vacancies-api

// Mount router
const vacanciesRouter = require("./routes/vacancies");
app.use("/vacancies-api", vacanciesRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Vacancies API running on port ${PORT}`);
});
