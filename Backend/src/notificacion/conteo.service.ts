import { Injectable } from '@nestjs/common';

/**
 * PLACEHOLDER SERVICE - CONTEO
 * 
 * Este servicio tiene métodos placeholder que siempre retornan false.
 * Esto hace que el sistema de notificaciones SIEMPRE notifique.
 * 
 * CUANDO IMPLEMENTES EL MÓDULO DE CONTEOS:
 * 1. Reemplaza estos métodos con la lógica real
 * 2. Conecta con la base de datos de conteos
 * 3. Verifica si realmente se completó el conteo
 */
@Injectable()
export class ConteoService {
  /**
   * PLACEHOLDER - Verificar si se completó el conteo mensual del 10%
   * 
   * @param year - Año del conteo
   * @param month - Mes del conteo (1-12)
   * @returns true si se completó, false si no
   * 
   * TODO: IMPLEMENTAR LÓGICA REAL
   * Pasos a implementar:
   * 1. Buscar en la tabla de conteos mensuales
   * 2. WHERE año = year AND mes = month
   * 3. WHERE estado = 'COMPLETADO'
   * 4. Si existe, return true
   * 5. Si no existe, return false
   */
  async hasCompletedMensualConteo(year: number, month: number): Promise<boolean> {
    // Por ahora siempre retorna false para que notifique
    console.log(`[CONTEO SERVICE] Verificando conteo mensual ${month}/${year} - PLACEHOLDER (siempre false)`);
    return false;

    /* EJEMPLO DE IMPLEMENTACIÓN FUTURA:
    
    const conteo = await this.conteoMensualRepository.findOne({
      where: {
        year,
        month,
        estado: 'COMPLETADO'
      }
    });
    
    return !!conteo;
    */
  }

  /**
   * PLACEHOLDER - Verificar si se completó el conteo anual del 100%
   * 
   * @param year - Año del conteo
   * @returns true si se completó, false si no
   * 
   * TODO: IMPLEMENTAR LÓGICA REAL
   * Pasos a implementar:
   * 1. Buscar en la tabla de conteos anuales
   * 2. WHERE año = year
   * 3. WHERE estado = 'COMPLETADO'
   * 4. Si existe, return true
   * 5. Si no existe, return false
   */
  async hasCompletedAnualConteo(year: number): Promise<boolean> {
    // Por ahora siempre retorna false para que notifique
    console.log(`[CONTEO SERVICE] Verificando conteo anual ${year} - PLACEHOLDER (siempre false)`);
    return false;

    /* EJEMPLO DE IMPLEMENTACIÓN FUTURA:
    
    const conteo = await this.conteoAnualRepository.findOne({
      where: {
        year,
        estado: 'COMPLETADO'
      }
    });
    
    return !!conteo;
    */
  }
}