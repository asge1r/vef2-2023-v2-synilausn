import express from 'express';
import { body, validationResult } from 'express-validator';
import { catchErrors } from '../lib/catch-errors.js';
import passport from '../lib/login.js';
import { createUser, findByUsername } from '../lib/users.js';

export const userRouter = express.Router();

function login(req, res) {
  if (req.isAuthenticated()) {
    if (req.user.admin) return res.redirect('/admin');

    return res.redirect('/');
  }

  let message = '';

  // Athugum hvort einhver skilaboð séu til í session, ef svo er birtum þau
  // og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.render('login', { message, title: 'Innskráning' });
}

// hér væri hægt að bæta við enn frekari (og betri) staðfestingu á gögnum
async function validateUser(username, password) {
  if (typeof username !== 'string' || username.length < 2) {
    return 'Notendanafn verður að vera amk 2 stafir';
  }

  const user = await findByUsername(username);

  // Villa frá findByUsername
  if (user === null) {
    return 'Gat ekki athugað notendanafn';
  }

  if (user) {
    return 'Notendanafn er þegar skráð';
  }

  if (typeof password !== 'string' || password.length < 6) {
    return 'Lykilorð verður að vera amk 6 stafir';
  }

  return null;
}

async function registerGet(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  return res.render('register', {
    title: 'Nýskráning — Viðburðasíðan',
    data: {},
    errors: [],
  });
}

const registerValidation = [
  body('username')
    .isLength({ min: 1, max: 64 })
    .withMessage('Skrá verður notendanafn, hámark 64 stafir.'),
  body('name')
    .isLength({ min: 1, max: 64 })
    .withMessage('Skrá verður nafn, hámark 64 stafir.'),
  body('password')
    .isLength({ min: 10, max: 256 })
    .withMessage('Skrá verður lykilorð, lágmark 10 stafir.'),
  body('username').custom(async (username) => {
    const user = await findByUsername(username);
    if (user) {
      return Promise.reject(new Error('Notendanafn er þegar skráð.'));
    }
    return Promise.resolve();
  }),
];

async function validationCheck(req, res, next) {
  const { name, username } = req.body;

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const data = {
      name,
      username,
    };

    return res.render('register', {
      title: 'Nýskráning — Viðburðasíðan',
      data,
      errors: validation.errors,
    });
  }

  return next();
}

async function register(req, res, next) {
  const { name, username, password } = req.body;

  const validationMessage = await validateUser(username, password);

  if (validationMessage) {
    return res.send(`
      <p>${validationMessage}</p>
      <a href="/register">Reyna aftur</a>
    `);
  }

  const user = await createUser(name, username, password);

  if (!user) {
    return next(new Error('Gat ekki búið til notanda'));
  }

  // næsta middleware mun sjá um að skrá notanda inn
  // `username` og `password` verða ennþá sett sem rétt í `req`
  return next();
}

userRouter.get('/login', login);
userRouter.post(
  '/login',

  // Þetta notar strat úr lib/passport.js
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),

  // Ef við komumst hingað var notandi skráður inn
  (req, res) => {
    res.redirect('/');
  }
);

userRouter.get('/logout', async (req, res, next) => {
  // logout hendir session cookie og session
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.redirect('/');
  });
});

userRouter.get('/register', registerGet);

userRouter.post(
  '/register',
  registerValidation,
  catchErrors(validationCheck),
  catchErrors(register),
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),
  (req, res) => {
    res.redirect('/');
  }
);
