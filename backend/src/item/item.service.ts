import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.item.findMany();
  }

  async create(data: { name: string; sku: string; price: number }, userId?: string) {
    try {
      const item = await this.prisma.item.create({
        data: {
          name: data.name,
          sku: data.sku,
          price: data.price,
          stock: 0,
        },
      });

      // WRITE AUDIT LOG
      await this.prisma.auditLog.create({
        data: {
          userId: userId || null,
          action: 'CREATE',
          entity: 'Item',
          entityId: item.id,
        },
      });

      return item;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('An item with this SKU already exists.');
      }
      throw error;
    }
  }

  async update(id: string, data: { name: string; sku: string; price: number }, userId?: string) {
    try {
      const item = await this.prisma.item.update({
        where: { id },
        data: {
          name: data.name,
          sku: data.sku,
          price: data.price,
        },
      });

      // WRITE AUDIT LOG
      await this.prisma.auditLog.create({
        data: {
          userId: userId || null,
          action: 'UPDATE',
          entity: 'Item',
          entityId: item.id,
        },
      });

      return item;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('An item with this SKU already exists.');
      }
      throw new NotFoundException('Item not found');
    }
  }

  async remove(id: string, userId?: string) {
    try {
      await this.prisma.item.delete({ where: { id } });

      // WRITE AUDIT LOG
      await this.prisma.auditLog.create({
        data: {
          userId: userId || null,
          action: 'DELETE',
          entity: 'Item',
          entityId: id,
        },
      });

      return { success: true };
    } catch (error) {
      throw new NotFoundException('Item not found');
    }
  }
}