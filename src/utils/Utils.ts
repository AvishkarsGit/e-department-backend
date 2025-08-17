
export class Utils {
  static generateVerificationToken() {
    let len: number = 6;
    let token = "";
    for (let i = 1; i <= len; i++) {
      token += Math.floor(Math.random() * 10);
    }
    return token;
  }

  static MAX_TOKEN_TIME = 2 * 60 * 1000;


}
