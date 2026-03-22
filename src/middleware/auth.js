const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
<<<<<<< HEAD
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin || false;
=======
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
>>>>>>> 088f87957ad536d3d27b403fd3e63ac554ccaa15
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

<<<<<<< HEAD
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    req.userId = decoded.userId;
    req.isAdmin = true;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticate, requireAdmin };
=======
module.exports = { authenticate };
>>>>>>> 088f87957ad536d3d27b403fd3e63ac554ccaa15
