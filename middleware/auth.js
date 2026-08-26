'use strict';

function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) return next();
  if (req.accepts('html')) return res.redirect('/login');
  return res.status(401).send('Yetkisiz erişim. Lütfen giriş yapın.');
}

function redirectIfAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) return res.redirect('/');
  return next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.session && (req.session.role === role || req.session.role === 'admin')) return next();
    return res.status(403).send('Bu işlem için yetkiniz yok.');
  };
}

module.exports = { requireAuth, redirectIfAuth, requireRole };
