import { Module } from '@nestjs/common';
import { PerformanceController } from './performance.controller';
import { PerfomanceService } from './perfomance.service';

@Module({
  imports: [],
  controllers: [PerformanceController],
  providers: [PerfomanceService],
})
export class PerformanceModule {}
