import { ApiProperty } from '@nestjs/swagger';

export class InfoResponseDto {
  @ApiProperty()
  name: string;
  @ApiProperty()
  version: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  uptime: number;
}
