import { Body, Controller, Delete, Get, Patch, Post, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { CartService } from "./cart.service";
import { Auth, User } from "src/common/decorators";
import { RoleEnum, successResponse } from "src/common";
import {type UserDocument } from "src/DB";
import { CartBodyDto, removeItemsBodyDto } from "./Dto/cart.dto";
import { CartResponse } from "./entities/cart.entity";
import { type Response } from "express";
import { IResponse } from "src/common/interfaces/response.interface";

// @Auth([RoleEnum.user])
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller("cart")
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Auth([RoleEnum.user])
    @Post()
    async addOrUpdateCart(
        @User() user: UserDocument,
        @Body() body: CartBodyDto,
        @Res() res:Response
    ) {
        const { status, cart } = await this.cartService.addOrUpdate(user, body);
        res.status(status);
        return successResponse<CartResponse>({ status, data: { cart } });
    }

    @Auth([RoleEnum.user])
    @Patch("remove-items-from-cart")
    async removeItemsFromCart(
        @User() user: UserDocument,
        @Body() body: removeItemsBodyDto,
    ): Promise<IResponse<CartResponse>> {
        const cart = await this.cartService.removeItems(user, body);
        return successResponse<CartResponse>({ data: { cart } });
    }

    @Auth([RoleEnum.user])
    @Delete()
    async removeCart(
        @User() user: UserDocument,
    ): Promise<IResponse> {
        await this.cartService.remove(user);
        return successResponse();
    }

    @Auth([RoleEnum.user])
    @Get()
    async getCart(
        @User() user: UserDocument,
    ): Promise<IResponse<CartResponse>> {
        const cart = await this.cartService.get(user);
        return successResponse<CartResponse>({ data: { cart } });
    }
}
