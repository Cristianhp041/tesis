import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // 🆕 IMPORTAR
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AreaModule } from './area/area.module';
import { ProvinciaModule } from './provincia/provincia.module';
import { MunicipioModule } from './municipio/municipio.module';
import { CargoModule } from './cargo/cargo.module';
import { TrabajadorModule } from './trabajador/trabajador.module';
import { AftModule } from './aft/aft.module';
import { SubclasificacionModule } from './subclasificacion/subclasificacion.module';
import { DocumentsModule } from './documentos/documento.module';
import { NotificationModule } from './notificacion/notificacion.module';
import { ConteoAftModule } from './conteo/conteo.module';
import { EmailModule } from './email/email.module'; // 🆕 IMPORTAR (si no lo tienes)

@Module({
  imports: [
    // 🆕 AGREGAR ESTO PRIMERO (debe ser lo primero)
    ConfigModule.forRoot({
      isGlobal: true,      // Hace que ConfigService esté disponible en todos los módulos
      envFilePath: '.env', // Ruta al archivo .env
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      introspection: true,
      context: ({ req }) => ({ req }),
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Admin123',
      database: 'tesis_bd2',
      autoLoadEntities: true,
      synchronize: true,
      logging: false,
    }),

    AuthModule,
    UserModule,
    AreaModule,
    ProvinciaModule,
    MunicipioModule,
    CargoModule,
    TrabajadorModule,
    AftModule,
    SubclasificacionModule,
    DocumentsModule,
    NotificationModule,
    ConteoAftModule,
    EmailModule, // 🆕 Agregar si no lo tienes
  ],
})
export class AppModule {}