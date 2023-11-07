import jwt from 'jsonwebtoken';

export const generateToken = (user,role) => {
  const secretKey = process.env.JWT_SECRET; 
  const payload = {
    role,
    name: user.username,
    email: user.email,
  };
  const options = {
    expiresIn: '8h',
  };
  return jwt.sign(payload, secretKey, options);
};

export const verify = (req, res, next) => {
  try {
    const token = req.header('Authorization');
    const userRole = req.header('userRole'); 
    // console.log('here',token);
    // console.log('User Role:', userRole);
    
    if (token) {
      const secretKey = process.env.JWT_SECRET;
      const verified = jwt.verify(token , secretKey);

      if (verified.role !== userRole) {
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

  
