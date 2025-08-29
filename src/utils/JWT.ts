import * as Bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { getEnvironmentVariables } from "../environments/environment";
export class JWT {
  static encryptPassword(password: string) {
    return new Promise((resolve, reject) => {
      Bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
  }

  static generateAccessToken(payload) {
    const token = jwt.sign(payload, getEnvironmentVariables().jwt_secret_key, {
      expiresIn: "1y",
    });
    return token;
  }

  static generateRefreshToken(payload) {
    const token = jwt.sign(
      payload,
      getEnvironmentVariables().refresh_secret_key,
      {
        expiresIn: "1y",
      }
    );
    return token;
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
}
