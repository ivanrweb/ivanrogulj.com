import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CategoryEntity } from '../entity/category.entity';

@Injectable()
export class CategoryRepository extends Repository<CategoryEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CategoryEntity, dataSource.createEntityManager());
  }

  public async findByUserId(userId: string): Promise<CategoryEntity[]> {
    return this.find({ where: { userId }, order: { createdAt: 'ASC' } });
  }
}
