import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch, 
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrabajadorService } from './trabajador.service';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';

@Controller('trabajador')
export class TrabajadorController {
  constructor(private readonly service: TrabajadorService) {}

  @Post()
  create(@Body() dto: CreateTrabajadorDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query('active') active?: 'true' | 'false' | 'all') {
    return this.service.findAll(active);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTrabajadorDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Post('importar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, 
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
        ];
        
        if (!allowedTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Solo se permiten archivos Excel (.xls, .xlsx) o CSV'),
            false
          );
        }
        cb(null, true);
      },
    })
  )
  async importarTrabajadores(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo');
    }

    return this.service.importarTrabajadores(file.buffer);
  }
}