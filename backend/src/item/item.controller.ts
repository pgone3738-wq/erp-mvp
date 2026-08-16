import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
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
  async create(@Body() body: { name: string; sku: string; price: number }, @Req() req: any) {
    return this.itemService.create(body, req.user?.id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() body: { name: string; sku: string; price: number }, 
    @Req() req: any
  ) {
    return this.itemService.update(id, body, req.user?.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.itemService.remove(id, req.user?.id);
  }
}