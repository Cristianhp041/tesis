import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';

export async function seedAdmin(dataSource: DataSource) {
  const repo = dataSource.getRepository(User);

  const exists = await repo.findOne({
    where: { email: 'chrissclash041@gmail.com' },
  });

  if (exists) {
    return;
  }

  const password = await bcrypt.hash('123456', 10);

  const admin = repo.create({
    email: 'chrissclash041@gmail.com',
    password,
    name: 'Administrador',
    role: UserRole.ADMIN, 
    active: true,
    emailVerified: true,
  });

  await repo.save(admin);
}
