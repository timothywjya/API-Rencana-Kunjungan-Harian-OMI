import { FileService } from "../services/file-service.js";

export class FileController {
    static getFileUrl(req, res) {
        const filename = req.params.filename;
        const fileUrl = FileService.getFileUrl(
            req.protocol,
            req.get("host"),
            filename
        );
        res.json({ url: fileUrl });
    }

    static getImageUrl(req, res) {
        const imagename = req.params.imagename;
        const imageUrl = FileService.getImageUrl(
            req.protocol,
            req.get("host"),
            imagename
        );
        res.json({ url: imageUrl });
    }
}
