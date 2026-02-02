import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class GenerarPlanInput {
  
  @Field(() => Int, { description: 'Año del plan de conteo (ej: 2025)' })
  @IsInt()
  @Min(2020)
  anno: number;

  @Field(() => Int, { description: 'ID del usuario que crea el plan' })
  @IsInt()
  userId: number;

  @Field(() => Int, { nullable: true, description: 'Total de meses del plan (default: 10)' })
  @IsInt()
  @IsOptional()
  totalMeses?: number;

  @Field({ nullable: true, description: 'Observaciones adicionales del plan' })
  @IsString()
  @IsOptional()
  observaciones?: string;
}