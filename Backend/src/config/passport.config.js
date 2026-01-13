import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import AppleStrategy from 'passport-apple';
import User from '../models/auth.model.js';

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists
                let user = await User.findOne({
                    $or: [
                        { providerId: profile.id, provider: 'google' },
                        { email: profile.emails[0].value }
                    ]
                });

                if (user) {
                    // User exists, update OAuth info if needed
                    if (!user.providerId) {
                        user.provider = 'google';
                        user.providerId = profile.id;
                        user.profilePicture = profile.photos[0]?.value;
                        await user.save();
                    }
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    provider: 'google',
                    providerId: profile.id,
                    profilePicture: profile.photos[0]?.value,
                });

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Apple OAuth Strategy
// passport.use(
//     new AppleStrategy(
//         {
//             clientID: process.env.APPLE_CLIENT_ID,
//             teamID: process.env.APPLE_TEAM_ID,
//             keyID: process.env.APPLE_KEY_ID,
//             privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
//             callbackURL: process.env.APPLE_CALLBACK_URL,
//             passReqToCallback: false,
//         },
//         async (accessToken, refreshToken, idToken, profile, done) => {
//             try {
//                 // Apple returns minimal profile data
//                 const email = profile.email;
//                 const appleId = profile.sub;

//                 // Check if user already exists
//                 let user = await User.findOne({
//                     $or: [
//                         { providerId: appleId, provider: 'apple' },
//                         { email: email }
//                     ]
//                 });

//                 if (user) {
//                     // User exists, update OAuth info if needed
//                     if (!user.providerId) {
//                         user.provider = 'apple';
//                         user.providerId = appleId;
//                         await user.save();
//                     }
//                     return done(null, user);
//                 }

//                 // Create new user
//                 user = await User.create({
//                     name: profile.name?.firstName
//                         ? `${profile.name.firstName} ${profile.name.lastName || ''}`.trim()
//                         : email.split('@')[0], // Use email prefix as fallback
//                     email: email,
//                     provider: 'apple',
//                     providerId: appleId,
//                 });

//                 return done(null, user);
//             } catch (error) {
//                 return done(error, null);
//             }
//         }
//     )
// );

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
