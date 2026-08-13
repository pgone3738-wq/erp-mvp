import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('invoices')
@UseGuards(AuthGuard('jwt')) // <-- THIS BLOCKS UNAUTHORIZED USERS
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async findAll() {
    return this.invoiceService.findAll();
  }

  @Post()
  async create(@Body() body: { customerName: string; itemName: string; quantity: number; totalAmount: number }) {
    return this.invoiceService.create(body);
  }
}