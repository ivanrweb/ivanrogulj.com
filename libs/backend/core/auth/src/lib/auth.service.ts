import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AdminRepository } from '@ivanrogulj.com/backend/domain/admin/data-access';

@Injectable()
export class AuthService {
  public constructor(
    private readonly adminRepository: AdminRepository,
    private readonly jwtService: JwtService,
  ) {}

  public async login(username: string, password: string): Promise<{ access_token: string }> {
    const admin = await this.adminRepository.findByUsername(username);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: admin.id, username: admin.username };
    return { access_token: this.jwtService.sign(payload) };
  }

  public async register(username: string, password: string): Promise<void> {
    const alreadyExists = await this.adminRepository.existsAny();
    if (alreadyExists) {
      throw new ForbiddenException('Admin already registered. Use existing credentials.');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = this.adminRepository.create({ username, passwordHash });
    await this.adminRepository.save(admin);
  }
}
