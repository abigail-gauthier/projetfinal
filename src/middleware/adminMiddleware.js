// === BLOCK: ADMIN MIDDLEWARE — START === //
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.roleId !== 2) {
    return res.status(403).json({ error: 'Accès refusé. Réservé aux administrateurs.' });
  }
  next();
}

module.exports = adminMiddleware;
// === BLOCK: ADMIN MIDDLEWARE — END === //