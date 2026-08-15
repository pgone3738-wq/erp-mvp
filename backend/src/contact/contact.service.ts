import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.contact.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(data: { name: string; email?: string; phone?: string; type: string }) {
    return this.prisma.contact.create({ data });
  }

  async update(id: string, data: { name: string; email?: string; phone?: string; type: string }) {
    try {
      return await this.prisma.contact.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException('Contact not found');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.contact.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException('Contact not found');
    }
  }
}