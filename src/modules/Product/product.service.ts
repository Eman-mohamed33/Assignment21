import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { FolderEnum, S3Service, StorageEnum } from "src/common";
import { BrandRepository, CategoryRepository, ProductDocument, ProductRepository, UserDocument } from "src/DB";
import { ProductBodyDto } from "./Dto/product.dto";
import { randomUUID } from "crypto";

@Injectable()
export class ProductService {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly brandRepository: BrandRepository,
        private readonly categoryRepository: CategoryRepository,
        private readonly s3Service: S3Service,
    ) { }
    
    async create(user: UserDocument, files: Express.Multer.File[], productBodyDto: ProductBodyDto): Promise<ProductDocument> {
        const { name, description, discountPercent, originalPrice, stock } = productBodyDto;

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
            path: `${FolderEnum.Category}/${FolderEnum.Brand}/${FolderEnum.Product}/${assetFolderId}`,
        })
        const [product] = await this.productRepository.create({
            data: [{
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
            throw new BadRequestException("fail to create new product");
        }
        return product;
    }

}
