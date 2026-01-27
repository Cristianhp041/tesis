import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body, 
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AftService } from './aft.service';
import { CreateAftDto } from './dto/create-aft.dto';
import { UpdateAftDto } from './dto/update-aft.dto';

@Controller('aft')
export class AftController {
  constructor(private readonly service: AftService) {}

  @Post()
  create(@Body() dto: CreateAftDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateAftDto) {
    return this.service.update(+id, dto);
  }

  @Patch(':id/mover/:area')
  mover(@Param('id') id: string, @Param('area') areaId: string) {
    return this.service.moverArea(+id, +areaId);
  }

  @Patch(':id/desactivar')
  desactivar(@Param('id') id: string) {
    return this.service.desactivar(+id);
  }

  @Patch('masivo/desactivar')
  desactivarMasivo(@Body('aftIds') aftIds: number[]) {
    return this.service.desactivarMasivo(aftIds);
  }

  @Patch('masivo/mover/:areaId')
  moverMasivo(
    @Param('areaId') areaId: string,
    @Body('aftIds') aftIds: number[],
  ) {
    return this.service.moverMasivo(aftIds, +areaId);
  }

  @Post('importar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
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
  async importarAfts(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha subido ningún archivo');
    }

    return this.service.importarAfts(file.buffer);
  }
}