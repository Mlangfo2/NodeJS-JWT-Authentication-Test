const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const jwt_decode = require('jwt-decode');

const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');

const PORT = 3000;
const secretKey ='My super secret key';
let token;

const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ["HS256"],
  });

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "Content-type,Authorization");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let users = [
  {
    id: 1,
    username: "micah",
    password: "123",
  },
  {
    id: 2,
    username: "Langford",
    password: "456",
  },
];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  let foundUser = false;
  for (let user of users) {
    if (username === user.username && password === user.password) {
      let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: "7d" });
      foundUser = true;
      res.json({
        success: true,
        err: null,
        token,
      });
      break;
    }
  }
  if (!foundUser) {
    res.status(401).json({
      success: false,
      token: null,
      err: "Username and/or Password is incorrect",
    });
  }
});

app.get("/api/dashboard", jwtMW, (req, res) => {
  res.json({
    success: true,
    myContent: "Secret content that only logged-in people can see.",
  });
});

app.get("/api/settings", jwtMW, (req, res) => {
  res.json({
    success: true,
    myContent: "Here you can change you account settings.",
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get(function (err, req, res, next) {
  if (err.name === "Unauthorized Error") {
    res.status(401).json({
      success: false,
      err,
    });
  } else {
    next(err);
  }
});

app.listen(PORT, () => {
  console.log(`Serving on port ${PORT}`);
});