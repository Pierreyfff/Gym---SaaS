import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { StaffRepository } from '@infrastructure/repositories/staff.repository';
import { CreateStaffUseCase } from '@application/use-cases/staff/create-staff.use-case';
import { GetAllStaffUseCase } from '@application/use-cases/staff/get-all-staff.use-case';
import { UpdateStaffUseCase } from '@application/use-cases/staff/update-staff.use-case';
import { DeleteStaffUseCase } from '@application/use-cases/staff/delete-staff.use-case';
import { StaffController } from '@interface/controllers/staff.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [StaffController],
  providers: [
    {
      provide: 'IStaffRepository',
      useClass: StaffRepository,
    },
    CreateStaffUseCase,
    GetAllStaffUseCase,
    UpdateStaffUseCase,
    DeleteStaffUseCase,
  ],
  exports: ['IStaffRepository'],
})
export class StaffModule {}