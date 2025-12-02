export class FileService {
    static getFileUrl(protocol, host, filename) {
        return `${protocol}://${host}/static/${filename}`;
    }

    static getImageUrl(protocol, host, imagename) {
        return `${protocol}://${host}/public/images/${imagename}`;
    }
}
