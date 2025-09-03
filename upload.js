const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "ddigwr0f3",
  api_key: "698344476133175",
  api_secret: "kks417iAtI1XaGCACe_b5aEdWE0",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "patients_scans",
      format: "png",
      public_id: file.originalname.split(".")[0],
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
