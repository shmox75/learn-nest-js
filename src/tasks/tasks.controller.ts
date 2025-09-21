import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { type ITask } from './task.model';
import { CreateTaskDto } from './create-task.dto';
import { FindOneParams } from './find-one-params';
import { UpdateTaskStatusDto } from './update-task-status.dto';
import { UpdateTaskDto } from './update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';

@Controller('tasks')
export class TasksController {
    constructor( 
        private readonly tasksService: TasksService 
    ) {}

    @Get()
    public findAll(): ITask[] {
        return this.tasksService.findAll();
    }

    @Get('/:id')
    findOne(@Param() params: FindOneParams): ITask {
        return this.findOneOrFail(params.id);
    }

    @Post()
    public create( @Body() createTaskDto: CreateTaskDto ): ITask {
        return this.tasksService.create( createTaskDto );
    }

    /*@Patch('/:id/status')
    public updateTaskStatus(
        @Param() params: FindOneParams,
        @Body() body: UpdateTaskStatusDto
    ): ITask {
        const task = this.findOneOrFail(params.id);
        task.status = body.status;
        
        return task;
    }*/

    @Patch('/:id')
    public updateTaskStatus(
        @Param() params: FindOneParams,
        @Body() updateTaskDto: UpdateTaskDto
    ): ITask {
        try {
            const task = this.findOneOrFail(params.id);
            return this.tasksService.updateTask(task, updateTaskDto);
        }catch (error) {
            if(error instanceof WrongTaskStatusException) {
                throw new BadRequestException([error.message]);
            }

            throw error;
        }
        
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteTask(@Param() params: FindOneParams): void {
        const task = this.findOneOrFail(params.id);
        this.tasksService.deleteTask(task);
    }

    private findOneOrFail( id: string ): ITask {
        const task = this.tasksService.findOne(id);

        if(!task){
            throw new NotFoundException();
        }

        return task;
    }
}
