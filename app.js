import express from "express";
import session from "express-session";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Post from "./models/Post.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

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

app.get("/", function (req, res) {
  res.send("hello world");
});

app.listen(PORT, function () {
  console.log("server listening in port : ", PORT);
});
