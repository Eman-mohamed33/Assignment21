import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { BadRequestException } from "@nestjs/common";
import { StorageEnum } from "../enums";
import { randomUUID } from "crypto";
import { createReadStream } from "fs";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service {
    private s3Client: S3Client;
    constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION as string,
            credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
            }
        });
    }


 uploadFile = async ({
    storageApproach = StorageEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = "private",
    path = "general",
    file
}: {
    storageApproach?: StorageEnum,
    Bucket?: string,
    ACL?: ObjectCannedACL,
    path?: string,
    file: Express.Multer.File
}):Promise<string> => {
    const command = new PutObjectCommand({
        Bucket,
        ACL,
        Key: `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
        Body: storageApproach === StorageEnum.memory ? file.buffer : createReadStream(file.path),
        ContentType: file.mimetype
    });

    await this.s3Client.send(command);
    if (!command?.input?.Key) {
        throw new BadRequestException("Fail to generate upload key");
    }

    return command.input.Key;
}

  uploadLargeFile = async ({
    storageApproach = StorageEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = "private",
    path = "general",
    file
}: {
    storageApproach?: StorageEnum,
    Bucket?: string,
    ACL?: ObjectCannedACL,
    path?: string,
    file: Express.Multer.File
}): Promise<string> => {
    const upload = new Upload({
        client: this.s3Client,
        params: {
            Bucket,
            ACL,
            Key: `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}`,
            Body: storageApproach === StorageEnum.memory ? file.buffer : createReadStream(file.path),
            ContentType: file.mimetype
        }
    });

    upload.on('httpUploadProgress', (progress) => {
      console.log(`Upload file progress is ::: ${progress}`);
    });

    const { Key } = await upload.done();
     if (!Key) {
      throw new BadRequestException('Fail to generate upload key');
    }
    return Key;
}

  uploadFilesOrLargeFiles = async ({
    storageApproach = StorageEnum.memory,
    Bucket = process.env.AWS_BUCKET_NAME as string,
    ACL = 'private',
    path = 'general',
    files,
    useLarge
}: {
    storageApproach?: StorageEnum,
    Bucket?: string,
    ACL?: ObjectCannedACL,
    path?: string,
    files: Express.Multer.File[],
    useLarge?: boolean
}):Promise<string[]> => {
   
    let urls: string[] = [];

    if (useLarge) {
        urls = await Promise.all(files.map((file) => {
            return this.uploadLargeFile({
                storageApproach,
                Bucket,
                ACL,
                path,
                file
            });
        }));
    } else {
        urls = await Promise.all(files.map((file) => {
            return this.uploadFile({
                storageApproach,
                Bucket,
                ACL,
                path,
                file
            });
        })
        );
    }

        return urls;
}

  preUploadSignedUrl = async ({ 
    Bucket = process.env.AWS_BUCKET_NAME as string,
    path = 'general',
    originalname,
    ContentType,
    ExpiresIn = 120
}: {
    Bucket?: string,
    path?: string,
        originalname: string,
        ContentType: string,
   ExpiresIn?:number
}): Promise<{ url: string, key: string }> => {
    
    const command = new PutObjectCommand({
        Bucket,
        Key: `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_pre_${originalname}`,
        ContentType
    });
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: ExpiresIn });
    
    if (!url || !command?.input?.Key) {
        throw new BadRequestException("Fail to generate preSignedUrl");
    }
    return { url, key: command.input.Key };
}
 
  getFile = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key
}: {
    Bucket?: string,
    Key: string
}) => {
    const command = new GetObjectCommand({
        Bucket,
        Key
    });
    return this.s3Client.send(command);
}

  createPreSignedGetUrl = async({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key,
    ExpiresIn = 120,
      download = false,
      filename = '',
}: {
    Bucket?: string,
    Key?: string,
    ExpiresIn?: number,
          download?: boolean,
          filename?: string,
}): Promise<string > => {
    
    const command = new GetObjectCommand({
        Bucket,
        Key,
        ResponseContentDisposition: download ? `attachments; filename="${filename || Key?.split("/").pop()}"` : undefined
    });
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: ExpiresIn });
    
    if (!url ) {
        throw new BadRequestException("Fail to generate preSignedUrl");
    }
    return url;
}

  deleteFile = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key
}: {
    Bucket?: string,
    Key?: string
}): Promise<DeleteObjectCommandOutput> => {
    const command = new DeleteObjectCommand({
        Bucket,
        Key
    });
    return await this.s3Client.send(command);
}

  deleteFiles = async ({
        Bucket = process.env.AWS_BUCKET_NAME as string,
        urls = [],
        Quiet = false
    }: {
        Bucket?: string,
        urls: string[],
        Quiet?: boolean
    
    }): Promise<DeleteObjectsCommandOutput> => {
    
        const Objects = urls.map(url => {
            return { Key: url };
        });
        const command = new DeleteObjectsCommand({
            Bucket,
            Delete: {
                Objects,
                Quiet
            }
        });
        return await this.s3Client.send(command);
    }

   listDirectoryFiles = async ({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    path = "general"
}: {
    Bucket?: string,
    path: string
    
}): Promise<ListObjectsV2CommandOutput> => {
    const command = new ListObjectsV2Command({
        Bucket,
        Prefix: `${process.env.APPLICATION_NAME}/${path}`
    });
    return this.s3Client.send(command);
    }
    
  deleteFolderByPrefix = async({
    Bucket = process.env.AWS_BUCKET_NAME as string,
    path="general",
    Quiet = false
}: {
    Bucket?: string,
    path: string,
    Quiet?: boolean
    
      }): Promise<DeleteObjectsCommandOutput> => {
    const files = await this.listDirectoryFiles({ Bucket,path});
        if (!files.Contents?.length) {
      throw new BadRequestException("Empty Directory");
        }
    const urls: string[] = files.Contents.map((file) => {
        return file.Key;
    }) as string[];
    return await this.deleteFiles({ Bucket, urls, Quiet });
}
}