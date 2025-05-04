import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define a type for the decoded user payload
interface UserPayload {
  id: string;
  // Add other properties from your JWT payload if necessary
}

// Extend the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;

      // Attach user to the request object
      // Note: You might need to fetch the full user from DB here depending on your needs
      req.user = decoded; // Assign the decoded payload
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Example of an admin check middleware (if needed)
/*
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) { // Assuming isAdmin property exists in payload
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
*/

// Remove the unused error handler function
/*
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
};
*/