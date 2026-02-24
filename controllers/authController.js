const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register', error: null });
};

exports.postRegister = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).render('auth/register', {
        title: 'Register',
        error: 'Username and password are required',
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).render('auth/register', {
        title: 'Register',
        error: 'Username already exists',
      });
    }

    const safeRole = role === 'admin' ? 'admin' : 'user';
    await User.create({ username, password, role: safeRole });

    return res.redirect('/login');
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(400).render('auth/register', {
        title: 'Register',
        error: 'Username already exists',
      });
    }

    if (error && error.name === 'ValidationError') {
      const firstValidationMessage = Object.values(error.errors || {})[0]?.message;
      return res.status(400).render('auth/register', {
        title: 'Register',
        error: firstValidationMessage || 'Please enter valid registration details',
      });
    }

    console.error('Register error:', error.message);
    return res.status(500).render('auth/register', {
      title: 'Register',
      error: 'Registration failed',
    });
  }
};

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login', error: null });
};

exports.postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).render('auth/login', {
        title: 'Login',
        error: 'Invalid credentials',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).render('auth/login', {
        title: 'Login',
        error: 'Invalid credentials',
      });
    }

    const token = createToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect('/tasks');
  } catch (error) {
    return res.status(500).render('auth/login', {
      title: 'Login',
      error: 'Login failed',
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
