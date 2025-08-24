import { validationResult } from "express-validator";
import { JWT } from "../utils/JWT";

export class GlobalMiddleware {
  static checkError(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      next(new Error(errors.array()[0].msg));
    } else {
      next();
    }
  }

  static async auth(req, res, next) {
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
}
