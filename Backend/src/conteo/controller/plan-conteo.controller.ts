import { Controller, Get, Param, Res, BadRequestException, ParseIntPipe } from '@nestjs/common';
import type { Response } from 'express';
import { PlanConteoService } from '../services/plan-conteo.service';

@Controller('plan-conteo')
export class PlanConteoController {
  constructor(private readonly planConteoService: PlanConteoService) {}

  @Get('exportar-plan-anual/:planId')
  async exportarPlanAnual(
    @Param('planId', ParseIntPipe) planId: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const buffer = await this.planConteoService.exportarPlanAnual(planId);

      const plan = await this.planConteoService.obtenerPlanPorId(planId);
      const filename = `Plan_Conteo_Anual_${plan.anno}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(`Error al exportar plan anual: ${mensaje}`);
    }
  }
}