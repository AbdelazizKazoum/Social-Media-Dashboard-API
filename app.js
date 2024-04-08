import express from "express";
import session from "express-session";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import mongoose from "mongoose";
import User from "./models/User.js";
import Post from "./models/Post.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.SECRET_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// mongoose preparation
mongoose.set({ strictQuery: false });
const uri = process.env.MONGO_URI;
async function connect() {
  try {
    await mongoose.connect(uri, { dbName: "SocialDB" });

    console.log("Database connected seccussfully");
  } catch (err) {
    console.log("Database connection failed : ", err);
  }
}
await connect();

// Insert your authenticateJWT Function code here.
function authenticateJWT(req, res, next) {
  const token = req.session.token;

  if (!token) return res.status(401).json({ message: "Unauthorized!" });

  try {
    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;
  } catch (error) {
    return res.status(401).json({ message: "invalid token!" });
  }
}

// Insert your requireAuth Function code here.
function requireAuth(req, res, next) {
  const token = req.session.token;

  if (!token) return res.redirect("/login");

  try {
    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;
  } catch (error) {
    res.redirect("/login");
  }
}

// Insert your routing HTML code here.
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

app.get("/register", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/post", requireAuth, function (req, res) {
  res.sendFile(__dirname, "public.html");
});

// Insert your user registration code here.

// Insert your user login code here.

// Insert your post creation code here.

// Insert your post updation code here.

// Insert your post deletion code here.

// Insert your user logout code here.

app.listen(PORT, function () {
  console.log("server listening in port : ", PORT);
});
