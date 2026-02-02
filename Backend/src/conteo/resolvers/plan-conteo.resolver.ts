import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PlanConteoAnual } from '../entities/plan-conteo-anual.entity';
import { PlanConteoService } from '../services/plan-conteo.service';
import { GenerarPlanInput } from '../dto/generarplan.input';
import { ProgresoGeneralOutput } from '../dto/progresogeneral.output';

@Resolver(() => PlanConteoAnual)
export class PlanConteoResolver {
  
  constructor(private planConteoService: PlanConteoService) {}

  @Mutation(() => PlanConteoAnual)
  async generarPlanConteo(
    @Args('input') input: GenerarPlanInput,
  ): Promise<PlanConteoAnual> {
    return await this.planConteoService.generarPlan(input);
  }

  @Query(() => PlanConteoAnual)
  async planConteoActual(): Promise<PlanConteoAnual> {
    return await this.planConteoService.obtenerPlanActual();
  }

  @Query(() => PlanConteoAnual)
  async planConteoPorId(
    @Args('planId', { type: () => Int }) planId: number,
  ): Promise<PlanConteoAnual> {
    return await this.planConteoService.obtenerPlanPorId(planId);
  }

  @Query(() => PlanConteoAnual)
  async planConteoPorAnio(
    @Args('anno', { type: () => Int }) anno: number,
  ): Promise<PlanConteoAnual> {
    return await this.planConteoService.obtenerPlanPorAnno(anno);
  }

  @Query(() => [PlanConteoAnual])
  async listarPlanesConteo(): Promise<PlanConteoAnual[]> {
    return await this.planConteoService.listarPlanes();
  }

  @Mutation(() => PlanConteoAnual)
  async iniciarPlanConteo(
    @Args('planId', { type: () => Int }) planId: number,
  ): Promise<PlanConteoAnual> {
    return await this.planConteoService.iniciarPlan(planId);
  }

  @Mutation(() => PlanConteoAnual)
  async completarPlanConteo(
    @Args('planId', { type: () => Int }) planId: number,
  ): Promise<PlanConteoAnual> {
    return await this.planConteoService.completarPlan(planId);
  }

  @Mutation(() => PlanConteoAnual)
  async cancelarPlanConteo(
    @Args('planId', { type: () => Int }) planId: number,
    @Args('motivo', { nullable: true }) motivo?: string,
  ): Promise<PlanConteoAnual> {
    return await this.planConteoService.cancelarPlan(planId, motivo);
  }

  @Mutation(() => PlanConteoAnual)
  async actualizarEstadisticasPlan(
    @Args('planId', { type: () => Int }) planId: number,
  ): Promise<PlanConteoAnual> {
    return await this.planConteoService.actualizarEstadisticas(planId);
  }

  @Query(() => ProgresoGeneralOutput)
  async progresoGeneralPlan(
    @Args('planId', { type: () => Int }) planId: number,
  ): Promise<ProgresoGeneralOutput> {
    return await this.planConteoService.obtenerProgresoGeneral(planId);
  }

  @Mutation(() => PlanConteoAnual)
  async finalizarPlanConteo(
    @Args('planId', { type: () => Int }) planId: number,
    @Args('motivo', { nullable: true }) motivo?: string,
  ): Promise<PlanConteoAnual> {
    return await this.planConteoService.finalizarPlan(planId, motivo);
  }

  @Mutation(() => PlanConteoAnual)
  async redistribuirNuevosActivos(
    @Args('planId', { type: () => Int }) planId: number,
  ): Promise<PlanConteoAnual> {
    return await this.planConteoService.redistribuirNuevosActivos(planId);
  }

  @Query(() => Int)
  async contarActivosNuevosSinAsignar(
    @Args('planId', { type: () => Int }) planId: number,
  ): Promise<number> {
    return await this.planConteoService.contarActivosNuevosSinAsignar(planId);
  } 
}