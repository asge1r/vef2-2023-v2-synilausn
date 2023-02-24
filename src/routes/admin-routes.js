import express from 'express';
import { validationResult } from 'express-validator';
import { catchErrors } from '../lib/catch-errors.js';
import {
  createEvent,
  deleteEvent,
  listEvent,
  listEventByName,
  listEvents,
  updateEvent,
} from '../lib/db.js';
import { slugify } from '../lib/slugify.js';
import {
  registrationValidationMiddleware,
  sanitizationMiddleware,
  xssSanitizationMiddleware,
} from '../lib/validation.js';

export const adminRouter = express.Router();

async function index(req, res) {
  const events = await listEvents();
  const { user } = req;

  return res.render('admin', {
    user,
    events,
    errors: [],
    data: {},
    title: 'Viðburðir — umsjón',
    admin: true,
  });
}

async function validationCheck(req, res, next) {
  const { name, description, location, url } = req.body;

  const events = await listEvents();
  const { user } = req;

  const data = {
    name,
    description,
    location,
    url,
  };

  const validation = validationResult(req);

  const customValidations = [];

  const eventNameExists = await listEventByName(name);

  // TODO fella inn í almenna validation
  if (eventNameExists !== null) {
    customValidations.push({
      param: 'name',
      msg: 'Viðburður með þessu nafni er til',
    });
  }

  if (!validation.isEmpty() || customValidations.length > 0) {
    return res.render('admin', {
      events,
      user,
      title: 'Viðburðir — umsjón',
      data,
      errors: validation.errors.concat(customValidations),
      admin: true,
    });
  }

  return next();
}

async function validationCheckUpdate(req, res, next) {
  const { name, description } = req.body;
  const { slug } = req.params;
  const { user } = req;

  const event = await listEvent(slug);

  const data = {
    name,
    description,
  };

  const validation = validationResult(req);

  const customValidations = [];

  const eventNameExists = await listEventByName(name);

  if (eventNameExists !== null && eventNameExists.id !== event.id) {
    customValidations.push({
      param: 'name',
      msg: 'Viðburður með þessu nafni er til',
    });
  }

  if (!validation.isEmpty() || customValidations.length > 0) {
    return res.render('admin-event', {
      user,
      event,
      title: 'Viðburðir — umsjón',
      data,
      errors: validation.errors.concat(customValidations),
      admin: true,
    });
  }

  return next();
}

async function registerRoute(req, res, next) {
  const { name, description, location, url } = req.body;
  const slug = slugify(name);

  const created = await createEvent({ name, slug, description, location, url });

  if (created) {
    return res.redirect('/admin');
  }

  return next(new Error('Villa við að búa til viðburð'));
}

async function updateRoute(req, res) {
  const { name, description, location, url } = req.body;
  const { slug } = req.params;

  const event = await listEvent(slug);

  const newSlug = slugify(name);

  const updated = await updateEvent(event.id, {
    name,
    slug: newSlug,
    description,
    location,
    url,
  });

  if (updated) {
    return res.redirect('/admin');
  }

  return res.render('error');
}

async function eventRoute(req, res, next) {
  const { slug } = req.params;
  const { user } = req;

  const event = await listEvent(slug);

  if (!event) {
    return next();
  }

  return res.render('admin-event', {
    user,
    title: `${event.name} — Viðburðir — umsjón`,
    event,
    errors: [],
    data: {
      name: event.name,
      description: event.description,
      location: event.location,
      url: event.url,
    },
  });
}

async function deleteRoute(req, res, next) {
  const { id } = req.params;

  const result = await deleteEvent(id);

  if (result) {
    return res.redirect('/admin');
  }

  return next(new Error('Villa við að eyða viðburði'));
}

adminRouter.get('/', /* ensureLoggedIn, ensureAdmin, */ catchErrors(index));
adminRouter.post(
  '/',
  // ensureLoggedIn,
  // ensureAdmin,
  registrationValidationMiddleware('description'),
  xssSanitizationMiddleware('description'),
  catchErrors(validationCheck),
  sanitizationMiddleware('description'),
  catchErrors(registerRoute)
);

// Verður að vera seinast svo það taki ekki yfir önnur route
adminRouter.get(
  '/:slug',
  /* ensureLoggedIn, ensureAdmin, */ catchErrors(eventRoute)
);
adminRouter.post(
  '/:slug',
  // ensureLoggedIn,
  // ensureAdmin,
  registrationValidationMiddleware('description'),
  xssSanitizationMiddleware('description'),
  catchErrors(validationCheckUpdate),
  sanitizationMiddleware('description'),
  catchErrors(updateRoute)
);

adminRouter.post(
  '/delete/:id',
  // ensureLoggedIn,
  // ensureAdmin,
  catchErrors(deleteRoute)
);
