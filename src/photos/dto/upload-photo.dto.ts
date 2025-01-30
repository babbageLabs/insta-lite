// import { Express } from 'express'



export class UploadPhotoDto {
    readonly file: Express.Multer.File;
}

export class PhotoResponseDto {
    id: string;
    filename: string;
    originalname: string;
    url: string;
    uploadedAt: Date;
}
