import { MediaService } from "./media.service";
export declare class MediaController {
    private media;
    constructor(media: MediaService);
    upload(file: Express.Multer.File): Promise<{
        url: string;
        publicId: string;
        width: number;
        height: number;
    }>;
}
