const express = require("express");
const path = require("path");
const https = require("https");
const http = require("http"); // Import the 'http' module
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3030;
const useHTTPS = false; // Set to 'true' for HTTPS, 'false' for HTTP

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Allow HTML documents to be served without the .html extension
app.use(
  express.static(path.join(__dirname, "public"), { extensions: ["html"] })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// SSL certificate files (Only needed for HTTPS)
const options = {
  key: fs.readFileSync("./key.pem"),
  cert: fs.readFileSync("./cert.pem"),
};

if (useHTTPS) {
  https.createServer(options, app).listen(port, () => {
    console.log(`Server is running at https://localhost:${port}`);
  });
} else {
  http.createServer(app).listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
