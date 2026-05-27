import { PrismaClient } from '@gym-saas/database';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creando perfiles faltantes...\n');

  const clientes = await prisma.usuario.findMany({
    where: { rol: 'cliente' },
    include: { perfilCliente: true },
  });

  let created = 0;

  for (const cliente of clientes) {
    if (!cliente.perfilCliente) {
      await prisma.perfilCliente.create({
        data: {
          usuarioId: cliente.id,
        },
      });
      console.log(`✅ Perfil creado para:  ${cliente.nombre} ${cliente.apellido}`);
      created++;
    }
  }

  console.log(`\n✅ Completado: ${created} perfiles creados`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });