import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GeneratePatchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  public description!: string;
}
