import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGO_URI,
        connectionFactory: (connection) => {
          console.log(`MongoDB connecting to: ${process.env.MONGO_URI}`);
          connection.on('connected', () => {
            console.log(`MongoDB connected: ${connection.name}`);
          });
          connection.on('error', (err: unknown) => {
            console.error('MongoDB connection error:', err);
          });
          return connection;
        },
      }),
    }),
    UsersModule,
    EmailModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
