import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { TestimonioRepository } from '@infrastructure/repositories/testimonio.repository';
import { CreateTestimonioUseCase } from '@application/use-cases/testimonios/create-testimonio.use-case';
import { GetAllTestimoniosUseCase } from '@application/use-cases/testimonios/get-all-testimonios.use-case';
import { UpdateTestimonioUseCase } from '@application/use-cases/testimonios/update-testimonio.use-case';
import { DeleteTestimonioUseCase } from '@application/use-cases/testimonios/delete-testimonio.use-case';
import { TestimoniosController } from '@interface/controllers/testimonios.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [TestimoniosController],
  providers: [
    {
      provide: 'ITestimonioRepository',
      useClass: TestimonioRepository,
    },
    CreateTestimonioUseCase,
    GetAllTestimoniosUseCase,
    UpdateTestimonioUseCase,
    DeleteTestimonioUseCase,
  ],
  exports: ['ITestimonioRepository'],
})
export class TestimoniosModule {}