import * as Multer from "multer";

const storageOptions = Multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./src/uploads/" + file.fieldname);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export class Utils {

  public multer = Multer({ storage: storageOptions, fileFilter: fileFilter });

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
