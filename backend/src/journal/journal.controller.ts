import { Controller, Get, UseGuards } from '@nestjs/common';
import { JournalService } from './journal.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('journal')
@UseGuards(AuthGuard('jwt')) // Keep it secure!
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  async findAll() {
    return this.journalService.findAll();
  }
}