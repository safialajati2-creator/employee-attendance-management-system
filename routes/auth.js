'use strict';

const express = require('express');
const router = express.Router();
const { redirectIfAuth } = require('../middleware/auth');

function configuredUsers() {
  return [
    {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
    },
    {
      username: process.env.SUPERVISOR_USERNAME || 'supervisor',
      password: process.env.SUPERVISOR_PASSWORD,
      role: 'supervisor',
    },
  ].filter((user) => user.password);
}

router.get('/login', redirectIfAuth, (req, res) => {
  res.render('login', { title: 'Giriş', layout: false, error: null });
});

router.post('/login', redirectIfAuth, (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const user = configuredUsers().find(
    (candidate) => candidate.username === username && candidate.password === password
  );

  if (!user) {
    return res.status(401).render('login', {
      title: 'Giriş', layout: false,
      error: 'Kullanıcı adı veya şifre hatalı.',
    });
  }

  req.session.isAuthenticated = true;
  req.session.username = user.username;
  req.session.role = user.role;
  return req.session.save(() => res.redirect('/'));
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
