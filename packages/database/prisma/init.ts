import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🏋️ Creando gimnasio por defecto...');

  const gimnasio = await prisma.gimnasio.create({
    data: {
      id: '32f3950a-94af-4b9e-86f9-20b8dab1ef74',
      nombre: 'GymSaaS Demo',
      slug: 'gymsaas-demo',
    },
  });

  console.log(`✅ Gimnasio creado: ${gimnasio.nombre} (${gimnasio.id})`);

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.usuario.create({
    data: {
      gimnasioId: gimnasio.id,
      email: 'admin@gymdemo.com',
      contrasenaHash: hashedPassword,
      nombre: 'Admin',
      apellido: 'GymSaaS',
      telefono: '555-0000',
      rol: 'admin',
      estado: 'activo',
    },
  });

  console.log(`✅ Admin creado: ${admin.email}`);
  console.log('   Credenciales: admin@gymdemo.com / admin123');

  const config = await prisma.configuracionGimnasio.create({
    data: {
      gimnasioId: gimnasio.id,
      nombreNegocio: 'GymSaaS Demo',
      colorPrimario: '#10b981',
      colorSecundario: '#3b82f6',
      horarioApertura: '06:00',
      horarioCierre: '22:00',
      diasLaborales: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
      telefono: '555-0001',
      email: 'info@gymsaas.com',
      direccion: 'Av. Principal 123',
      descripcionCorta: 'Tu gimnasio de confianza',
    },
  });

  console.log(`✅ Configuración de gimnasio creada`);
}

main()
  .catch((e) => {
    console.error('❌ Error en init:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
