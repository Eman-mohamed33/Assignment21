import { IBrand } from "src/common";

export class BrandResponse {
  brand: IBrand;
}

export class GetAllResponse {
  brands: {
    docsCount?: number,
    pages?: number,
    currentPage?: number | string,
    limit?: number,
    result: IBrand[],
  };
}
