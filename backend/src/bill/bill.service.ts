import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.bill.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(data: { vendorName: string; itemName: string; quantity: number; totalCost: number }) {
    const item = await this.prisma.item.findFirst({ where: { name: data.itemName } });
    if (!item) throw new NotFoundException(`Item "${data.itemName}" not found in inventory! Please create it first.`);

    // Find Accounting Accounts
    const invAccount = await this.prisma.account.findFirst({ where: { code: '1200' } }); // Inventory Asset
    const apAccount = await this.prisma.account.findFirst({ where: { code: '2000' } });   // Accounts Payable
    
    if (!invAccount || !apAccount) throw new NotFoundException('Accounting accounts not seeded!');

    const [bill] = await this.prisma.$transaction([
      // Create the bill
      this.prisma.bill.create({ data }),
      
      // Increase inventory
      this.prisma.item.update({
        where: { id: item.id },
        data: { stock: { increment: data.quantity } },
      }),

      // Create Journal Entry
      this.prisma.journalEntry.create({
        data: {
          reference: `Vendor Bill: ${data.vendorName}`,
          description: `Purchase of ${data.quantity}x ${data.itemName}`,
          lines: {
            create: [
              { accountId: invAccount.id, debit: data.totalCost, credit: 0 },  // Debit Inventory
              { accountId: apAccount.id, debit: 0, credit: data.totalCost },   // Credit Accounts Payable
            ]
          }
        }
      })
    ]);

    return bill;
  }
}