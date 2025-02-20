import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '../users/user.module'
import { TaskController } from './task.controller'
import { Task } from './task.entity'
import { TaskRepository } from './task.repository'
import { TaskService } from './task.service'

@Module({
    imports: [TypeOrmModule.forFeature([Task]), UserModule],
    controllers: [TaskController],
    providers: [TaskService, TaskRepository],
    exports: [TaskService, TaskRepository],
})
export class TaskModule { }
