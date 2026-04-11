import { plainToClass } from 'class-transformer';
import { IsString, IsNumber, validateSync, MinLength, IsOptional} from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  PORT: number = 3000;

  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET: string;

  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  @IsOptional()
  RESEND_API_KEY?: string;

  @IsString()
  @IsOptional()
  RESEND_FROM_EMAIL?: string;
}

export function validate(config: Record<string, unknown>) {
  // DEBUG: Ver qué variables se están leyendo
  console.log('🔍 Variables de entorno recibidas:', {
    JWT_ACCESS_SECRET: config.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: config.JWT_REFRESH_SECRET,
    DATABASE_URL: config.DATABASE_URL ? '✅ Existe' : '❌ No existe',
  });

  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `❌ Error de validación de variables de entorno:\n${errors.toString()}`,
    );
  }

  return validatedConfig;
}
