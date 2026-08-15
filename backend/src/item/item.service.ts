import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.item.findMany();
  }

  async create(data: { name: string; sku: string; price: number }) {
    try {
      return await this.prisma.item.create({
        data: {
          name: data.name,
          sku: data.sku,
          price: data.price,
          stock: 0,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('An item with this SKU already exists.');
      }
      throw error;
    }
  }

  // NEW: Update an item
  async update(id: string, data: { name: string; sku: string; price: number }) {
    try {
      return await this.prisma.item.update({
        where: { id },
        data: {
          name: data.name,
          sku: data.sku,
          price: data.price,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('An item with this SKU already exists.');
      }
      throw new NotFoundException('Item not found');
    }
  }

  // NEW: Delete an item
  async remove(id: string) {
    try {
      return await this.prisma.item.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('Item not found');
    }
  }
}