import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { StorageEnum } from 'src/common/enums';
import { diskStorage, memoryStorage } from 'multer';
import { tmpdir } from 'os';
export const CloudFileUpload = ({
    storageApproach = StorageEnum.memory,
    validation = [],
    fileSize = 2,
}: {
    validation: string[];
    fileSize?: number;
    storageApproach?: StorageEnum;
}): MulterOptions => {
    return {
        storage:
            storageApproach === StorageEnum.memory
                ? memoryStorage()
                : diskStorage({
                    destination: tmpdir(),
                    filename: function (
                        req: Request,
                        file: Express.Multer.File,
                        callback,
                    ) {
                        callback(null, `${randomUUID()}_${file.originalname}`);
                    },
                }),

        fileFilter(req: Request, file: Express.Multer.File, callback: Function) {
            if (validation.includes(file.mimetype)) {
                return callback(null, true);
            }
            return callback(new BadRequestException('Invalid file format'));
        },

        limits: {
            fileSize: fileSize * 1024 * 1024,
        },
    };
};