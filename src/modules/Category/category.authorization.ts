import { RoleEnum } from "src/common";

export const categoryEndPoint = {
  create: [RoleEnum.superAdmin, RoleEnum.admin],
};
