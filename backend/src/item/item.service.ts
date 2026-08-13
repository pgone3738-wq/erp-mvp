import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.item.findMany();
  }

  async create(data: { name: string; sku: string; price: number }) {
    try {
      // Notice we don't take 'stock' from the user anymore. It defaults to 0!
      return await this.prisma.item.create({
        data: {
          name: data.name,
          sku: data.sku,
          price: data.price,
          stock: 0, // Always start at 0
        },
      });
    } catch (error) {
      // If Prisma throws a duplicate SKU error (P2002), send a nice message
      if (error.code === 'P2002') {
        throw new ConflictException('An item with this SKU already exists.');
      }
      throw error;
    }
  }
}