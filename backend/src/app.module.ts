import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ItemModule } from './item/item.module';
import { InvoiceModule } from './invoice/invoice.module'; // Only ONE of these!
import { BillModule } from './bill/bill.module';
import { JournalModule } from './journal/journal.module';
import { ReportModule } from './report/report.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [PrismaModule, AuthModule, ItemModule, InvoiceModule, BillModule, JournalModule, ReportModule, ContactModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}