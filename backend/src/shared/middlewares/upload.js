import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure storage subfolders exist
const folders = [
  "uploads/avatars",
  "uploads/chat",
  "uploads/announcements",
  "uploads/books",
];

folders.forEach((folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/";
    if (file.fieldname === "avatar") {
      folder += "avatars/";
    } else if (file.fieldname === "chat") {
      folder += "chat/";
    } else if (file.fieldname === "announcement") {
      folder += "announcements/";
    } else if (file.fieldname === "book") {
      folder += "books/";
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  let allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (file.fieldname === "chat") {
    allowedTypes.push("application/pdf");
  }
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    if (file.fieldname === "chat") {
      cb(new Error("Only JPEG, PNG, WEBP, GIF images and PDF documents are allowed"), false);
    } else {
      cb(new Error("Only JPEG, PNG, WEBP and GIF images are allowed"), false);
    }
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
