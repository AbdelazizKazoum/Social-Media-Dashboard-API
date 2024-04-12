import express from "express";
import session from "express-session";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import mongoose from "mongoose";
import User from "./models/User.js";
import Post from "./models/Post.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
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
  res.sendFile(path.join(__dirname, "public", "post.html"));
});

// Insert your user registration code here.
app.post("/register", async function (req, res) {
  const { username, email, password } = req.body;

  try {
    const checkExistingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    // console.log("username :", username);
    // console.log("check exists :", checkExistingUser);
    if (checkExistingUser)
      return res.status(400).json({ message: "User already exists!" });

    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
      SECRET,
      { expiresIn: "1h" }
    );

    req.session.token = token;

    res.redirect(`/?username=${newUser.username}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error!" });
  }
});

// Insert your user login code here.
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });

    if (!user) return res.status(401).json({ message: "Invalid credential!" });

    const token = jwt.verify(
      { userId: user._id, username: user.username, email: user.email },
      SECRET,
      { expiresIn: "1h" }
    );

    req.session.token = token;

    res.redirect(`/?username=${newUser.username}`);
  } catch (error) {
    res.status(500).json({ message: "Internal error !" });
  }
});

// Insert your post creation code here.
const posts = [];
app.post("/posts", authenticateJWT, (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string")
    return res
      .status(400)
      .json({ message: "Please provide valid post content" });

  const newPost = { userId: req.user.userId, text };
  posts.push(newPost);

  res.status(201).json({ message: "Post created successfully" });
});

// Insert your post updation code here.
app.put("/posts/:postId", authenticateJWT, (req, res) => {
  const postId = parseInt(req.params.id);

  const { text } = req.body;

  const postIndex = posts.findIndex((post = post.id === postId));
  if (postIndex === -1)
    return res.status(404).json({ message: "Post not exists!" });

  posts[postIndex].text = text;

  res.status(200).json({
    message: "Post updated successfully",
    updatedPost: posts[postIndex],
  });
});

// Insert your post deletion code here.
app.delete("/posts/:postId", authenticateJWT, (req, res) => {
  const postId = parseInt(req.params.postId);

  const postIndex = posts.findIndex(
    (post) => post.id === postId && post.userId === req.user.userId
  );

  if (postIndex === -1)
    return res.status(404).json({ message: "Post not found" });

  const deletedPost = posts.splice(postIndex, 1)[0];

  res.json({ message: "Post deleted successfully", deletedPost });
});

// Insert your user logout code here.
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);

    res.redirect("/login");
  });
});

app.listen(PORT, function () {
  console.log("server listening in port : ", PORT);
});
