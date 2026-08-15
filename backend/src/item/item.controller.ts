import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
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

  // NEW: Edit route
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { name: string; sku: string; price: number }) {
    return this.itemService.update(id, body);
  }

  // NEW: Delete route
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.itemService.remove(id);
  }
}