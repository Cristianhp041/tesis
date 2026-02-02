import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RegistroConteo } from '../entities/registro-conteo.entity';
import { RegistroConteoService } from '../services/registro-conteo.service';
import { 
  RegistrarConteoInput, 
  ActualizarRegistroConteoInput, 
  RevisarRegistroInput,
  AplicarCorreccionInput 
} from '../dto/registrarconteo.input';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ContadorPorUsuarioOutput } from '../dto/resumenmensual.output';

@Resolver(() => RegistroConteo)
export class RegistroConteoResolver {
  
  constructor(private registroConteoService: RegistroConteoService) {}

  @Mutation(() => RegistroConteo)
  async registrarConteo(
    @Args('input') input: RegistrarConteoInput,
    @CurrentUser('id') userId?: number, 
  ): Promise<RegistroConteo> {

    const finalUserId = userId || 1; 
    
    return await this.registroConteoService.registrarConteo(input, finalUserId);
  }

  @Mutation(() => RegistroConteo)
  async actualizarRegistroConteo(
    @Args('input') input: ActualizarRegistroConteoInput,
    @CurrentUser('id') userId?: number,
  ): Promise<RegistroConteo> {
    const finalUserId = userId || 1;
    return await this.registroConteoService.actualizarRegistro(input, finalUserId);
  }

  @Mutation(() => RegistroConteo)
  async revisarRegistroConteo(
    @Args('input') input: RevisarRegistroInput,
    @CurrentUser('id') userId?: number,
  ): Promise<RegistroConteo> {
    const finalUserId = userId || 1;
    return await this.registroConteoService.revisarRegistro(input, finalUserId);
  }

  @Mutation(() => RegistroConteo)
  async aplicarCorreccionRegistro(
    @Args('input') input: AplicarCorreccionInput,
    @CurrentUser('id') userId?: number,
  ): Promise<RegistroConteo> {
    const finalUserId = userId || 1;
    return await this.registroConteoService.aplicarCorreccion(input, finalUserId);
  }

  @Query(() => RegistroConteo)
  async registroConteoPorId(
    @Args('registroId', { type: () => Int }) registroId: number,
  ): Promise<RegistroConteo> {
    return await this.registroConteoService.obtenerPorId(registroId);
  }

  @Query(() => [RegistroConteo])
  async registrosConteoPorMes(
    @Args('asignacionMensualId', { type: () => Int }) asignacionMensualId: number,
  ): Promise<RegistroConteo[]> {
    return await this.registroConteoService.listarRegistrosPorMes(asignacionMensualId);
  }

  @Query(() => [RegistroConteo])
  async discrepanciasPorMes(
    @Args('asignacionMensualId', { type: () => Int }) asignacionMensualId: number,
  ): Promise<RegistroConteo[]> {
    return await this.registroConteoService.listarDiscrepancias(asignacionMensualId);
  }

  @Query(() => [RegistroConteo])
  async faltantesPorMes(
    @Args('asignacionMensualId', { type: () => Int }) asignacionMensualId: number,
  ): Promise<RegistroConteo[]> {
    return await this.registroConteoService.listarFaltantes(asignacionMensualId);
  }

  @Query(() => [ContadorPorUsuarioOutput])
  async estadisticasPorUsuario(
    @Args('asignacionMensualId', { type: () => Int }) asignacionMensualId: number,
  ): Promise<ContadorPorUsuarioOutput[]> {
    return await this.registroConteoService.obtenerEstadisticasPorUsuario(asignacionMensualId);
  }

  @Mutation(() => Boolean)
  async eliminarRegistroConteo(
    @Args('registroId', { type: () => Int }) registroId: number,
    @CurrentUser('id') userId?: number,
  ): Promise<boolean> {
    const finalUserId = userId || 1;
    await this.registroConteoService.eliminarRegistro(registroId, finalUserId);
    return true;
  }
}