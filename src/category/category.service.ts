import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryService {
  constructor() {}

  categories(): { id: number; name: string } {
    return { id: 16, name: 'Sports' };
  }
}
