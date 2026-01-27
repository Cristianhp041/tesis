import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext()?.req;

    if (!req) {
      throw new UnauthorizedException('Request no disponible');
    }

    const authHeader = req.headers?.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
      throw new UnauthorizedException('Token inválido');
    }

    try {
      const payload = this.jwtService.verify(token);
      req.user = payload; 
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
