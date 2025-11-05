import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { FolderEnum, IProductVariance, S3Service, StorageEnum } from "src/common";
import { BrandRepository, CategoryDocument, CategoryRepository, ProductDocument, ProductRepository, type UserDocument, UserRepository } from "src/DB";
import { ProductBodyDto, UpdateProductAttachmentsBodyDto, UpdateProductBodyDto } from "./Dto/product.dto";
import { randomUUID } from "crypto";
import { lean } from "src/DB/repository/db.repository";
import { Types } from "mongoose";
import { GetAllDto } from "src/common/dtos";

@Injectable()
export class ProductService {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly brandRepository: BrandRepository,
        private readonly categoryRepository: CategoryRepository,
        private readonly s3Service: S3Service,
        private readonly userRepository:UserRepository
    ) { }
    
    async create(user: UserDocument, files: Express.Multer.File[], productBodyDto: ProductBodyDto): Promise<ProductDocument> {
        const { name, description, discountPercent, originalPrice, stock, productVariance } = productBodyDto;

        const brand = await this.brandRepository.findOne({
            filter: {
                _id: productBodyDto.brand,
            }
        });

        if (!brand) {
            throw new NotFoundException("Fail to find this brand");
        }

        const category = await this.categoryRepository.findOne({
            filter: {
                _id: productBodyDto.category,
            }
        });

        if (!category) {
            throw new NotFoundException("Fail to find this category");
        }

        const assetFolderId = randomUUID();
        const images: string[] = await this.s3Service.uploadFilesOrLargeFiles({
            storageApproach: StorageEnum.disk,
            files,
            path: `${FolderEnum.Category}/${productBodyDto.category.toString()}/${FolderEnum.Product}/${assetFolderId}`,
        });
        let ProductVariance: IProductVariance[] = productVariance ?? [];
        if (productVariance?.length) {
            ProductVariance = productVariance.map((pV) =>( {
                color: pV.color,
                price: pV.price,
                stock: pV.stock,
                size: pV.size,
                sku: pV.sku,
            }))
        }
        const [product] = await this.productRepository.create({
            data: [{
                productVariance: ProductVariance, 
                name,
                description,
                discountPercent,
                originalPrice,
                stock,
                category: category._id,
                brand: brand._id,
                createdBy: user._id,
                assetFolderId,
                images,
                salePrice: originalPrice - ((originalPrice * discountPercent) / 100),
            }]
        });

        if (!product) {
            await this.s3Service.deleteFiles({ urls: images });
            throw new BadRequestException("fail to create new product");
        }
        return product;
    }

    async update(body: UpdateProductBodyDto, user: UserDocument, id: Types.ObjectId): Promise<ProductDocument | lean<ProductDocument>> {
        const product = await this.productRepository.findOne({
            filter: {
                _id: id
            }
        });
        if (!product) {
            throw new NotFoundException("fail to find this product");
        }
        if (body.brand) {
            const brand = await this.brandRepository.findOne({
                filter: {
                    _id: body.brand,
                }
             
            });

            if (!brand) {
                throw new NotFoundException("Fail to find this brand");
            }
            body.brand = brand._id;
        }

        if (body.category) {
            const category = await this.categoryRepository.findOne({
                filter: {
                    _id: body.category,
                }
            });

            if (!category) {
                throw new NotFoundException("Fail to find this category");
            }
            body.category = category._id;
        }

        let salePrice = product.salePrice;
        if (body.originalPrice || body.discountPercent) {
            const originalPrice = body.originalPrice ?? product.originalPrice;
            const discountPercent = body.discountPercent ?? product.discountPercent;
            salePrice = (originalPrice - (originalPrice * (discountPercent / 100))) > 0 ?
                originalPrice - (originalPrice * (discountPercent / 100)) : 1;
        }

        if (body.productVariance?.length) {
            await this.productRepository.findOneAndUpdate({
                filter: { _id: id },
                update: {
                    $push: {
                        productVariance: { $each: body.productVariance },
                    },
                },
            });
        }
        
        const updatedProduct = await this.productRepository.findOneAndUpdate({
            filter: { _id: id },
            update: {
                ...body,
                updatedBy: user._id,
                salePrice,
            }
        });

        if (!updatedProduct) {
            throw new BadRequestException("fail to create new product");
        }
        return updatedProduct;
    }

    async updateAttachment(
        user: UserDocument,
        id: Types.ObjectId,
        body: UpdateProductAttachmentsBodyDto,
        files?: Express.Multer.File[],
    ): Promise<ProductDocument | lean<ProductDocument>> {
    
        const product = await this.productRepository.findOne({
            filter: {
                _id: id
            },
            options: {
                populate: [{ path: "category" }],
            }
        });

        if (!product) {
            throw new NotFoundException("fail to find this product");
        }
        let attachments: string[] = [];
        if (files?.length) {
            attachments = await this.s3Service.uploadFilesOrLargeFiles({
                storageApproach: StorageEnum.disk,
                files,
                path: `${FolderEnum.Category}/${(product.category as unknown as CategoryDocument).assetFolderId}/${FolderEnum.Product}/${product.assetFolderId}`
            });
        }

        const removedAttachments = [...new Set(body.removedAttachments ?? [])];
    
        
        const updatedProduct = await this.productRepository.findOneAndUpdate({
            filter: { _id: id },
            update: [
                {
                    $set: {
                         
                        updatedBy: user._id,
                        images: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        "$images",
                                        removedAttachments,
                                    ]
                                },
                                attachments,
                            ]
                        },
            
                    }
                }
            ]
        });

        if (!updatedProduct) {
            await this.s3Service.deleteFiles({ urls: attachments });
            throw new BadRequestException("fail to create new product");
        }
        await this.s3Service.deleteFiles({ urls: removedAttachments });
        return updatedProduct;
    }

    async freeze(id: Types.ObjectId, user: UserDocument): Promise<string> {
        const product = await this.productRepository.findOneAndUpdate({
            filter: { _id: id },
            update: {
                deletedAt: new Date(),
                $unset: { restoredAt: true },
                updatedBy: user._id
            }
        });
        
        if (!product) {
            throw new NotFoundException("fail to find matching result");
        }
        return 'Done';
    }
        
    async restore(id: Types.ObjectId, user: UserDocument): Promise<ProductDocument | lean<ProductDocument>> {
        const product = await this.productRepository.findOneAndUpdate({
            filter: { _id: id, paranoId: false, deletedAt: { $exists: true } },
            update: {
                restoredAt: new Date(),
                $unset: { deletedAt: 1 },
                updatedBy: user._id
            }
        });
        
        if (!product) {
            throw new NotFoundException("fail to find matching result");
        }
        return product;
    }
        
    async delete(id: Types.ObjectId, user: UserDocument) {
        const product = await this.productRepository.findOneAndDelete({
            filter: {
                _id: id,
                paranoId: false,
                deletedAt: { $exists: true },
                updatedBy: user._id
            },
        });
        if (!product) {
            throw new NotFoundException("fail to find matching result");
        }
        await this.s3Service.deleteFiles({ urls: product.images });

        return 'Done'
    }

        
    async getAll(query: GetAllDto, archived: boolean = false): Promise<{
        docsCount?: number | undefined,
        pages?: number | undefined,
        currentPage?: number | string | undefined,
        limit?: number | undefined,
        result: ProductDocument[] | [] | lean<ProductDocument>[],
    }> {
        const { page, size, search } = query;
        const products = await this.productRepository.paginate({
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
            size
        });
        
        return products;
    }
        
    async get(id: Types.ObjectId, archived: boolean = false): Promise<ProductDocument | lean<ProductDocument>> {
        const product = await this.productRepository.findOne({
            filter: {
                _id: id,
                ...(archived ? { paranoId: false, deletedAt: { $exists: true } } : {}),
            },
        });
        if (!product) {
            throw new NotFoundException('fail to find matching result');
        }
        
        return product;
    }

    async addToWishlist(id: Types.ObjectId, user: UserDocument): Promise<ProductDocument | lean<ProductDocument>> {
        const product = await this.productRepository.findOne({
            filter: {
                _id: id,
            },
        })
        if (!product) {
            throw new NotFoundException('fail to find matching result');
        }
        
        await this.userRepository.findOneAndUpdate({
            filter: {
                _id: user._id
            },
            update: {
                $addToSet: {
                    wishlist: id
                }
            }
        });
        return product;
    }

    async removeFromWishlist(id: Types.ObjectId, user: UserDocument): Promise<string> {
        
        await this.userRepository.updateOne({
            filter: {
                _id: user._id
            },
            update: {
                $pull: {
                    wishlist: Types.ObjectId.createFromHexString(id as unknown as string),
                }
            }
        });
        
        return "Done";
    }
}
