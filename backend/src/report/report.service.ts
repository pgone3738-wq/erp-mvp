import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    // 1. Calculate Total Revenue (Sum of all credits to Revenue accounts)
    const revenueAgg = await this.prisma.journalLine.aggregate({
      _sum: { credit: true },
      where: { account: { type: 'REVENUE' } },
    });
    const totalRevenue = revenueAgg._sum.credit || 0;

    // 2. Calculate Total Expenses (Sum of all Vendor Bills)
    const expenseAgg = await this.prisma.bill.aggregate({
      _sum: { totalCost: true },
    });
    const totalExpenses = expenseAgg._sum.totalCost || 0;

    // 3. Calculate Net Profit
    const netProfit = totalRevenue - totalExpenses;

    // 4. Get Inventory Count
    const itemCount = await this.prisma.item.count();

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      itemCount,
    };
  }
}