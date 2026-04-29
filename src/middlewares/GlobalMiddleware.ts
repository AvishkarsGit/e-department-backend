import { validationResult } from "express-validator";
import { JWT } from "../utils/JWT";
import { Request, Response, NextFunction } from "express";

export class GlobalMiddleware {
  static checkError(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new Error(errors.array()[0].msg));
    } else {
      next();
    }
  }

  static async auth(req: Request, res: Response, next: NextFunction) {
    const auth_header = req.headers.authorization;
    const token = auth_header ? auth_header.slice(7, auth_header.length) : null;
    try {
      if (!token) {
        req.errorStatus = 401;
        next(new Error("User doesn't exist"));
      }
      const decoded = await JWT.jwtVerify(token);
      req.user = decoded;
      next();
    } catch (error) {
      req.errorStatus = 401;
      next(error);
    }
  }

  static checkRole(...allowedRoles) {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRole = req.user?.role;

      // Handle missing user or role
      if (!userRole) {
        req.errorStatus = 401;
        return next(new Error("User role is missing"));
      }

      // Check if role is allowed
      if (allowedRoles.includes(userRole)) {
        return next();
      } else {
        req.errorStatus = 401;
        return next(new Error("You are not authorized to perform this action"));
      }
    };
  }
}
