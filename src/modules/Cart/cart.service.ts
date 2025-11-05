import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CartDocument, CartRepository, ProductRepository,type UserDocument } from "src/DB";
import { CartBodyDto, removeItemsBodyDto } from "./Dto/cart.dto";
import { lean } from "src/DB/repository/db.repository";

@Injectable()
export class CartService {
    constructor(private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository,
    ) { }
    
    async addOrUpdate(user: UserDocument, body: CartBodyDto):
        Promise<{ status: number, cart: CartDocument | lean<CartDocument> }> {
        const product = await this.productRepository.findOne({
            filter: {
                _id: body.productId,
                stock: { $gte: body.quantity },
            }
        });
        if (!product) {
            throw new NotFoundException("fail to find this product or product is out of stock")
        }

        const cart = await this.cartRepository.findOne({
            filter: {
                createdBy: user._id
            }
        });
        if (!cart) {
            const [nCart] = await this.cartRepository.create({
                data: [{
                    createdBy: user._id,
                    products: [{
                        productId: product._id,
                        quantity: body.quantity
                    }]
                }]
            });
            if (!nCart) {
                throw new BadRequestException("fail to create new cart");
            }
            return { status: 201, cart: nCart };
        }

        const checkProductInCart = cart.products.find((product) => {
            return product.productId === body.productId;
        });

        if (checkProductInCart) {
            checkProductInCart.quantity = body.quantity;
        } else {
            cart.products.push({ productId: product._id, quantity: body.quantity });
        }
        await cart.save();
        return { status: 200, cart };
    }

    async removeItems(user: UserDocument, body: removeItemsBodyDto):
        Promise<CartDocument | lean<CartDocument>> {
        const cart = await this.cartRepository.findOneAndUpdate({
            filter: {
                createdBy: user._id
            },
            update: {
                $pull: { products: { _id: { $in: body.productIds } } }
            }
        });
        if (!cart) {
            throw new NotFoundException("fail to find user cart");
        }
        return cart;
    }

    async remove(user: UserDocument):
        Promise<string> {
       
        const cart = await this.cartRepository.deleteOne({
            filter: {
                createdBy: user._id
            }
        });
        if (!cart.deletedCount) {
            throw new NotFoundException("fail to find user cart")
        }
        return "Done";
    }

    async get(user: UserDocument):
        Promise<CartDocument | lean<CartDocument>> {
        const cart = await this.cartRepository.findOne({
            filter: {
                createdBy: user._id
            },
            options: {
                populate: [
                    {
                        path: "products.productId"
                    }
                ]
            }
        });
        if (!cart) {
            throw new NotFoundException("fail to find user cart");
        }
        return cart;
    }
}