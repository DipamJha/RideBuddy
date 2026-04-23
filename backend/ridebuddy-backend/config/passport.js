const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL || "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const { id, name, emails, photos } = profile;
          const email = emails && emails.length > 0 ? emails[0].value : `${id}@google.com`;
          const firstName = (name && name.givenName) ? name.givenName : email.split("@")[0];
          const lastName = (name && name.familyName) ? name.familyName : "User";
          const avatar = (photos && photos.length > 0) ? photos[0].value : "";

          // Check if user already exists
          let user = await User.findOne({ email });

          if (user) {
            // If user exists but was created via email/pass, they can still login via Google
            return done(null, user);
          }

          // Create new user if not exists
          user = await User.create({
            firstName,
            lastName,
            email,
            avatar,
            // Password is not needed for OAuth users, 
            // but our model requires it. We'll use a dummy one.
            password: Math.random().toString(36).slice(-12) + "OAuth!",
          });

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️ Google OAuth credentials missing. OAuth feature disabled.");
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
