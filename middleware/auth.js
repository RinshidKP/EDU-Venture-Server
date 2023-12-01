import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const secretKey = process.env.JWT_SECRET; 
  const payload = {
    role: user.role,
    name: user.username,
    email: user.email,
    id:user._id
  };
  const options = {
    expiresIn: '8h',
  };
  return jwt.sign(payload, secretKey, options);
};

export const verify = (req, res, next) => {
  try {
    // console.log(req);
    const token = req.header('Authorization');
    const userRole = req.header('userRole'); 
    // console.log('Authorization:',token); 
    // console.log('userRole:', userRole);
    
    if (token) {
      const secretKey = process.env.JWT_SECRET;
      const verified = jwt.verify(token , secretKey);

      if (verified.role !== userRole) {
        // console.log('verfied',verified);
        res.status(403).json({ success: false, message: 'Forbidden' });
      } else {
        req.user = verified;
        next();
      }
    } else {
      res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

  
