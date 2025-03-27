import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export async function protectRoute(req, res, next) {
    try {
      // 1
      const token = req.cookies.jwt;
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No Token provided'})
      }

      // 2
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) {
        return res.status(401).json({ message: 'Unauthorized - Invalid Token'})
      }

       // 3
       const user = jwt.findById(decoded.userId).select('-password');
       if (!user) {
         return res.status(404).json({ message: 'User not found' })
       }
    } catch (error) {
        console.log('Error in protectRoute middleware: ', error.message);
        res.status(500).json({ message: 'Internal Server Error in protectRoute function'});
    }
}