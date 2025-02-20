const fs = require('fs');
const path = require('path');

// Configuration object
const DEFAULT_CONFIG = {
  srcPath: 'src/modules',
  abstractPaths: {
    entity: '../../common/abstract/entities/abstract-entity',
    repository: '../../common/abstract/repositories/abstract-repository',
    service: '../../common/abstract/services/abstract.service',
  },
};

// Utility functions
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function validateModuleName(name) {
  const validNameRegex = /^[a-z][a-z0-9-]*$/;
  if (!validNameRegex.test(name)) {
    throw new Error(
      'Invalid module name. Use lowercase letters, numbers, and hyphens. Must start with a letter.',
    );
  }
}

function generateCreateDto(name) {
  return `import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Create${capitalizeFirst(name)}Dto {
    @ApiProperty({ 
        example: 'example name', 
        description: 'The name of the ${name}',
        minLength: 2 
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    name: string;

    // Add more properties as needed
}`;
}

function generateUpdateDto(name) {
  return `import { PartialType } from '@nestjs/swagger';
import { Create${capitalizeFirst(name)}Dto } from './create-${name}.dto';

export class Update${capitalizeFirst(name)}Dto extends PartialType(Create${capitalizeFirst(name)}Dto) {}`;
}

function generateController(name) {
  return `import { Controller, Get, Post, Put, Delete, Body, Param, Query , ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ${capitalizeFirst(name)}Service } from './${name}.service';
import { Create${capitalizeFirst(name)}Dto } from './dto/create-${name}.dto';
import { Update${capitalizeFirst(name)}Dto } from './dto/update-${name}.dto';
import { ${capitalizeFirst(name)}Entity } from './${name}.entity';
import { Pagination } from '../../common/dtos/Pagination.dto';
import { FindOptionsWhere } from 'typeorm';
import { Paginate } from '../../common/decorators/paginate';
import { SwaggerDocumentationPaginationQuery } from '../../common/decorators/swagger-paginate-decorator';

@ApiTags('${name}')
@ApiBearerAuth()
@Controller('${name}')
export class ${capitalizeFirst(name)}Controller {
    constructor(private readonly ${name}Service: ${capitalizeFirst(name)}Service) {}

    @Post()
    @ApiOperation({ summary: 'Create ${name}' })
    @ApiResponse({ 
        status: 201, 
        type: ${capitalizeFirst(name)}Entity,
        description: 'The ${name} has been successfully created.'
    })
    @ApiBody({type:Create${capitalizeFirst(name)}Dto})
    async create(@Body() create${capitalizeFirst(name)}Dto: Create${capitalizeFirst(name)}Dto) {
        return this.${name}Service.create(create${capitalizeFirst(name)}Dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all ${name}s with pagination' })
    @ApiResponse({ 
        status: 200, 
        type: [${capitalizeFirst(name)}Entity],
        description: 'List of all ${name}s'
    })
    @SwaggerDocumentationPaginationQuery()
    async findAll(@Paginate() pagination: Pagination) {
        return this.${name}Service.findAllWithPagination({}, [], pagination);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get ${name} by id' })
    @ApiResponse({ 
        status: 200, 
        type: ${capitalizeFirst(name)}Entity,
        description: 'The found ${name}'
    })
    @ApiResponse({ status: 404, description: '${capitalizeFirst(name)} not found' })
    async findOne(@Param('id' , ParseUUIDPipe) id: string) {
        const conditions: FindOptionsWhere<${capitalizeFirst(name)}Entity> = { id };
        return this.${name}Service.findOneBy(conditions);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update ${name}' })
    @ApiResponse({ 
        status: 200, 
        type: ${capitalizeFirst(name)}Entity,
        description: 'The ${name} has been successfully updated.'
    })
    @ApiResponse({ status: 404, description: '${capitalizeFirst(name)} not found' })
    @ApiBody({type:Update${capitalizeFirst(name)}Dto})
    async update(
        @Param('id' , ParseUUIDPipe) id: string,
        @Body() update${capitalizeFirst(name)}Dto: Update${capitalizeFirst(name)}Dto,
    ) {
        const conditions: FindOptionsWhere<${capitalizeFirst(name)}Entity> = { id };
        return this.${name}Service.updateBy(conditions, update${capitalizeFirst(name)}Dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Soft delete ${name}' })
    @ApiResponse({ status: 200, description: 'The ${name} has been successfully deleted.' })
    @ApiResponse({ status: 404, description: '${capitalizeFirst(name)} not found' })
    async remove(@Param('id' , ParseUUIDPipe) id: string) {
        const conditions: FindOptionsWhere<${capitalizeFirst(name)}Entity> = { id };
        return this.${name}Service.softDeleteBy(conditions);
    }
}`;
}

