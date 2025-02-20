import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AbstractRepository } from '../../common/abstract/abstract-repository';
import { User } from './user.entity';

@Injectable()
export class UserRepository extends AbstractRepository<User> {
    constructor(private readonly dataSource: DataSource) {
        super(User, dataSource.createEntityManager());
    }

    async getUserWithPassword(email: string): Promise<User | null> {
        const user = await this
            .createQueryBuilder('user')
            .where('user.email = :email', { email })
            .addSelect('user.password')
            .getOne()

        return user
    }
}