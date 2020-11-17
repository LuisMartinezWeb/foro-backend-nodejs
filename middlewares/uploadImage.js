const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, "../uploads/users"));
    },

    filename(req, file = {}, cb) {
        const { originalname } = file;

        cb(null, uuidv4() + path.extname(file.originalname).toLocaleLowerCase());
    },
});

const mul_upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname));

        if (mimetype && extname) {
            return cb(null, true);
        }

        cb("error: El archivo debe ser de un formato soportado");
    },
});

exports.uploadImage = function() {
    return mul_upload;
};