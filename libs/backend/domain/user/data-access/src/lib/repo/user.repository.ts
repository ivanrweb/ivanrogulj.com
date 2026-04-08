import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  public constructor(private readonly dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    return this.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  public async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    return this.createQueryBuilder('user')
      .where('user.googleId = :googleId', { googleId })
      .getOne();
  }

  public async findByConfirmToken(token: string): Promise<UserEntity | null> {
    return this.createQueryBuilder('user')
      .where('user.emailConfirmToken = :token', { token })
      .getOne();
  }
}
