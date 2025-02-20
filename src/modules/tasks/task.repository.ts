import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { AbstractRepository } from '../../common/abstract/abstract-repository'
import { Task } from './task.entity'

@Injectable()
export class TaskRepository extends AbstractRepository<Task> {
    constructor(private readonly dataSource: DataSource) {
        super(Task, dataSource.createEntityManager())
    }
}
