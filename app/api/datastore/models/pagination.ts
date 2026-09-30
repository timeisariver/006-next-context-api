export interface PageInfoParams {
  page: number;
  limit: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export class PageInfo {
  _raw: PageInfoParams;

  constructor(params: PageInfoParams) {
    this._raw = params;
  }

  paginate(list: any[]) {
    return list.slice((this.page - 1) * this.limit, this.page * this.limit);
  }

  get serialize() {
    return { 
      page: this.page,
      limit: this.limit,
      totalCount: this.totalCount,
      hasNext: this.hasNext,
      hasPrevious: this.hasPreviouis
    }
  }

  get page() {
    return Number(this._raw.page);
  }

  get limit() {
    return Number(this._raw.limit);
  }

  get totalCount() {
    return Number(this._raw.totalCount);
  }

  get hasNext() {
    return this.page * this.limit < this.totalCount;
  }

  get hasPreviouis() {
    return this.page > 1;
  }
}

