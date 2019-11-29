const fs = require('fs').promises;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

const { User, isValidPassword, hashPassword } = require('./models/user');
const { Concert } = require('./models/concert');
const { Settings } = require('./models/settings');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const expressSession = require('express-session');

const PORT = process.env.PORT || 5000;

app.use(express.static('public'));

app.use(flash());

app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  expressSession({
    secret: process.env['SECRET_KEY'],
    resave: true,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  return done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  return User.findById(id, function(err, user) {
    return done(err, user);
  });
});

passport.use(
  'login',
  new LocalStrategy({ passReqToCallback: true }, async (req, username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        console.error(`No user found with username ${username}`);
        return done(null, false, req.flash('message', 'User not found.'));
      } else if (!isValidPassword(user, password)) {
        console.error(`Invalid password for user ${user.username}`);
        return done(null, false, req.flash('message', 'Invalid Password'));
      } else {
        return done(null, user);
      }
    } catch (e) {
      return done(e);
    }
  })
);

passport.use(
  'signup',
  new LocalStrategy({ passReqToCallback: true }, async (req, username, password, done) => {
    const findOrCreateUser = async function() {
      try {
        const user = await User.findOne({ username: username });
        if (user) {
          if (!isValidPassword(user, password)) {
            console.error(`Invalid password for user ${user.username}`);
            return done(null, false, req.flash('message', 'Invalid Password'));
          }
          return done(null, user);
        } else {
          let newUser = new User({ username, password: hashPassword(password), admin: true });
          if (process.env['ADMIN_SECRET'] !== req.params['secretkey']) {
            req.flash('message', 'You must provide the correct admin code in order to register!');
            return done(null, false, req.flash('message', 'Incorrect/Missing Admin Code'));
          }

          newUser
            .save()
            .then(user => {
              console.log(`User registration successful for ${user.username}`);
              return done(null, user);
            })
            .catch(err => {
              console.error(`Error in saving new user: ${err}`);
              throw err;
            });
        }
      } catch (error) {
        console.error(`Error in signup/signIn with username ${username}`);
        return done(error);
      }
    };

    process.nextTick(findOrCreateUser);
  })
);

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin) return next();
  req.flash('message', req.isAuthenticated() ? 'You are not an admin.' : 'You are not authenticated.');
  res.redirect('/login');
};

const MONGO_DB_URI = process.env['MONGODB_URI'];
mongoose.connect(MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function setupAndRun() {
  const settings = await Settings.findById('5de10d2b7c213e56251b3cf4');

  const concert_file = process.argv[2];

  if (concert_file) {
    const concertJson = await fs.readFile(concert_file, 'utf8');
    const _new_concert = new Concert(JSON.parse(concertJson));
    await _new_concert.save();

    settings.concert_info = _new_concert._id;
    settings.save();
  }

  const { concert_info: concert } = await Settings.findById('5de10d2b7c213e56251b3cf4').populate('concert_info');

  let nowPlayingState = 'state-blank';

  var show_charity_notice = false;

  app.get('/control-panel', isAuthenticated, function(req, res) {
    res.render('control-panel', concert);
  });

  app.get('/login', (req, res) => {
    if (req.flash('message')) res.render('login', { concert: concert.concert, message: req.flash('message') });
  });

  app.post(
    '/login',
    passport.authenticate('signup', {
      successRedirect: '/control-panel',
      failureRedirect: '/login',
      failureFlash: true
    })
  );

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/overlay', function(req, res) {
    res.render('overlay', concert);
  });

  app.get('/', (req, res) => {
    res.render('index', concert);
  });

  io.on('connection', function(socket) {
    socket.emit('concert-details', concert);
    socket.emit('nowplaying-update', nowPlayingState ? nowPlayingState : 'state-blank');
    socket.emit('charity-display-update', show_charity_notice);

    socket.on('nowplaying-update', function(nowPlaying) {
      if (nowPlayingState !== nowPlaying) {
        socket.broadcast.emit('nowplaying-update', nowPlaying);
        nowPlayingState = nowPlaying;
      }
    });

    socket.on('change-video-link', newLink => {
      concert.fbvideo = newLink;
      socket.broadcast.emit('concert-details', concert);
      concert.save();
    });

    socket.on('charity-display-update', newState => {
      if (show_charity_notice != newState) {
        show_charity_notice = newState;
        socket.broadcast.emit('charity-display-update', show_charity_notice);
      }
    });
  });

  io.on('reconnect', socket => {
    socket.emit('concert-details', concert);
  });

  http.listen(PORT, () => console.log(`Listening on ${PORT}`));
}

setupAndRun();