function generateService(name) {
  return `import { Injectable } from '@nestjs/common';
import { AbstractService } from '${DEFAULT_CONFIG.abstractPaths.service}';
import { ${capitalizeFirst(name)}Repository } from './${name}.repository';
import { ${capitalizeFirst(name)}Entity } from './${name}.entity';

@Injectable()
export class ${capitalizeFirst(name)}Service extends AbstractService<${capitalizeFirst(name)}Entity> {
    constructor(private readonly ${name}Repository: ${capitalizeFirst(name)}Repository) {
        super(${name}Repository);
    }
}`;
}

function generateRepository(name) {
  return `import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AbstractRepository } from '${DEFAULT_CONFIG.abstractPaths.repository}';
import { ${capitalizeFirst(name)}Entity } from './${name}.entity';

@Injectable()
export class ${capitalizeFirst(name)}Repository extends AbstractRepository<${capitalizeFirst(name)}Entity> {
    constructor(dataSource: DataSource) {
        super(${capitalizeFirst(name)}Entity, dataSource.manager);
    }
}`;
}

function generateEntity(name) {
  return `import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractEntity } from '${DEFAULT_CONFIG.abstractPaths.entity}';

@Entity('${name}s')
export class ${capitalizeFirst(name)}Entity extends AbstractEntity {
    @ApiProperty({ 
        example: 'example name', 
        description: 'The name of the ${name}' 
    })
    @Column()
    name: string;
}`;
}

function generateModule(name) {
  return `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${capitalizeFirst(name)}Controller } from './${name}.controller';
import { ${capitalizeFirst(name)}Service } from './${name}.service';
import { ${capitalizeFirst(name)}Repository } from './${name}.repository';
import { ${capitalizeFirst(name)}Entity } from './${name}.entity';

@Module({
    imports: [TypeOrmModule.forFeature([${capitalizeFirst(name)}Entity])],
    controllers: [${capitalizeFirst(name)}Controller],
    providers: [${capitalizeFirst(name)}Service, ${capitalizeFirst(name)}Repository],
    exports: [${capitalizeFirst(name)}Service],
})
export class ${capitalizeFirst(name)}Module {}`;
}

async function generateFiles(name) {
  try {
    // Validate module name
    validateModuleName(name);

    const moduleDir = path.join(process.cwd(), DEFAULT_CONFIG.srcPath, name);
    const dtoDir = path.join(moduleDir, 'dto');
    const testDir = path.join(moduleDir, 'test');

    // Create directories
    [moduleDir, dtoDir, testDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Generate main files
    const mainFiles = {
      'controller.ts': generateController(name),
      'service.ts': generateService(name),
      'repository.ts': generateRepository(name),
      'entity.ts': generateEntity(name),
      'module.ts': generateModule(name),
    };

    // Generate DTO files
    const dtoFiles = {
      [`create-${name}.dto.ts`]: generateCreateDto(name),
      [`update-${name}.dto.ts`]: generateUpdateDto(name),
    };

    // Write main files
    for (const [filename, content] of Object.entries(mainFiles)) {
      const filePath = path.join(moduleDir, `${name}.${filename}`);
      fs.writeFileSync(filePath, content);
    }

    // Write DTO files
    for (const [filename, content] of Object.entries(dtoFiles)) {
      const filePath = path.join(dtoDir, filename);
      fs.writeFileSync(filePath, content);
    }
  } catch (error) {
    process.exit(1);
  }
}

const moduleName = process.argv[2];

if (!moduleName) {
  process.exit(1);
}

// Execute the generator
generateFiles(moduleName);
