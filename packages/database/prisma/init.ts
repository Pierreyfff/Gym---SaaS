import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const GIMNASIO_ID = '32f3950a-94af-4b9e-86f9-20b8dab1ef74';

  console.log('🏋️ Verificando gimnasio por defecto...');

  const gimnasio = await prisma.gimnasio.upsert({
    where: { id: GIMNASIO_ID },
    update: {},
    create: {
      id: GIMNASIO_ID,
      nombre: 'GymSaaS Demo',
      slug: 'gymsaas-demo',
    },
  });

  console.log(`✅ Gimnasio asegurado: ${gimnasio.nombre} (${gimnasio.id})`);

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.usuario.upsert({
    where: { gimnasioId_email: { gimnasioId: gimnasio.id, email: 'admin@gymdemo.com' } },
    update: {},
    create: {
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

  console.log(`✅ Admin asegurado: admin@gymdemo.com / admin123`);

  await prisma.configuracionGimnasio.upsert({
    where: { gimnasioId: gimnasio.id },
    update: {},
    create: {
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

  console.log(`✅ Configuración de gimnasio asegurada`);
}

main()
  .catch((e) => {
    console.error('❌ Error en init:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
