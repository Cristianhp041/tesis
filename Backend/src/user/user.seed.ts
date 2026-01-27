import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';

export async function seedAdmin(dataSource: DataSource) {
  const repo = dataSource.getRepository(User);

  const exists = await repo.findOne({
    where: { email: 'admin@vertex.cu' },
  });

  if (exists) {
    return;
  }

  const password = await bcrypt.hash('123456', 10);

  const admin = repo.create({
    email: 'admin@vertex.cu',
    password,
    role: UserRole.ADMIN, 
    active: true,
  });

  await repo.save(admin);
}
