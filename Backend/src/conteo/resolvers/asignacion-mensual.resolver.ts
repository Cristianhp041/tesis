import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AsignacionMensual } from '../entities/asignacion-mensual.entity';
import { AsignacionMensualService } from '../services/asignacion-mensual.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ActivoAsignadoOutput } from '../dto/asignacionmensual.output';
import { ResumenMensualOutput } from '../dto/resumenmensual.output';

@Resolver(() => AsignacionMensual)
export class AsignacionMensualResolver {
  
  constructor(private asignacionMensualService: AsignacionMensualService) {}

  @Query(() => AsignacionMensual)
  async asignacionMensual(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<AsignacionMensual> {
    return await this.asignacionMensualService.obtenerPorId(id);
  }
  
  @Query(() => AsignacionMensual)
  async asignacionMensualPorMes(
    @Args('planConteoId', { type: () => Int }) planConteoId: number,
    @Args('mes', { type: () => Int }) mes: number,
  ): Promise<AsignacionMensual> {
    return await this.asignacionMensualService.obtenerPorMes(planConteoId, mes);
  }

  @Query(() => [ActivoAsignadoOutput])
  async activosDelMes(
    @Args('asignacionId', { type: () => Int }) asignacionId: number,
  ): Promise<ActivoAsignadoOutput[]> {
    return await this.asignacionMensualService.obtenerActivosDelMes(asignacionId) as unknown as ActivoAsignadoOutput[];
  }

  @Mutation(() => AsignacionMensual)
  async iniciarMes(
    @Args('asignacionId', { type: () => Int }) asignacionId: number,
    @Args('responsableId', { type: () => Int, nullable: true }) responsableId?: number,
  ): Promise<AsignacionMensual> {
    return await this.asignacionMensualService.iniciarMes(asignacionId, responsableId);
  }

  @Mutation(() => AsignacionMensual)
  async completarMes(
    @Args('asignacionId', { type: () => Int }) asignacionId: number,
  ): Promise<AsignacionMensual> {
    return await this.asignacionMensualService.completarMes(asignacionId);
  }

  @Mutation(() => AsignacionMensual)
  async actualizarProgresoMes(
    @Args('asignacionId', { type: () => Int }) asignacionId: number,
  ): Promise<AsignacionMensual> {
    return await this.asignacionMensualService.actualizarProgreso(asignacionId);
  }

  @Query(() => ResumenMensualOutput)
  async resumenMensual(
    @Args('asignacionId', { type: () => Int }) asignacionId: number,
  ): Promise<ResumenMensualOutput> {
    return await this.asignacionMensualService.obtenerResumenMensual(asignacionId) as unknown as ResumenMensualOutput;
  }

  @Mutation(() => AsignacionMensual)
  async agregarObservacionMes(
    @Args('asignacionId', { type: () => Int }) asignacionId: number,
    @Args('observacion') observacion: string,
  ): Promise<AsignacionMensual> {
    return await this.asignacionMensualService.agregarObservacion(asignacionId, observacion);
  }

  @Mutation(() => AsignacionMensual)
  async confirmarConteoMensual(
    @Args('asignacionId', { type: () => Int }) asignacionId: number,
    @Args('confirmadoPor', { type: () => String }) confirmadoPor: string,
  ): Promise<AsignacionMensual> {
    return await this.asignacionMensualService.confirmarConteo(asignacionId, confirmadoPor);
  }

  @Query(() => Boolean)
  async puedeEditarConteo(
    @Args('asignacionId', { type: () => Int }) asignacionId: number,
  ): Promise<boolean> {
    return await this.asignacionMensualService.puedeEditar(asignacionId);
  }

  @Query(() => Int)
  async cantidadAftsDesactivados(
    @Args('asignacionId', { type: () => Int }) asignacionId: number,
  ): Promise<number> {
    return await this.asignacionMensualService.obtenerCantidadAftsDesactivados(asignacionId);
  }
}