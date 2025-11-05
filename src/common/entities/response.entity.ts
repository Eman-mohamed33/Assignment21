export class GetAllResponse<T = any> {
  result: {
    docsCount?: number,
    pages?: number,
    currentPage?: number | string,
    limit?: number,
    result: T[],
  };
}
