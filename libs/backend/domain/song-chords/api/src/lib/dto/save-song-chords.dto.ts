import { IsString } from 'class-validator';

export class SaveSongChordsDto {
  @IsString()
  public title!: string;

  @IsString()
  public content!: string;
}
