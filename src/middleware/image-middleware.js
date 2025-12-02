const ACCESS_KEY = process.env.IMAGE_KEY;

// Middleware untuk memeriksa kunci
function checkAccessKey(req, res, next) {
    const key = req.headers.imagekey;

    if (key === ACCESS_KEY) {
        next(); // Kunci valid, lanjutkan ke handler berikutnya
    } else {
        res.status(403).json({ status: 403, message: "Unauthorize" });
    }
}

export { checkAccessKey };
