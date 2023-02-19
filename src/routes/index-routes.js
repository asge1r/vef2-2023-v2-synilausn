import express from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';
import { catchErrors } from '../lib/catch-errors.js';
import {
  findRegistrationForUser,
  listEvent,
  listEvents,
  listRegistered,
  register,
} from '../lib/db.js';

export const indexRouter = express.Router();

async function indexRoute(req, res) {
  const { user } = req;
  const events = await listEvents();

  res.render('index', {
    user,
    title: 'Viðburðasíðan',
    admin: false,
    events,
  });
}

async function eventRoute(req, res, next) {
  const { slug } = req.params;
  const { user } = req;

  const event = await listEvent(slug);

  if (!event) {
    return next();
  }

  const registered = await listRegistered(event.id);
  const userRegistration = user
    ? await findRegistrationForUser({ userId: user.id, eventId: event.id })
    : null;

  return res.render('event', {
    user,
    title: `${event.name} — Viðburðasíðan`,
    event,
    registered,
    userRegistration,
    errors: [],
    data: {},
  });
}

async function eventRegisteredRoute(req, res) {
  const { user } = req;
  const events = await listEvents();

  res.render('registered', {
    user,
    title: 'Viðburðasíðan',
    events,
  });
}

async function validationCheck(req, res, next) {
  const { user } = req;
  const { name, comment } = req.body;

  const { slug } = req.params;
  const event = await listEvent(slug);
  const registered = await listRegistered(event.id);

  const data = {
    name,
    comment,
  };

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    return res.render('event', {
      user,
      title: `${event.name} — Viðburðasíðan`,
      data,
      event,
      registered,
      userRegistration: null,
      errors: validation.errors,
    });
  }

  return next();
}

async function registerRoute(req, res) {
  const { user } = req;
  const { comment } = req.body;
  const { slug } = req.params;
  const event = await listEvent(slug);

  const registered = await register({
    userId: user.id,
    eventId: event.id,
    comment,
  });

  if (registered) {
    return res.redirect(`/${event.slug}`);
  }

  return res.render('error');
}

indexRouter.get('/', catchErrors(indexRoute));
indexRouter.get('/:slug', catchErrors(eventRoute));
indexRouter.post(
  '/:slug',
  body('comment')
    .isLength({ max: 400 })
    .withMessage('Athugasemd má að hámarki vera 400 stafir'),
  body('comment').customSanitizer((v) => xss(v)),
  catchErrors(validationCheck),
  body('comment').trim().escape(),
  catchErrors(registerRoute)
);
indexRouter.get('/:slug/thanks', catchErrors(eventRegisteredRoute));
