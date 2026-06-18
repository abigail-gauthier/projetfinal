const jwt = require('jsonwebtoken');

// Middleware that protects a route by checking the JWT token
function authMiddleware(req, res, next) {
  // 1. Get the "Authorization" header from the request
  const authHeader = req.headers.authorization;

  // 2. Check that it exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou invalide.' });
  }

  // 3. Extract the token (everything after "Bearer ")
  const token = authHeader.split(' ')[1];

  // 4. Verify the token is valid
  try {
    const decoded = jwt.verify(token, 'temporary-secret-key');
    req.user = decoded; // Attach user info to the request for use in the route
    next(); // Token is valid, continue to the route
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
}

module.exports = authMiddleware;