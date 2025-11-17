import { SetMetadata } from "@nestjs/common";

export const TTLName = "TTLName";
export const TTL = (expires: number) => {
  return SetMetadata(TTLName, expires);
};
