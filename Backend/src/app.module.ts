// backend/src/app.module.ts
import { Module } from '@nestjs/common';
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

@Module({
  imports: [
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
      database: 'tesis_bd',
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
  ],
})
export class AppModule {}