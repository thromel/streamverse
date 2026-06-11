const jwt = require('jsonwebtoken');
const config = require('../config');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  
  //To handle weird browser behavior
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, config.jwtSecret);
    req.userData = { EMAIL: decodedToken.EMAIL };
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 401);
    return next(error);
  }
};
