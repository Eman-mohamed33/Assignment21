import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { BrandRepository, CategoryDocument, CategoryRepository, UserDocument } from "src/DB";
import { CategoryBodyDto, UpdateCategoryBodyDto } from "./Dto/category.dto";
import { FolderEnum, S3Service } from "src/common";
import { randomUUID } from "crypto";
import { Types } from "mongoose";
import { lean } from "src/DB/repository/db.repository";
import { GetAllDto } from "src/common/dtos";

@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryRepository: CategoryRepository,
        private readonly s3Service: S3Service,
        private readonly brandRepository: BrandRepository,
    ) { }
    async create(
        body: CategoryBodyDto,
        file: Express.Multer.File,
        user: UserDocument,
    ): Promise<CategoryDocument> {
        const checkDuplicated = await this.categoryRepository.findOne({
            filter: { name: body.name, paranoId: false }
        });
        if (checkDuplicated) {
            throw new ConflictException(checkDuplicated.deletedAt ? 'Duplicated with archived category' : 'Duplicated category Name');
        }

        const brands: Types.ObjectId[] = [...new Set(body.brands || [])];
        if (brands &&
            (await this.brandRepository.find({ filter: { _id: { $in: brands } } })).length != brands.length) {
            throw new NotFoundException("Some of mentioned brands are not exist");
        }
        const assetFolderId: string = randomUUID();
        const image: string = await this.s3Service.uploadFile({ file, path: `${FolderEnum.Category}/${assetFolderId}` });
        const [category] = await this.categoryRepository.create({
            data: [{
                ...body,
                image,
                assetFolderId,
                createdBy: user._id,
                brands: brands.map((brand) => { return Types.ObjectId.createFromHexString(brand as unknown as string) }),
            }]
        });
        if (!category) {
            await this.s3Service.deleteFile({ Key: image });
            throw new BadRequestException('fail to create this category resource');
        }
        return category;
    }

    async update(id: Types.ObjectId, body: UpdateCategoryBodyDto, user: UserDocument): Promise<CategoryDocument | lean<CategoryDocument>> {
        if (body.name && (await this.categoryRepository.findOne({
            filter: { name: body.name },
        }))) {
            throw new ConflictException('Duplicated category Name');
        }
    
        const brands: Types.ObjectId[] = [...new Set(body.brands || [])];
        if (brands &&
            (await this.brandRepository.find({ filter: { _id: { $in: brands } } })).length != brands.length) {
            throw new NotFoundException("Some of mentioned brands are not exist");
        }

        const removeBrand = body.brands ?? [];
        delete body.removeBrand;
        const category = await this.categoryRepository.findOneAndUpdate({
            filter: { _id: id },
            update: [
                {
                    $set: {
                             
                        ...body,
                        updatedBy: user._id,
                        brands: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$brands",
                                        (removeBrand || []).map((brand) => {
                                            return Types.ObjectId.createFromHexString(brand as unknown as string)
                                        }),
                                    ]
                                },
                                brands.map((brand) => {
                                    return Types.ObjectId.createFromHexString(brand as unknown as string)
                                }),
                            ]
                        }
                    }
                }
            ]
        });
        if (!category) {
            throw new NotFoundException('fail to find this brand');
        }
        return category;
    }

    async updateAttachment(id: Types.ObjectId, user: UserDocument, file: Express.Multer.File): Promise<CategoryDocument | lean<CategoryDocument>> {

        const category = await this.categoryRepository.findOne({
            filter: { _id: id },
        });

        if (!category) {
            throw new NotFoundException('fail to find this category');
        }
        const image: string = await this.s3Service.uploadFile({ file, path: `${FolderEnum.Category}/${category.assetFolderId}` });

        const upCategory = await this.categoryRepository.findOneAndUpdate({
            filter: { _id: id },
            update: {
                image,
                updatedBy: user._id,
            },
        });
        if (!upCategory) {
            await this.s3Service.deleteFile({ Key: image });
            throw new NotFoundException('fail to find this category');
        }
        await this.s3Service.deleteFile({ Key: category.image });
        return upCategory;
    }

    async freeze(id: Types.ObjectId, user: UserDocument): Promise<string> {
        const category = await this.categoryRepository.findOneAndUpdate({
            filter: { _id: id },
            update: {
                deletedAt: new Date(),
                $unset: { restoredAt: true },
                updatedBy: user._id
            }
        });
    
        if (!category) {
            throw new NotFoundException("fail to find matching result");
        }
        return 'Done';
    }
    
    async restore(id: Types.ObjectId, user: UserDocument): Promise<CategoryDocument | lean<CategoryDocument>> {
        const category = await this.categoryRepository.findOneAndUpdate({
            filter: { _id: id, paranoId: false, deletedAt: { $exists: true } },
            update: {
                restoredAt: new Date(),
                $unset: { deletedAt: 1 },
                updatedBy: user._id
            }
        });
    
        if (!category) {
            throw new NotFoundException("fail to find matching result");
        }
        return category;
    }
    
    async delete(id: Types.ObjectId, user: UserDocument) {
        const category = await this.categoryRepository.findOneAndDelete({
            filter: {
                _id: id,
                paranoId: false,
                deletedAt: { $exists: true },
                updatedBy: user._id
            },
        });
        await this.s3Service.deleteFile({ Key: category?.image });
        if (!category) {
            throw new NotFoundException("fail to find matching result");
        }
        return 'Done';
    }
    
    async getAll(query: GetAllDto, archived: boolean = false): Promise<{
        docsCount?: number | undefined,
        pages?: number | undefined,
        currentPage?: number | string | undefined,
        limit?: number | undefined,
        result: CategoryDocument[] | [] | lean<CategoryDocument>[],
    }> {
        const { page, size, search } = query;
        const categories = await this.categoryRepository.paginate({
            filter: {
                ...(search ? {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { slug: { $regex: search, $options: "i" } },
                        { description: { $regex: search, $options: "i" } }
                    ]
                } : {}),
                ...(archived ? { paranoId: false, deletedAt: { $exists: true } } : {}),
            },
            page,
            size,
        });
    
        return categories;
    }
    
    async get(id: Types.ObjectId, archived: boolean = false): Promise<CategoryDocument | lean<CategoryDocument>> {
        const category = await this.categoryRepository.findOne({
            filter: {
                _id: id,
                ...(archived ? { paranoId: false, deletedAt: { $exists: true } } : {}),
            },
            options: {
                populate: [{ path: "products" }],
            }
        });
        if (!category) {
            throw new NotFoundException('fail to find matching result');
        }
    
        return category;
    }
}
