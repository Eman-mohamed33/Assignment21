import { Body, Controller, Param, Patch, Post, Req, UsePipes, ValidationPipe } from "@nestjs/common";
import { OrderService } from "./order.service";
import { Auth, User } from "src/common/decorators";
import { RoleEnum, successResponse } from "src/common";
import { type UserDocument } from "src/DB";
import { IResponse } from "src/common/interfaces/response.interface";
import { OrderResponse } from "./entities/order.entity";
import { OrderBodyDto, OrderParamDto } from "./Dto/order.dto";
import type { Request } from "express";

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller("order")
export class OrderController {
    constructor(private readonly orderService: OrderService) { }
    
    @Auth([RoleEnum.user])
    @Post()
    async createOrder(
        @User() user: UserDocument,
        @Body() body: OrderBodyDto
    ): Promise<IResponse<OrderResponse>> {
        const order = await this.orderService.create(user, body);
        return successResponse<OrderResponse>({ data: { order } });
    }

    @Auth([RoleEnum.user])
    @Post(":orderId")
    async checkout(
        @User() user: UserDocument,
        @Param() param: OrderParamDto,
    ): Promise<IResponse> {
        const session = await this.orderService.checkout(param.orderId, user);
        return successResponse({ data: { session } });
    }

    @Auth([RoleEnum.admin, RoleEnum.superAdmin])
    @Patch(":orderId")
    async cancelOrder(
        @User() user: UserDocument,
        @Param() param: OrderParamDto,
    ): Promise<IResponse<OrderResponse>> {
        const order = await this.orderService.cancel(param.orderId, user);
        return successResponse<OrderResponse>({ data: { order } });
    }
   
    @Post("webhook")
    async webhook(
        @Req() req: Request,
    ): Promise<IResponse> {
       await this.orderService.webhook(req);
        return successResponse();
    }
}