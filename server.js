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
app.use(flash());

passport.serializeUser(function(user, done) {
  return done(null, user._id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    return done(null, user);
  } catch (e) {
    return done(e);
  }
});

passport.use(
  'login',
  new LocalStrategy({ passReqToCallback: true }, async (req, username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        console.error(`No user found with username ${username}`);
        return done(null, false, { message: 'User not found.' });
      } else if (!isValidPassword(user, password)) {
        console.error(`Invalid password for user ${user.username}`);
        return done(null, false, { message: 'Invalid Password' });
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
  new LocalStrategy({ passReqToCallback: true }, ({ body }, username, password, done) => {
    const findOrCreateUser = async function() {
      try {
        const user = await User.findOne({ username: username });
        if (user) {
          if (!isValidPassword(user, password)) {
            console.error(`Invalid password for user ${user.username}`);
            return done(null, false, { message: 'Incorrect User Password' });
          }
          return done(null, user);
        } else {
          let newUser = new User({ username, password: hashPassword(password), admin: true });
          if (process.env['ADMIN_SECRET'] !== body['secretkey']) {
            console.error('Incorrect admin secret', body.secretkey);
            return done(null, false, { message: 'You must provide the correct admin code in order to register!' });
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
  req.flash('error', req.user && req.user.admin ? 'You are not an admin.' : 'You are not authenticated.');
  res.redirect('/login');
};

const MONGO_DB_URI = process.env['MONGODB_URI'];
const SETTINGS_ID = process.env['SETTINGS_ID'];
mongoose.connect(MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function setupAndRun() {
  const settings = await Settings.findById(SETTINGS_ID);

  const concert_file = process.argv[2];

  if (concert_file) {
    const concertJson = await fs.readFile(concert_file, 'utf8');
    const _new_concert = new Concert(JSON.parse(concertJson));
    await _new_concert.save();

    settings.concert_info = _new_concert._id;
    settings.save();
  }

  let nowPlayingState = 'state-blank';

  var show_charity_notice = false;

  app.get('/control-panel', isAuthenticated, async function(req, res) {
    const { concert_info: concert } = await Settings.findById(SETTINGS_ID).populate('concert_info');

    res.render('control-panel', concert);
  });

  app.get('/login', async (req, res) => {
    const { concert_info: concert } = await Settings.findById(SETTINGS_ID).populate('concert_info', 'concert');
    res.render('login', { concert: concert.concert, message: req.flash('error')[0] });
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

  app.get('/overlay', async function(req, res) {
    const { concert_info: concert } = await Settings.findById(SETTINGS_ID).populate('concert_info');

    res.render('overlay', concert);
  });

  app.get('/', async (req, res) => {
    const { concert_info: concert } = await Settings.findById(SETTINGS_ID).populate('concert_info');

    res.render('index', concert);
  });

  io.on('connection', async function(socket) {
    const { concert_info: concert } = await Settings.findById(SETTINGS_ID).populate('concert_info');

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

  io.on('reconnect', async socket => {
    const { concert_info: concert } = await Settings.findById(SETTINGS_ID).populate('concert_info');

    socket.emit('concert-details', concert);
  });

  http.listen(PORT, () => console.log(`Listening on ${PORT}`));
}

setupAndRun();
