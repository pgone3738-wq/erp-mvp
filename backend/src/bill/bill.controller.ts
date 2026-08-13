import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BillService } from './bill.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('bills')
@UseGuards(AuthGuard('jwt')) // Protect this route!
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Get()
  async findAll() {
    return this.billService.findAll();
  }

  @Post()
  async create(@Body() body: { vendorName: string; itemName: string; quantity: number; totalCost: number }) {
    return this.billService.create(body);
  }
}