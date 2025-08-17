import * as jwt from "jsonwebtoken";
import { getEnvironmentVariables } from "../environment/environment";
import * as Bcrypt from "bcrypt";

export class JWT {
  
  static generateAccessToken(payload, aud) {
    const token = jwt.sign(payload, getEnvironmentVariables().jwt_secret_key, {
      audience: aud,
      expiresIn: "30s",
    });
    return token;
  }

  static generateRefreshToken(payload, aud) {
    const token = jwt.sign(
      payload,
      getEnvironmentVariables().refresh_secret_key,
      {
        audience: aud,
        expiresIn: "1h",
      }
    );
    return token;
  }

  static encryptPassword(password: string) {
    return new Promise((resolve, reject) => {
      Bcrypt.hash(password, 10, (err, hash) => {
        // Store hash in your password DB.
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
  }

  static comparePassword(password: {
    password: string;
    encrypt_password: string;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      Bcrypt.compare(
        password.password,
        password.encrypt_password,
        function (err, same) {
          if (err) {
            reject(err);
          } else if (!same) {
            reject(new Error("invalid email or password"));
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  static jwtVerify(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getEnvironmentVariables().jwt_secret_key,
        (err, decoded) => {
          if (err) {
            reject(err);
          } else if (!decoded) reject(new Error("User not authorized..."));
          else resolve(decoded);
        }
      );
    });
  }

  static jwtVerifyRefreshToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getEnvironmentVariables().refresh_secret_key,
        (err, decoded) => {
          if (err) {
            reject(err);
          } else if (!decoded) reject(new Error("User not authorized..."));
          else resolve(decoded);
        }
      );
    });
  }
}
