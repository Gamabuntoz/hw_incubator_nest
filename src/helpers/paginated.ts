export class Paginated<T> {
  public pagesCount = 10;
  public page: number;
  public pageSize = 1;
  public totalCount: number;
  public items: T;

  static getPaginated<T>(data: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    items: T;
  }): Paginated<T> {
    const pageSize = data.pageSize ? data.pageSize : 10;
    return {
      pagesCount: Math.ceil(data.totalCount / pageSize),
      page: data.pageNumber ? data.pageNumber : 1,
      pageSize: pageSize,
      totalCount: data.totalCount,
      items: data.items,
    };
  }
}

// TODO: split query and command repository
// TODO: create tests for all endpoints
// TODO: add cascade delete or update to dependency blogs or posts or comments
