import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Fetch all journal entries, including their lines and the account names
    return this.prisma.journalEntry.findMany({
      include: {
        lines: {
          include: {
            account: true, // We want to see the Account Code and Name
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }
}