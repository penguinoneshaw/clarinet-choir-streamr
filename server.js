const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User, isValidPassword, hashPassword } = require('./models/user');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;

app.use(express.static('public'));

const flash = require('connect-flash');
app.use(flash());

app.set('view engine', 'pug');
app.set('views', './views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const expressSession = require('express-session');
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
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
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
        console.log(user);
        if (user) {
          console.log('User already exists');
          if (!isValidPassword(user, password)) {
            console.error(`Invalid password for user ${user.username}`);
            return done(null, false, req.flash('message', 'Invalid Password'));
          }
          return done(null, user);
        } else {
          let newUser = new User({ username, password: hashPassword(password), admin: true });
          if (process.env['ADMIN_SECRET'] !== req.param('secretkey')) {
            req.flash('message', 'You must provide the correct admin code in order to register!');
            done('Incorrect/Missing admin code');
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
        console.error(`Error in signup with username ${username}`);
        return done(error);
      }
    };

    process.nextTick(findOrCreateUser);
  })
);

const mongodburi = process.env['MONGODB_URI'];
mongoose.connect(mongodburi, { useNewUrlParser: true, useUnifiedTopology: true });

const concert_file = process.argv[2];

if (!concert_file) {
  console.error('Please provide path to concert json file.');
  process.exit(1);
}
let concert = JSON.parse(fs.readFileSync(concert_file, 'utf8'));

console.log('This is the file for: ' + concert.concert + ' being held at ' + concert.venue + '.');
concert.nowplaying = 'state-blank';

var show_charity_notice = false;

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin) return next();
  req.flash('message', req.isAuthenticated() ? 'You are not an admin.' : 'You are not authenticated.');
  res.redirect('/login');
};

app.get('/control-panel', isAuthenticated, function(req, res) {
  res.render('control-panel', concert);
});

app.get('/login', (req, res) => {
  res.render('login', { ...concert, message: req.flash('message') });
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
  console.log('A page connected');

  socket.emit('concert-details', concert);
  socket.emit('nowplaying-update', concert.nowplaying ? concert.nowplaying : 'state-blank');
  socket.emit('charity-display-update', show_charity_notice);

  socket.on('nowplaying-update', function(nowPlaying) {
    if (concert.nowplaying !== nowPlaying) {
      socket.broadcast.emit('nowplaying-update', nowPlaying);
      concert.nowplaying = nowPlaying;
    }
  });

  socket.on('change-video-link', newLink => {
    concert.fbvideo = newLink;
    socket.broadcast.emit('concert-details', concert);
  });

  socket.on('charity-display-update', newState => {
    if (show_charity_notice != newState) {
      show_charity_notice = newState;
      socket.broadcast.emit('charity-display-update', show_charity_notice);
    }
  });

  socket.on('disconnect', function() {
    console.log('page disconnected');
  });
});

io.on('reconnect', socket => {
  socket.emit('concert-details', concert);
});

http.listen(PORT, () => console.log(`Listening on ${PORT}`));
