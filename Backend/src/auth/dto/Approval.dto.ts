import { IsInt, IsOptional, IsString } from 'class-validator';

export class ApproveUserDto {
  @IsInt()
  userId: number;
}

export class RejectUserDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  reason?: string;
}