export class Utils {
  static generateVerificationToken(length: number = 6) {
    let otp = "";
    for (let i = 1; i <= length; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    return otp;
  }

  static MAX_TOKEN_TIME = 2 * 60 * 1000; //2 minutes

  static generateUsername(name: string) {
    //generate number
    let username = "";
    const number = this.generateVerificationToken(3);
    const nameArr = name.split(" ");
    username = nameArr[0] + "_" + number;
    return username;
  }

  static generatePassword(name: string, numberLength: number = 3) {
    const symbols = "!@#$";
    const numbers = "0123456789";

    // Pick a random symbol
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];

    // Generate random number string
    let numStr = "";
    for (let i = 0; i < numberLength; i++) {
      numStr += numbers[Math.floor(Math.random() * numbers.length)];
    }

    //split the name for first name
    const nameArr = name.split(" ");

    // Add another random symbol at the end (optional)
    const endSymbol = symbols[Math.floor(Math.random() * symbols.length)];

    return `${nameArr[0]}${symbol}${numStr}${endSymbol}`;
  }
}
