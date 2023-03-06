const express = require("express");
const env = require("dotenv").config();
const app = express();
const session = require("express-session");

app.set("view engine", "ejs");

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);

app.get("/", function (req, res) {
  res.render("pages/auth");
});

const passport = require("passport");
var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

app.get("/success", (req, res) => res.send(userProfile));
app.get("/error", (req, res) => res.send("error logging in"));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const GOOGLE_CLIENT_ID = process.env.Google_ClientId;
const GOOGLE_CLIENT_SECRET = process.env.Google_secreat;
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      accessToken;
      return done(null, userProfile, accessToken);
    }
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/error" }),
  function (req, res) {
    // Successful authentication, redirect success.
    console.log(res);
    console.log(res.user, res.authInfo);
    res.redirect("/success");
  }
);

// Middleware to check if the user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
};

// Example route that requires authentication
app.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.send("Dashboard");
});

// Example route that doesn't require authentication
app.get("/home", (req, res) => {
  res.send("Home");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("App listening on port " + port));
