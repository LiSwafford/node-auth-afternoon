require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const students = require("./students.json");

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

//middleware
app.use(passport.initialize());
// console.log(passport);
app.use(passport.session());
// configure passport to use sessions

passport.use(
  new Auth0Strategy(
    {
      domain: process.env.DOMAIN,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/login",
      scope: "openid email profile"
    },
    (accessToken, refreshToken, extraParams, profile, done) => {
      done(null, profile);
      //what are those parameters?
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, {
    clientID: user.id,
    email: user._json.email,
    name: user._json.name
  });
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

//endpoints
app.get(
  "/login",
  passport.authenticate("auth0", {
    successRedirect: "/students",
    failureRedirect: "/login",
    connection: "github"
  })
);

function authenticated(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.status(401).json("get out of here");
  }
}
//middleware function authenticated
app.get("/students", authenticated, (req, res, next) => {
  res.status(200).json(students);
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
