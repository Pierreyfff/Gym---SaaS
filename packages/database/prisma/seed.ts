import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function determinista(base: string): string {
  return `demo-${base}`;
}

async function main() {
  // Detectar si el seed ya fue ejecutado (por los IDs deterministas)
  const yaSembrado = await prisma.plan.findFirst({
    where: { id: determinista('plan-mensual') },
  });
  if (yaSembrado) {
    console.log('🌱 Seed ya ejecutado anteriormente, saltando...');
    return;
  }

  console.log('🌱 Iniciando seed de la base de datos...');

  const gimnasio = await prisma.gimnasio.findFirst();
  if (!gimnasio) {
    console.error('❌ No se encontró ningún gimnasio');
    return;
  }

  console.log(`✅ Gimnasio encontrado: ${gimnasio.nombre}`);

  const hashedPassword = await bcrypt.hash('demo123', 10);

  const admin = await prisma.usuario.findFirst({
    where: { gimnasioId: gimnasio.id, rol: 'admin' },
  });
  if (!admin) {
    console.error('❌ No se encontró usuario admin');
    return;
  }

  // 1. USUARIOS
  console.log('\n📝 Creando usuarios...');
  const recepcionista = await prisma.usuario.upsert({
    where: { gimnasioId_email: { gimnasioId: gimnasio.id, email: 'recepcion@gymdemo.com' } },
    update: {},
    create: {
      email: 'recepcion@gymdemo.com', contrasenaHash: hashedPassword,
      nombre: 'María', apellido: 'Rodríguez', telefono: '555-0102',
      rol: 'recepcionista', estado: 'activo', gimnasioId: gimnasio.id,
    },
  });
  const entrenador = await prisma.usuario.upsert({
    where: { gimnasioId_email: { gimnasioId: gimnasio.id, email: 'entrenador@gymdemo.com' } },
    update: {},
    create: {
      email: 'entrenador@gymdemo.com', contrasenaHash: hashedPassword,
      nombre: 'Carlos', apellido: 'Fernández', telefono: '555-0103',
      rol: 'entrenador', estado: 'activo', gimnasioId: gimnasio.id,
    },
  });
  console.log(`✅ Usuarios asegurados: ${recepcionista.email}, ${entrenador.email}`);

  // 2. PLANES
  console.log('\n📋 Creando planes...');
  const planMensual = await prisma.plan.upsert({
    where: { id: determinista('plan-mensual') },
    update: {}, create: {
      id: determinista('plan-mensual'), nombre: 'Plan Mensual Básico',
      descripcion: 'Acceso completo al gimnasio por 30 días',
      duracionDias: 30, precio: 49.99, gimnasioId: gimnasio.id,
    },
  });
  const planTrimestral = await prisma.plan.upsert({
    where: { id: determinista('plan-trimestral') },
    update: {}, create: {
      id: determinista('plan-trimestral'), nombre: 'Plan Trimestral',
      descripcion: 'Acceso completo por 90 días con descuento',
      duracionDias: 90, precio: 129.99, gimnasioId: gimnasio.id,
    },
  });
  const planAnual = await prisma.plan.upsert({
    where: { id: determinista('plan-anual') },
    update: {}, create: {
      id: determinista('plan-anual'), nombre: 'Plan Anual Premium',
      descripcion: 'Acceso completo por 365 días + clases grupales',
      duracionDias: 365, precio: 499.99, gimnasioId: gimnasio.id,
    },
  });
  console.log(`✅ Planes asegurados: ${planMensual.nombre}, ${planTrimestral.nombre}, ${planAnual.nombre}`);

  // 3. CLIENTES
  console.log('\n👥 Creando clientes...');
  const cliente1 = await prisma.usuario.upsert({
    where: { gimnasioId_email: { gimnasioId: gimnasio.id, email: 'juan.perez@ejemplo.com' } },
    update: {}, create: {
      email: 'juan.perez@ejemplo.com', contrasenaHash: hashedPassword,
      nombre: 'Juan', apellido: 'Pérez', telefono: '555-0201',
      rol: 'cliente', estado: 'activo', gimnasioId: gimnasio.id,
      perfilCliente: { create: { fechaNacimiento: new Date('1990-05-15'), genero: 'masculino', notas: 'Cliente regular' } },
    },
  });
  const cliente2 = await prisma.usuario.upsert({
    where: { gimnasioId_email: { gimnasioId: gimnasio.id, email: 'laura.gomez@ejemplo.com' } },
    update: {}, create: {
      email: 'laura.gomez@ejemplo.com', contrasenaHash: hashedPassword,
      nombre: 'Laura', apellido: 'Gómez', telefono: '555-0202',
      rol: 'cliente', estado: 'activo', gimnasioId: gimnasio.id,
      perfilCliente: { create: { fechaNacimiento: new Date('1995-08-22'), genero: 'femenino', notas: 'Interesada en clases de spinning' } },
    },
  });
  const cliente3 = await prisma.usuario.upsert({
    where: { gimnasioId_email: { gimnasioId: gimnasio.id, email: 'miguel.torres@ejemplo.com' } },
    update: {}, create: {
      email: 'miguel.torres@ejemplo.com', contrasenaHash: hashedPassword,
      nombre: 'Miguel', apellido: 'Torres', telefono: '555-0203',
      rol: 'cliente', estado: 'activo', gimnasioId: gimnasio.id,
      perfilCliente: { create: { fechaNacimiento: new Date('1988-03-10'), genero: 'masculino', notas: 'Ex-atleta' } },
    },
  });
  console.log(`✅ Clientes asegurados: ${cliente1.nombre}, ${cliente2.nombre}, ${cliente3.nombre}`);

  // 4. MEMBRESÍAS
  console.log('\n💳 Creando membresías...');
  const hoy = new Date();
  const en30Dias = new Date(Date.now() + 30 * 86400000);
  const en90Dias = new Date(Date.now() + 90 * 86400000);
  const hace10Dias = new Date(Date.now() - 10 * 86400000);

  await prisma.membresia.upsert({
    where: { id: determinista('memb-juan') },
    update: {}, create: {
      id: determinista('memb-juan'), clienteId: cliente1.id, planId: planMensual.id,
      gimnasioId: gimnasio.id, fechaInicio: hoy, fechaFin: en30Dias, estado: 'activa',
    },
  });
  await prisma.membresia.upsert({
    where: { id: determinista('memb-laura') },
    update: {}, create: {
      id: determinista('memb-laura'), clienteId: cliente2.id, planId: planTrimestral.id,
      gimnasioId: gimnasio.id, fechaInicio: hoy, fechaFin: en90Dias, estado: 'activa',
    },
  });
  await prisma.membresia.upsert({
    where: { id: determinista('memb-miguel') },
    update: {}, create: {
      id: determinista('memb-miguel'), clienteId: cliente3.id, planId: planMensual.id,
      gimnasioId: gimnasio.id, fechaInicio: hace10Dias, fechaFin: hoy, estado: 'expirada',
    },
  });
  console.log('✅ Membresías aseguradas');

  // 5. PAGOS
  console.log('\n💰 Creando pagos...');
  const membJuan = await prisma.membresia.findFirst({ where: { id: determinista('memb-juan') } });
  const membLaura = await prisma.membresia.findFirst({ where: { id: determinista('memb-laura') } });
  if (membJuan) {
    await prisma.pago.upsert({
      where: { id: determinista('pago-juan') }, update: {}, create: {
        id: determinista('pago-juan'), gimnasioId: gimnasio.id, membresiaId: membJuan.id,
        clienteId: cliente1.id, tipo: 'membresia', monto: planMensual.precio,
        metodoPago: 'efectivo', fechaPago: hoy, nota: 'Pago inicial plan mensual',
      },
    });
  }
  if (membLaura) {
    await prisma.pago.upsert({
      where: { id: determinista('pago-laura') }, update: {}, create: {
        id: determinista('pago-laura'), gimnasioId: gimnasio.id, membresiaId: membLaura.id,
        clienteId: cliente2.id, tipo: 'membresia', monto: planTrimestral.precio,
        metodoPago: 'tarjeta', fechaPago: hoy, nota: 'Pago plan trimestral',
      },
    });
  }
  console.log('✅ Pagos asegurados');

  // 6. CATEGORÍAS
  console.log('\n📦 Creando categorías...');
  const catSups = await prisma.categoriaProducto.upsert({
    where: { id: determinista('cat-suplementos') }, update: {}, create: {
      id: determinista('cat-suplementos'), gimnasioId: gimnasio.id,
      nombre: 'Suplementos', descripcion: 'Proteínas, creatina, aminoácidos y más',
    },
  });
  const catAcc = await prisma.categoriaProducto.upsert({
    where: { id: determinista('cat-accesorios') }, update: {}, create: {
      id: determinista('cat-accesorios'), gimnasioId: gimnasio.id,
      nombre: 'Accesorios', descripcion: 'Guantes, straps, cinturones y equipamiento',
    },
  });
  const catRopa = await prisma.categoriaProducto.upsert({
    where: { id: determinista('cat-ropa') }, update: {}, create: {
      id: determinista('cat-ropa'), gimnasioId: gimnasio.id,
      nombre: 'Ropa Deportiva', descripcion: 'Camisetas, shorts y ropa de entrenamiento',
    },
  });
  console.log('✅ Categorías aseguradas');

  // 7. PRODUCTOS
  console.log('\n🛍️ Creando productos...');
  const prod = (id: string, data: any) => prisma.producto.upsert({
    where: { id: determinista(id) }, update: {}, create: { id: determinista(id), ...data },
  });

  const p1 = await prod('whey', {
    gimnasioId: gimnasio.id, categoriaId: catSups.id,
    nombre: 'Proteína Whey 1kg', descripcion: 'Proteína de suero de leche concentrada, sabor chocolate',
    precio: 45.99, stock: 25, stockMinimo: 5, estado: 'activo',
    imagenUrl: 'https://images.pexels.com/photos/4162483/pexels-photo-4162483.jpeg?auto=compress&cs=tinysrgb&w=400',
  });
  const p2 = await prod('creatina', {
    gimnasioId: gimnasio.id, categoriaId: catSups.id,
    nombre: 'Creatina Monohidrato 300g', descripcion: 'Creatina pura micronizada para aumento de fuerza',
    precio: 25.5, stock: 15, stockMinimo: 5, estado: 'activo',
    imagenUrl: 'https://images.pexels.com/photos/4058218/pexels-photo-4058218.jpeg?auto=compress&cs=tinysrgb&w=400',
  });
  const p3 = await prod('guantes', {
    gimnasioId: gimnasio.id, categoriaId: catAcc.id,
    nombre: 'Guantes de Entrenamiento', descripcion: 'Guantes acolchados para levantamiento de pesas',
    precio: 15.0, stock: 30, stockMinimo: 10, estado: 'activo',
    imagenUrl: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=400',
  });
  const p4 = await prod('shaker', {
    gimnasioId: gimnasio.id, categoriaId: catAcc.id,
    nombre: 'Shaker 600ml', descripcion: 'Botella mezcladora con compartimentos para suplementos',
    precio: 8.99, stock: 50, stockMinimo: 15, estado: 'activo',
    imagenUrl: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400',
  });
  const p5 = await prod('preworkout', {
    gimnasioId: gimnasio.id, categoriaId: catSups.id,
    nombre: 'Pre-Workout Extreme', descripcion: 'Fórmula pre-entreno con cafeína y beta-alanina',
    precio: 32.0, stock: 3, stockMinimo: 5, estado: 'activo',
    imagenUrl: 'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg?auto=compress&cs=tinysrgb&w=400',
  });
  const p6 = await prod('camiseta', {
    gimnasioId: gimnasio.id, categoriaId: catRopa.id,
    nombre: 'Camiseta Deportiva GymSaaS', descripcion: 'Camiseta técnica transpirable con logo del gimnasio',
    precio: 19.99, stock: 40, stockMinimo: 10, estado: 'activo',
    imagenUrl: 'https://images.pexels.com/photos/8436615/pexels-photo-8436615.jpeg?auto=compress&cs=tinysrgb&w=400',
  });
  console.log('✅ Productos asegurados');

  // 8. VENTAS
  console.log('\n💸 Creando ventas...');
  const hace5Dias = new Date(Date.now() - 5 * 86400000);
  const hace3Dias = new Date(Date.now() - 3 * 86400000);
  const hace2Dias = new Date(Date.now() - 2 * 86400000);
  const ayer = new Date(Date.now() - 86400000);

  const venta = async (id: string, data: any, prodId: string, cant: number, stockAnt: number) => {
    await prisma.ventaProducto.upsert({
      where: { id: determinista(id) }, update: {}, create: { id: determinista(id), ...data },
    });
    await prisma.movimientoInventario.upsert({
      where: { id: determinista(`mov-${id}`) }, update: {}, create: {
        id: determinista(`mov-${id}`), gimnasioId: gimnasio.id, productoId: prodId,
        tipo: 'salida', cantidad: -cant, stockAnterior: stockAnt,
        stockNuevo: stockAnt - cant, motivo: 'Venta', referencia: determinista(id),
        creadoPorId: admin.id,
      },
    });
  };

  await venta('ven-1', {
    gimnasioId: gimnasio.id, productoId: p1.id, clienteId: cliente1.id,
    cantidad: 2, precioUnitario: p1.precio, total: Number(p1.precio) * 2,
    metodoPago: 'efectivo', nota: 'Cliente frecuente', fechaVenta: hace5Dias,
  }, p1.id, 2, 25);
  await venta('ven-2', {
    gimnasioId: gimnasio.id, productoId: p2.id, clienteId: cliente2.id,
    cantidad: 1, precioUnitario: p2.precio, total: Number(p2.precio),
    metodoPago: 'tarjeta', fechaVenta: hace3Dias,
  }, p2.id, 1, 15);
  await venta('ven-3', {
    gimnasioId: gimnasio.id, productoId: p3.id, clienteId: cliente1.id,
    cantidad: 1, precioUnitario: p3.precio, total: Number(p3.precio),
    metodoPago: 'efectivo', fechaVenta: hace2Dias,
  }, p3.id, 1, 30);
  await venta('ven-4', {
    gimnasioId: gimnasio.id, productoId: p1.id,
    cantidad: 1, precioUnitario: p1.precio, total: Number(p1.precio),
    metodoPago: 'transferencia', nota: 'Venta directa sin registro de cliente', fechaVenta: ayer,
  }, p1.id, 1, 23);
  await venta('ven-5', {
    gimnasioId: gimnasio.id, productoId: p2.id, clienteId: cliente2.id,
    cantidad: 3, precioUnitario: p2.precio, total: Number(p2.precio) * 3,
    metodoPago: 'efectivo', nota: 'Compra al por mayor', fechaVenta: hoy,
  }, p2.id, 3, 14);
  await venta('ven-6', {
    gimnasioId: gimnasio.id, productoId: p4.id, clienteId: cliente3.id,
    cantidad: 2, precioUnitario: p4.precio, total: Number(p4.precio) * 2,
    metodoPago: 'tarjeta', fechaVenta: hoy,
  }, p4.id, 2, 50);
  console.log('✅ Ventas aseguradas');

  // 9. ASISTENCIAS
  console.log('\n✅ Creando asistencias...');
  await prisma.asistencia.upsert({
    where: { id: determinista('asis-juan-hoy') }, update: {}, create: {
      id: determinista('asis-juan-hoy'), gimnasioId: gimnasio.id, clienteId: cliente1.id,
      marcaTiempo: new Date(),
    },
  });
  await prisma.asistencia.upsert({
    where: { id: determinista('asis-laura-hoy') }, update: {}, create: {
      id: determinista('asis-laura-hoy'), gimnasioId: gimnasio.id, clienteId: cliente2.id,
      marcaTiempo: new Date(Date.now() - 2 * 3600000),
    },
  });
  console.log('✅ Asistencias aseguradas');

  console.log('\n🎉 ¡Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log('   - Usuarios: 2 (recepcionista, entrenador)');
  console.log('   - Planes: 3 (mensual, trimestral, anual)');
  console.log('   - Clientes: 3');
  console.log('   - Membresías: 3 (2 activas, 1 expirada)');
  console.log('   - Pagos de membresías: 2');
  console.log('   - Categorías de productos: 3');
  console.log('   - Productos: 6 (1 con stock bajo)');
  console.log('   - Ventas de productos: 6');
  console.log('   - Asistencias: 2');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
