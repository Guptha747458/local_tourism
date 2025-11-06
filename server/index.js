const express = require("express");
const app = express();
app.get("/", (req, res) => res.send("Backend deployed on Vercel!"));
module.exports = app;