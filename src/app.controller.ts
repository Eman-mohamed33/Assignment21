import { BadRequestException, Controller, Get, Param, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { S3Service } from './common';
import type { Response } from 'express';
import { pipeline } from "node:stream";
import { promisify } from "node:util";
const createS3WriteStream = promisify(pipeline);

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly s3Service: S3Service
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/upload/*path')
  async getAsset(
    @Query() query: { download?: 'true' | 'false'; filename?: string },
    @Param() param: { path: string[] },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { download, filename } = query;
    const { path } = param;
        if (!path?.length) {
            throw new BadRequestException("")
        }

        const key = path?.join("/");
        const s3Response = await this.s3Service.getFile({ Key: key });
        if (!s3Response?.Body) {
            throw new BadRequestException("Fail to fetch this resource");
        }

        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader(
            "Content-Type",
            s3Response.ContentType || "application/octet-stream");

    // for-download
    if (download === 'true') {
      res.setHeader("Content-Disposition", `attachments; filename="${filename || key?.split("/").pop()}"`);

    }
    return await createS3WriteStream(s3Response.Body as NodeJS.ReadableStream, res);
  }
 
   @Get('/upload/signed/*path')
  async getAssetByPreSignedUrl(
    @Query() query: { download?: true | false; filename?: string },
    @Param() param: { path: string[] },
  ) {
    const { download, filename } = query;
    const { path } = param;
        const key = path?.join("/");
     const url = await this.s3Service.createPreSignedGetUrl({
       filename,
       download,
       Key: key
     });
     return { message: 'Done', data: { url } };
  }

}
