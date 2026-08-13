import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('summary')
  async getSummary() {
    return this.reportService.getSummary();
  }
}