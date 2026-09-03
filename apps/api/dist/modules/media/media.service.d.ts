import { ConfigService } from "@nestjs/config";
import { UploadApiResponse } from "cloudinary";
export declare class MediaService {
    private config;
    constructor(config: ConfigService);
    upload(file: Express.Multer.File, folder?: string): Promise<UploadApiResponse>;
    delete(publicId: string): Promise<any>;
}
