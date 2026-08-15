import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('contacts')
@UseGuards(AuthGuard('jwt')) // Protect all routes!
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  async findAll() {
    return this.contactService.findAll();
  }

  @Post()
  async create(@Body() body: { name: string; email?: string; phone?: string; type: string }) {
    return this.contactService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { name: string; email?: string; phone?: string; type: string }) {
    return this.contactService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}