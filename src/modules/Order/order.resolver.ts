import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { OrderService } from "./order.service";
import { GetAllOrdersResponse } from "./entities/order.entity";
import { GetAllGraphQlDto } from "src/common/dtos";
import { UsePipes, ValidationPipe } from "@nestjs/common";
import { Auth, User } from "src/common/decorators";
import { RoleEnum } from "src/common";
import { type UserDocument } from "src/DB";

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Resolver()
export class OrderResolver {
  constructor(private readonly orderService: OrderService) { }
  
  @Auth([RoleEnum.admin, RoleEnum.superAdmin])
  @Query(() => GetAllOrdersResponse)
  async getAllOrders(
    @User() user: UserDocument,
    @Args("data", { nullable: true }) getAllGraphQlDto?: GetAllGraphQlDto) {
    const result = await this.orderService.getAll(getAllGraphQlDto, false);
    console.log({ user });
    return result;
  }
  
  @Query(() => String)
  sayHello(): string {
    return "Hello from GraphQl Nest Js";
  }
  @Mutation(() => String, { description: "update this order ✔️" })
  updateOrder(): string {
    return "Order 🎁";
  }
}
