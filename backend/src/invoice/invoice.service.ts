import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.invoice.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(data: { customerName: string; itemName: string; quantity: number; totalAmount: number }) {
    // 1. Check if item exists in inventory
    const item = await this.prisma.item.findFirst({ where: { name: data.itemName } });
    if (!item) throw new NotFoundException(`Item "${data.itemName}" not found in inventory!`);

    // 2. Check if we have enough stock
    if (item.stock < data.quantity) {
      throw new NotFoundException(`Not enough stock for ${item.name}. Only ${item.stock} left.`);
    }

    // 3. Find Accounting Accounts
    const arAccount = await this.prisma.account.findFirst({ where: { code: '1100' } }); // Accounts Receivable
    const revAccount = await this.prisma.account.findFirst({ where: { code: '4000' } }); // Sales Revenue
    
    if (!arAccount || !revAccount) throw new NotFoundException('Accounting accounts not seeded!');

    // 4. Create Invoice, Deduct Stock, AND Create Journal Entry in one transaction
    const [invoice] = await this.prisma.$transaction([
      // Create the invoice
      this.prisma.invoice.create({ data }),
      
      // Deduct inventory
      this.prisma.item.update({
        where: { id: item.id },
        data: { stock: { decrement: data.quantity } },
      }),

      // Create Journal Entry
      this.prisma.journalEntry.create({
        data: {
          reference: `Sales Invoice: ${data.customerName}`,
          description: `Sale of ${data.quantity}x ${data.itemName}`,
          lines: {
            create: [
              { accountId: arAccount.id, debit: data.totalAmount, credit: 0 },  // Debit AR
              { accountId: revAccount.id, debit: 0, credit: data.totalAmount }, // Credit Revenue
            ]
          }
        }
      })
    ]);

    return invoice;
  }
}