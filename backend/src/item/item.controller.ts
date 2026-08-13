import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ItemService } from './item.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('items')
@UseGuards(AuthGuard('jwt'))
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  async findAll() {
    return this.itemService.findAll();
  }

  @Post()
  async create(@Body() body: { name: string; sku: string; price: number }) {
    return this.itemService.create(body);
  }
}