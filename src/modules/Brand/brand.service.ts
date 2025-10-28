import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BrandRepository } from "src/DB";
import type { BrandDocument, UserDocument } from "src/DB";
import { BrandBodyDto, GetAllDto, UpdateBodyDto } from "./Dto/brand.dto";
import { FolderEnum, S3Service } from "src/common";
import { Types } from "mongoose";
import { lean } from "src/DB/repository/db.repository";

@Injectable()
export class BrandService {
    constructor(private readonly brandRepository: BrandRepository,
        private readonly s3Service: S3Service
    ) { }
    
    async create(
        body: BrandBodyDto,
        file: Express.Multer.File,
        user: UserDocument,
    ): Promise<BrandDocument> {
        const { name, slogan } = body;
        const checkDuplicated = await this.brandRepository.findOne({
            filter: { name, paranoId: false }
        });
        if (checkDuplicated) {
            throw new ConflictException(checkDuplicated.deletedAt ? 'Duplicated with archived brand' : 'Duplicated Brand Name');
        }
        const image: string = await this.s3Service.uploadFile({ file, path: 'Brand' });
        const [Brand] = await this.brandRepository.create({
            data: [{
                name,
                slogan,
                image,
                createdBy: user._id,
            }]
        });
        if (!Brand) {
            await this.s3Service.deleteFile({ Key: image });
            throw new BadRequestException('fail to create this brand resource');
        }
        return Brand;
    }

    async update(id: Types.ObjectId, body: UpdateBodyDto, user: UserDocument): Promise<BrandDocument | lean<BrandDocument>> {
        if (body.name && (await this.brandRepository.findOne({
            filter: { name: body.name },
        }))) {
            throw new ConflictException('Duplicated Brand Name');
        }

        const brand = await this.brandRepository.findOneAndUpdate({
            filter: { _id: id },
            update: {
                ...body,
                updatedBy: user._id,
            }
        });
        if (!brand) {
            throw new NotFoundException('fail to find this brand');
        }
        return brand;
    }

    async updateAttachment(id: Types.ObjectId, user: UserDocument, file: Express.Multer.File): Promise<BrandDocument | lean<BrandDocument>> {
        const image: string = await this.s3Service.uploadFile({ file, path: FolderEnum.Brand });
        const brand = await this.brandRepository.findOneAndUpdate({
            filter: { _id: id },
            update: {
                image,
                updatedBy: user._id,
            },
            options: {
                new: false,
            }
        });
        if (!brand) {
            await this.s3Service.deleteFile({ Key: image });
            throw new NotFoundException('fail to find this brand');
        }
        await this.s3Service.deleteFile({ Key: brand.image });
        brand.image = image;
        return brand;
    }

    async freeze(id: Types.ObjectId, user: UserDocument): Promise<string> {
        const brand = await this.brandRepository.findOneAndUpdate({
            filter: { _id: id },
            update: {
                deletedAt: new Date(),
                $unset: { restoredAt: true },
                updatedBy: user._id
            }
        });

        if (!brand) {
            throw new NotFoundException("fail to find matching result");
        }
        return 'Done';
    }

    async restore(id: Types.ObjectId, user: UserDocument): Promise<BrandDocument | lean<BrandDocument>> {
        const brand = await this.brandRepository.findOneAndUpdate({
            filter: { _id: id, paranoId: false, deletedAt: { $exists: true } },
            update: {
                restoredAt: new Date(),
                $unset: { deletedAt: 1 },
                updatedBy: user._id
            }
        });

        if (!brand) {
            throw new NotFoundException("fail to find matching result");
        }
        return brand;
    }

    async delete(id: Types.ObjectId, user: UserDocument) {
        const brand = await this.brandRepository.findOneAndDelete({
            filter: {
                _id: id,
                paranoId: false,
                deletedAt: { $exists: true },
                updatedBy: user._id
            },
        });
        await this.s3Service.deleteFile({ Key: brand?.image });
        if (!brand) {
            throw new NotFoundException("fail to find matching result");
        }
        return 'Done';
    }

    async getAll(query: GetAllDto, archived: boolean = false): Promise<{
        docsCount?: number | undefined,
        pages?: number | undefined,
        currentPage?: number | string | undefined,
        limit?: number | undefined,
        result: BrandDocument[] | [] | lean<BrandDocument>[],
    }> {
        const { page, size, search } = query;
        const brands = await this.brandRepository.paginate({
            filter: {
                ...(search ? {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { slug: { $regex: search, $options: "i" } },
                        { slogan: { $regex: search, $options: "i" } }
                    ]
                } : {}),
                ...(archived ? { paranoId: false, deletedAt: { $exists: true } } : {}),
            },
            page,
            size
        });

        return brands;
    }

    async get(id: Types.ObjectId, archived: boolean = false): Promise<BrandDocument | lean<BrandDocument>> {
        const brand = await this.brandRepository.findOne({
            filter: {
                _id: id,
                ...(archived ? { paranoId: false, deletedAt: { $exists: true } } : {}),
            },
        })
        if (!brand) {
            throw new NotFoundException('fail to find matching result');
        }

        return brand;
    }

}