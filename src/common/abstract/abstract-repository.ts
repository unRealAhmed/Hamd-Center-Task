import { Injectable } from '@nestjs/common'
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsSelect,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { AbstractEntity } from './abstract-entity'

@Injectable()
export class AbstractRepository<
  T extends AbstractEntity,
> extends Repository<T> {
  async findAllWithPagination(
    conditions: FindManyOptions<T>['where'] = {},
    relations: string[] = [],
    skip: number,
    limit: number,
    sortBy: string,
    order: 'ASC' | 'DESC',
    select?: unknown | undefined,
  ): Promise<{ items: T[]; totalCount: number }> {
    const [items, totalCount] = await this.findAndCount({
      where: conditions,
      relations,
      skip,
      take: limit,
      order: { [sortBy]: order } as FindOptionsOrder<T>,
      select: select as unknown as FindOptionsSelect<T>,
    });

    return { items, totalCount };
  }


  async updateBy(
    conditions: FindOptionsWhere<T>,
    updateDto: QueryDeepPartialEntity<T>,
  ): Promise<{ updatedEntity: T | null; updateResult: UpdateResult }> {
    const updateResult: UpdateResult = await this.update(conditions, updateDto)
    const findOptions: FindManyOptions<T> = {
      where: conditions,
    }
    const updatedEntity: T | null = await this.findOne(findOptions)
    return { updatedEntity, updateResult }
  }
}
