const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cloudinary config
cloudinary.config({
  cloud_name: "ddigwr0f3", // apna cloud_name
  api_key: "698344476133175", // apna api_key
  api_secret: "kks417iAtI1XaGCACe_b5aEdWE0", // apna api_secret
});

// Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "patients_scans",
      format: "png", // force format (ya file.mimetype.split('/')[1])
      public_id: file.originalname.split(".")[0],
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
