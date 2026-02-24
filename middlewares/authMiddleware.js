const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    res.locals.currentUser = decoded;
    return next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

exports.attachUserIfAny = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.locals.currentUser = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    res.locals.currentUser = decoded;
  } catch (error) {
    res.locals.currentUser = null;
  }

  return next();
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).send('Access denied');
  }
  return next();
};
