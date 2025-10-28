import { RoleEnum } from "src/common";

export const productEndPoint = {
  create: [RoleEnum.superAdmin, RoleEnum.admin],
};
