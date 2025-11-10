import * as Multer from "multer";

const storageOptions = Multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "./src/uploads/photo"; // default
    if (file.mimetype.includes("spreadsheet")) folder = "./src/uploads/excel";
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel
    "application/vnd.ms-excel", // older Excel format
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
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

const storageOptionsStudyMaterial = Multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "./src/uploads/studymaterial"; // store PDFs here
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// File Filter (Only PDF)
const fileFilterStudyMaterial = (req, file, cb) => {
  const allowedMimes = ["application/pdf"]; // only allow PDF
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// Export Class
export class UtilsofStudy {
  public multer = Multer({
    storage: storageOptionsStudyMaterial,
    fileFilter: fileFilterStudyMaterial,
    limits: { fileSize: 10 * 1024 * 1024 }, // optional: max 10MB per file
  });
}
