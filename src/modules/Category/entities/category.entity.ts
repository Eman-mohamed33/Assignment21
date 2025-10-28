import { ICategory } from "src/common";

export class CategoryResponse {
  category: ICategory;
}

export class GetAllCategoriesResponse {
  categories: {
    docsCount?: number,
    pages?: number,
    currentPage?: number | string,
    limit?: number,
    result: ICategory[],
  };
}
