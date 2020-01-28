/* eslint-disable @typescript-eslint/camelcase */
import { promises as fs } from 'fs';
import express, { NextFunction, Response, Request } from 'express';
import httpModule from 'http';
import ioModule from 'socket.io';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import expressSession from 'express-session';
import lowdb from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';

import { User, isValidPassword, hashPassword, UserType } from './models/user';
import { ConcertModel } from './models/concert';
import { Settings } from './models/settings';
import { isString, isBoolean } from 'util';

const app = express();
const http = new httpModule.Server(app);
const io = ioModule(http);

interface State {
  showCharityNotice: boolean;
  nowPlayingState: string;
}
const stateAdapter = new FileAsync<State>('state.json');

const SETTINGS_ID = process.env['SETTINGS_ID'];

const PORT = process.env.PORT || 5000;
app.use(express.static(__dirname + '/../public'));

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

passport.serializeUser<UserType, string>((user, done) => {
  return done(null, user._id);
});

passport.deserializeUser<UserType, string>(async (id, done) => {
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
    const findOrCreateUser = async function(): Promise<void> {
      try {
        const user = await User.findOne({ username: username });
        if (user) {
          if (!isValidPassword(user, password)) {
            console.error(`Invalid password for user ${user.username}`);
            return done(null, false, { message: 'Incorrect User Password' });
          }
          return done(null, user);
        } else {
          const newUser = new User({ username, password: hashPassword(password), admin: true });
          if ((await Settings.findById(SETTINGS_ID)).admin_secret !== body['secretkey']) {
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

const isAuthenticated = (
  req: Request & { user: UserType; isAuthenticated: () => boolean },
  res: Response,
  next: NextFunction
): void => {
  if (req.isAuthenticated() && req.user.admin) return next();
  req.flash('error', req.user && !req.user.admin ? 'You are not an admin.' : 'You are not authenticated.');
  res.redirect('/login');
};

const redirectToControlPanel = (req: any, res: Response, next: NextFunction): void => {
  if (req.user && req.user.admin) return res.redirect('/control-panel');
  return next();
};

const MONGO_DB_URI = process.env['MONGODB_URI'];

mongoose.connect(MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function setupAndRun(): Promise<void> {
  const settings = await Settings.findById(SETTINGS_ID);

  const concertFile = process.argv[2];

  if (concertFile) {
    const concertJson = await fs.readFile(concertFile, 'utf8');
    const _newConcert = new ConcertModel(JSON.parse(concertJson));
    await _newConcert.save();

    settings.concert_info = _newConcert._id;
    await settings.save();
  }

  const state = await lowdb(stateAdapter);
  await state
    .defaults<State>({
      nowPlayingState: 'state-blank',
      showCharityNotice: false
    })
    .write();

  app.get('/control-panel', isAuthenticated, async function(req, res) {
    const { concert_info: concert } = await Settings.findById(SETTINGS_ID).populate('concert_info');

    res.render('control-panel', concert);
  });

  app.get('/login', redirectToControlPanel, async (req, res) => {
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

  io.on('connection', async socket => {
    const { concert_info: concert } = await Settings.findById(SETTINGS_ID).populate('concert_info');

    socket.emit('concert-details', concert);
    socket.emit('nowplaying-update', state.get('nowPlayingState').value());
    socket.emit('charity-display-update', state.get('showCharityNotice').value());

    socket.on('nowplaying-update', async (nowPlaying: unknown) => {
      if (nowPlaying !== state.get('nowPlayingState').value() && isString(nowPlaying)) {
        await state.set('nowPlayingState', nowPlaying).write();
        socket.broadcast.emit('nowplaying-update', nowPlaying);
      }
    });

    socket.on('change-video-link', async (newLink: unknown) => {
      if (concert.fbvideo === newLink || newLink === '' || !isString(newLink)) return false;
      concert.fbvideo = newLink;
      await concert.save();
      socket.broadcast.emit('concert-details', concert);
      socket.emit('concert-details', concert);
    });

    socket.on('charity-display-update', async (newState: unknown) => {
      if (state.get('showCharityNotice').value() != newState && isBoolean(newState)) {
        await state.set('showCharityNotice', newState).write();
        socket.broadcast.emit('charity-display-update', newState);
      }
    });
  });

  io.on('reconnect', async socket => {
    const { concert_info: concert } = await Settings.findById(SETTINGS_ID).populate('concert_info');
    socket.emit('concert-details', concert);
    socket.emit('nowplaying-update', state.get('nowPlayingState').value());
    socket.emit('charity-display-update', state.get('showCharityNotice').value());
  });

  http.listen(PORT, () => console.log(`Listening on ${PORT}\nThe Admin code is "${settings.admin_secret}"`));
}

setupAndRun();
