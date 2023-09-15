const functions = require("firebase-functions");
const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccountKey = require("./serviceAccountKey.json");

const express = require("express");
const app = express();

app.use(express.json());

const cors = require("cors");
app.use(cors({ origin: true }));
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  next();
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

//api endpoint
app.get("/", (req, res) => {
  return res.send("Hello World");
});

// User
const userRoute = require("./routes/user");
app.use("/api/users", userRoute);

// Category
const categoryRouter = require("./routes/category");
app.use("/api/category", categoryRouter);

//Product
const productRouter = require("./routes/products");
app.use("/api/product", productRouter);

exports.app = functions.https.onRequest(app);
