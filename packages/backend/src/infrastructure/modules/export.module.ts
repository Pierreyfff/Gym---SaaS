import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { ExportController } from '@interface/controllers/export.controller';
import { ExportExcelService } from '@application/services/export-excel.service';
import { ExportPdfService } from '@application/services/export-pdf.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ExportController],
  providers:  [ExportExcelService, ExportPdfService],
})
export class ExportModule {}