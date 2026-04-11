import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Obtener el gimnasio existente
  const gimnasio = await prisma.gimnasio.findFirst();

  if (!gimnasio) {
    console.error('❌ No se encontró ningún gimnasio');
    return;
  }

  console.log(`✅ Gimnasio encontrado: ${gimnasio.nombre}`);

  // 1. CREAR USUARIOS ADICIONALES
  console.log('\n📝 Creando usuarios...');

  const hashedPassword = await bcrypt.hash('demo123', 10);

  // Admin (para usar en movimientos de inventario)
  const admin = await prisma.usuario.findFirst({
    where: { gimnasioId: gimnasio.id, rol: 'admin' },
  });

  if (!admin) {
    console.error('❌ No se encontró usuario admin');
    return;
  }

  // Recepcionista
  const recepcionista = await prisma.usuario.upsert({
    where: {
      gimnasioId_email: {
        gimnasioId: gimnasio.id,
        email: 'recepcion@gymdemo.com',
      },
    },
    update: {},
    create: {
      email: 'recepcion@gymdemo.com',
      contrasenaHash: hashedPassword,
      nombre: 'María',
      apellido: 'Rodríguez',
      telefono: '555-0102',
      rol: 'recepcionista',
      estado: 'activo',
      gimnasioId: gimnasio.id,
    },
  });

  // Entrenador
  const entrenador = await prisma.usuario.upsert({
    where: {
      gimnasioId_email: {
        gimnasioId: gimnasio.id,
        email: 'entrenador@gymdemo.com',
      },
    },
    update: {},
    create: {
      email: 'entrenador@gymdemo.com',
      contrasenaHash: hashedPassword,
      nombre: 'Carlos',
      apellido: 'Fernández',
      telefono: '555-0103',
      rol: 'entrenador',
      estado: 'activo',
      gimnasioId: gimnasio.id,
    },
  });

  console.log(`✅ Usuario recepcionista creado: ${recepcionista.email}`);
  console.log(`✅ Usuario entrenador creado: ${entrenador.email}`);

  // 2. CREAR PLANES
  console.log('\n📋 Creando planes...');

  const planMensual = await prisma.plan.upsert({
    where: { id: 'plan-mensual-001' },
    update: {},
    create: {
      id: 'plan-mensual-001',
      nombre: 'Plan Mensual Básico',
      descripcion: 'Acceso completo al gimnasio por 30 días',
      duracionDias: 30,
      precio: 49.99,
      gimnasioId: gimnasio.id,
    },
  });

  const planTrimestral = await prisma.plan.upsert({
    where: { id: 'plan-trimestral-001' },
    update: {},
    create: {
      id: 'plan-trimestral-001',
      nombre: 'Plan Trimestral',
      descripcion: 'Acceso completo por 90 días con descuento',
      duracionDias: 90,
      precio: 129.99,
      gimnasioId: gimnasio.id,
    },
  });

  const planAnual = await prisma.plan.upsert({
    where: { id: 'plan-anual-001' },
    update: {},
    create: {
      id: 'plan-anual-001',
      nombre: 'Plan Anual Premium',
      descripcion: 'Acceso completo por 365 días + clases grupales',
      duracionDias: 365,
      precio: 499.99,
      gimnasioId: gimnasio.id,
    },
  });

  console.log(`✅ Plan creado: ${planMensual.nombre} - $${planMensual.precio}`);
  console.log(
    `✅ Plan creado: ${planTrimestral.nombre} - $${planTrimestral.precio}`,
  );
  console.log(`✅ Plan creado: ${planAnual.nombre} - $${planAnual.precio}`);

  // 3. CREAR CLIENTES
  console.log('\n👥 Creando clientes...');

  const cliente1 = await prisma.usuario.upsert({
    where: {
      gimnasioId_email: {
        gimnasioId: gimnasio.id,
        email: 'juan.perez@ejemplo.com',
      },
    },
    update: {},
    create: {
      email: 'juan.perez@ejemplo.com',
      contrasenaHash: hashedPassword,
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '555-0201',
      rol: 'cliente',
      estado: 'activo',
      gimnasioId: gimnasio.id,
      perfilCliente: {
        create: {
          fechaNacimiento: new Date('1990-05-15'),
          genero: 'masculino',
          notas: 'Cliente regular desde hace 2 meses',
        },
      },
    },
  });

  const cliente2 = await prisma.usuario.upsert({
    where: {
      gimnasioId_email: {
        gimnasioId: gimnasio.id,
        email: 'laura.gomez@ejemplo.com',
      },
    },
    update: {},
    create: {
      email: 'laura.gomez@ejemplo.com',
      contrasenaHash: hashedPassword,
      nombre: 'Laura',
      apellido: 'Gómez',
      telefono: '555-0202',
      rol: 'cliente',
      estado: 'activo',
      gimnasioId: gimnasio.id,
      perfilCliente: {
        create: {
          fechaNacimiento: new Date('1995-08-22'),
          genero: 'femenino',
          notas: 'Interesada en clases de spinning',
        },
      },
    },
  });

  const cliente3 = await prisma.usuario.upsert({
    where: {
      gimnasioId_email: {
        gimnasioId: gimnasio.id,
        email: 'miguel.torres@ejemplo.com',
      },
    },
    update: {},
    create: {
      email: 'miguel.torres@ejemplo.com',
      contrasenaHash: hashedPassword,
      nombre: 'Miguel',
      apellido: 'Torres',
      telefono: '555-0203',
      rol: 'cliente',
      estado: 'activo',
      gimnasioId: gimnasio.id,
      perfilCliente: {
        create: {
          fechaNacimiento: new Date('1988-03-10'),
          genero: 'masculino',
          notas: 'Ex-atleta, necesita rutina personalizada',
        },
      },
    },
  });

  console.log(`✅ Cliente creado: ${cliente1.nombre} ${cliente1.apellido}`);
  console.log(`✅ Cliente creado: ${cliente2.nombre} ${cliente2.apellido}`);
  console.log(`✅ Cliente creado: ${cliente3.nombre} ${cliente3.apellido}`);

  // 4. CREAR MEMBRESÍAS
  console.log('\n💳 Creando membresías...');

  const hoy = new Date();
  const en30Dias = new Date();
  en30Dias.setDate(hoy.getDate() + 30);

  const en90Dias = new Date();
  en90Dias.setDate(hoy.getDate() + 90);

  const hace10Dias = new Date();
  hace10Dias.setDate(hoy.getDate() - 10);

  // Membresía activa para Juan (Plan Mensual)
  const membresia1 = await prisma.membresia.create({
    data: {
      clienteId: cliente1.id,
      planId: planMensual.id,
      gimnasioId: gimnasio.id,
      fechaInicio: hoy,
      fechaFin: en30Dias,
      estado: 'activa',
    },
  });

  // Membresía activa para Laura (Plan Trimestral)
  const membresia2 = await prisma.membresia.create({
    data: {
      clienteId: cliente2.id,
      planId: planTrimestral.id,
      gimnasioId: gimnasio.id,
      fechaInicio: hoy,
      fechaFin: en90Dias,
      estado: 'activa',
    },
  });

  // Membresía expirada para Miguel
  const membresia3 = await prisma.membresia.create({
    data: {
      clienteId: cliente3.id,
      planId: planMensual.id,
      gimnasioId: gimnasio.id,
      fechaInicio: hace10Dias,
      fechaFin: hoy,
      estado: 'expirada',
    },
  });

  console.log(`✅ Membresía activa creada para ${cliente1.nombre}`);
  console.log(`✅ Membresía activa creada para ${cliente2.nombre}`);
  console.log(`✅ Membresía expirada creada para ${cliente3.nombre}`);

  // 5. CREAR PAGOS DE MEMBRESÍAS
  console.log('\n💰 Creando pagos de membresías...');

  await prisma.pago.create({
    data: {
      gimnasioId: gimnasio.id,
      membresiaId: membresia1.id,
      clienteId: cliente1.id,
      tipo: 'membresia',
      monto: planMensual.precio,
      metodoPago: 'efectivo',
      fechaPago: hoy,
      nota: 'Pago inicial plan mensual',
    },
  });

  await prisma.pago.create({
    data: {
      gimnasioId: gimnasio.id,
      membresiaId: membresia2.id,
      clienteId: cliente2.id,
      tipo: 'membresia',
      monto: planTrimestral.precio,
      metodoPago: 'tarjeta',
      fechaPago: hoy,
      nota: 'Pago plan trimestral',
    },
  });

  console.log('✅ Pagos de membresías registrados');

  // 6. CREAR CATEGORÍAS DE PRODUCTOS
  console.log('\n📦 Creando categorías de productos...');

  const categoriaSuplementos = await prisma.categoriaProducto.create({
    data: {
      gimnasioId: gimnasio.id,
      nombre: 'Suplementos',
      descripcion: 'Proteínas, creatina, aminoácidos y más',
    },
  });

  const categoriaAccesorios = await prisma.categoriaProducto.create({
    data: {
      gimnasioId: gimnasio.id,
      nombre: 'Accesorios',
      descripcion: 'Guantes, straps, cinturones y equipamiento',
    },
  });

  const categoriaRopa = await prisma.categoriaProducto.create({
    data: {
      gimnasioId: gimnasio.id,
      nombre: 'Ropa Deportiva',
      descripcion: 'Camisetas, shorts y ropa de entrenamiento',
    },
  });

  console.log(`✅ Categoría creada: ${categoriaSuplementos.nombre}`);
  console.log(`✅ Categoría creada: ${categoriaAccesorios.nombre}`);
  console.log(`✅ Categoría creada: ${categoriaRopa.nombre}`);

  // 7. CREAR PRODUCTOS
  console.log('\n🛍️ Creando productos...');

  const producto1 = await prisma.producto.create({
    data: {
      gimnasioId: gimnasio.id,
      categoriaId: categoriaSuplementos.id,
      nombre: 'Proteína Whey 1kg',
      descripcion: 'Proteína de suero de leche concentrada, sabor chocolate',
      precio: 45.99,
      stock: 25,
      stockMinimo: 5,
      imagenUrl:
        'https://images.pexels.com/photos/4162483/pexels-photo-4162483.jpeg?auto=compress&cs=tinysrgb&w=400',
      estado: 'activo',
    },
  });

  const producto2 = await prisma.producto.create({
    data: {
      gimnasioId: gimnasio.id,
      categoriaId: categoriaSuplementos.id,
      nombre: 'Creatina Monohidrato 300g',
      descripcion: 'Creatina pura micronizada para aumento de fuerza',
      precio: 25.5,
      stock: 15,
      stockMinimo: 5,
      imagenUrl:
        'https://images.pexels.com/photos/4058218/pexels-photo-4058218.jpeg?auto=compress&cs=tinysrgb&w=400',
      estado: 'activo',
    },
  });

  const producto3 = await prisma.producto.create({
    data: {
      gimnasioId: gimnasio.id,
      categoriaId: categoriaAccesorios.id,
      nombre: 'Guantes de Entrenamiento',
      descripcion: 'Guantes acolchados para levantamiento de pesas',
      precio: 15.0,
      stock: 30,
      stockMinimo: 10,
      imagenUrl:
        'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=400',
      estado: 'activo',
    },
  });

  const producto4 = await prisma.producto.create({
    data: {
      gimnasioId: gimnasio.id,
      categoriaId: categoriaAccesorios.id,
      nombre: 'Shaker 600ml',
      descripcion: 'Botella mezcladora con compartimentos para suplementos',
      precio: 8.99,
      stock: 50,
      stockMinimo: 15,
      imagenUrl:
        'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400',
      estado: 'activo',
    },
  });

  const producto5 = await prisma.producto.create({
    data: {
      gimnasioId: gimnasio.id,
      categoriaId: categoriaSuplementos.id,
      nombre: 'Pre-Workout Extreme',
      descripcion: 'Fórmula pre-entreno con cafeína y beta-alanina',
      precio: 32.0,
      stock: 3,
      stockMinimo: 5,
      imagenUrl:
        'https://images.pexels.com/photos/3771120/pexels-photo-3771120.jpeg?auto=compress&cs=tinysrgb&w=400',
      estado: 'activo',
    },
  });

  const producto6 = await prisma.producto.create({
    data: {
      gimnasioId: gimnasio.id,
      categoriaId: categoriaRopa.id,
      nombre: 'Camiseta Deportiva GymSaaS',
      descripcion: 'Camiseta técnica transpirable con logo del gimnasio',
      precio: 19.99,
      stock: 40,
      stockMinimo: 10,
      imagenUrl:
        'https://images.pexels.com/photos/8436615/pexels-photo-8436615.jpeg?auto=compress&cs=tinysrgb&w=400',
      estado: 'activo',
    },
  });

  console.log(
    `✅ Producto creado: ${producto1.nombre} - Stock: ${producto1.stock}`,
  );
  console.log(
    `✅ Producto creado: ${producto2.nombre} - Stock: ${producto2.stock}`,
  );
  console.log(
    `✅ Producto creado: ${producto3.nombre} - Stock: ${producto3.stock}`,
  );
  console.log(
    `✅ Producto creado: ${producto4.nombre} - Stock: ${producto4.stock}`,
  );
  console.log(
    `✅ Producto creado:  ${producto5.nombre} - Stock: ${producto5.stock} ⚠️  (BAJO STOCK)`,
  );
  console.log(
    `✅ Producto creado: ${producto6.nombre} - Stock: ${producto6.stock}`,
  );

  // 8. CREAR VENTAS DE PRODUCTOS
  console.log('\n💸 Creando ventas de productos...');

  const hace5Dias = new Date();
  hace5Dias.setDate(hoy.getDate() - 5);

  const hace3Dias = new Date();
  hace3Dias.setDate(hoy.getDate() - 3);

  const hace2Dias = new Date();
  hace2Dias.setDate(hoy.getDate() - 2);

  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);

  // Venta 1: Juan compra proteína (hace 5 días)
  const venta1 = await prisma.ventaProducto.create({
    data: {
      gimnasioId: gimnasio.id,
      productoId: producto1.id,
      clienteId: cliente1.id,
      cantidad: 2,
      precioUnitario: producto1.precio,
      total: Number(producto1.precio) * 2, // ← AGREGAR Number()
      metodoPago: 'efectivo',
      nota: 'Cliente frecuente',
      fechaVenta: hace5Dias,
    },
  });

  // Actualizar stock y registrar movimiento
  await prisma.producto.update({
    where: { id: producto1.id },
    data: { stock: { decrement: 2 } },
  });

  await prisma.movimientoInventario.create({
    data: {
      gimnasioId: gimnasio.id,
      productoId: producto1.id,
      tipo: 'salida',
      cantidad: -2,
      stockAnterior: 25,
      stockNuevo: 23,
      motivo: 'Venta',
      referencia: venta1.id,
      creadoPorId: admin.id,
    },
  });

  // Venta 2: Laura compra creatina (hace 3 días)
  const venta2 = await prisma.ventaProducto.create({
    data: {
      gimnasioId: gimnasio.id,
      productoId: producto2.id,
      clienteId: cliente2.id,
      cantidad: 1,
      precioUnitario: producto2.precio,
      total: Number(producto2.precio), // ← AGREGAR Number()
      metodoPago: 'tarjeta',
      fechaVenta: hace3Dias,
    },
  });

  await prisma.producto.update({
    where: { id: producto2.id },
    data: { stock: { decrement: 1 } },
  });

  await prisma.movimientoInventario.create({
    data: {
      gimnasioId: gimnasio.id,
      productoId: producto2.id,
      tipo: 'salida',
      cantidad: -1,
      stockAnterior: 15,
      stockNuevo: 14,
      motivo: 'Venta',
      referencia: venta2.id,
      creadoPorId: admin.id,
    },
  });

  // Venta 3: Juan compra guantes (hace 2 días)
  const venta3 = await prisma.ventaProducto.create({
    data: {
      gimnasioId: gimnasio.id,
      productoId: producto3.id,
      clienteId: cliente1.id,
      cantidad: 1,
      precioUnitario: producto3.precio,
      total: Number(producto3.precio), // ← AGREGAR Number()
      metodoPago: 'efectivo',
      fechaVenta: hace2Dias,
    },
  });

  await prisma.producto.update({
    where: { id: producto3.id },
    data: { stock: { decrement: 1 } },
  });

  await prisma.movimientoInventario.create({
    data: {
      gimnasioId: gimnasio.id,
      productoId: producto3.id,
      tipo: 'salida',
      cantidad: -1,
      stockAnterior: 30,
      stockNuevo: 29,
      motivo: 'Venta',
      referencia: venta3.id,
      creadoPorId: admin.id,
    },
  });

  // Venta 4: Venta directa proteína (ayer)
  const venta4 = await prisma.ventaProducto.create({
    data: {
      gimnasioId: gimnasio.id,
      productoId: producto1.id,
      cantidad: 1,
      precioUnitario: producto1.precio,
      total: Number(producto1.precio), // ← AGREGAR Number()
      metodoPago: 'transferencia',
      nota: 'Venta directa sin registro de cliente',
      fechaVenta: ayer,
    },
  });

  await prisma.producto.update({
    where: { id: producto1.id },
    data: { stock: { decrement: 1 } },
  });

  await prisma.movimientoInventario.create({
    data: {
      gimnasioId: gimnasio.id,
      productoId: producto1.id,
      tipo: 'salida',
      cantidad: -1,
      stockAnterior: 23,
      stockNuevo: 22,
      motivo: 'Venta',
      referencia: venta4.id,
      creadoPorId: admin.id,
    },
  });

  // Venta 5: Laura compra 3 creatinas (hoy)
  const venta5 = await prisma.ventaProducto.create({
    data: {
      gimnasioId: gimnasio.id,
      productoId: producto2.id,
      clienteId: cliente2.id,
      cantidad: 3,
      precioUnitario: producto2.precio,
      total: Number(producto2.precio) * 3, // ← AGREGAR Number()
      metodoPago: 'efectivo',
      nota: 'Compra al por mayor',
      fechaVenta: hoy,
    },
  });

  await prisma.producto.update({
    where: { id: producto2.id },
    data: { stock: { decrement: 3 } },
  });

  await prisma.movimientoInventario.create({
    data: {
      gimnasioId: gimnasio.id,
      productoId: producto2.id,
      tipo: 'salida',
      cantidad: -3,
      stockAnterior: 14,
      stockNuevo: 11,
      motivo: 'Venta',
      referencia: venta5.id,
      creadoPorId: admin.id,
    },
  });

  // Venta 6: Miguel compra shaker (hoy)
  const venta6 = await prisma.ventaProducto.create({
    data: {
      gimnasioId: gimnasio.id,
      productoId: producto4.id,
      clienteId: cliente3.id,
      cantidad: 2,
      precioUnitario: producto4.precio,
      total: Number(producto4.precio) * 2, // ← AGREGAR Number()
      metodoPago: 'tarjeta',
      fechaVenta: hoy,
    },
  });

  await prisma.producto.update({
    where: { id: producto4.id },
    data: { stock: { decrement: 2 } },
  });

  await prisma.movimientoInventario.create({
    data: {
      gimnasioId: gimnasio.id,
      productoId: producto4.id,
      tipo: 'salida',
      cantidad: -2,
      stockAnterior: 50,
      stockNuevo: 48,
      motivo: 'Venta',
      referencia: venta6.id,
      creadoPorId: admin.id,
    },
  });

  console.log('✅ Ventas de productos registradas (6 ventas)');

  // 9. CREAR ALGUNAS ASISTENCIAS
  console.log('\n✅ Creando asistencias...');

  // Asistencias de hoy
  await prisma.asistencia.create({
    data: {
      gimnasioId: gimnasio.id,
      clienteId: cliente1.id,
      marcaTiempo: new Date(),
    },
  });

  await prisma.asistencia.create({
    data: {
      gimnasioId: gimnasio.id,
      clienteId: cliente2.id,
      marcaTiempo: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
    },
  });

  console.log('✅ Asistencias registradas');

  console.log('\n🎉 ¡Seed completado exitosamente!');
  console.log('\n📊 Resumen: ');
  console.log(`   - Usuarios:  2 (recepcionista, entrenador)`);
  console.log(`   - Planes: 3 (mensual, trimestral, anual)`);
  console.log(`   - Clientes: 3`);
  console.log(`   - Membresías: 3 (2 activas, 1 expirada)`);
  console.log(`   - Pagos de membresías: 2`);
  console.log(`   - Categorías de productos: 3`);
  console.log(`   - Productos: 6 (1 con stock bajo)`);
  console.log(`   - Ventas de productos: 6`);
  console.log(`   - Asistencias: 2`);
  console.log(`\n💰 Ingresos totales:`);
  console.log(`   - Membresías: $${(49.99 + 129.99).toFixed(2)}`);
  console.log(
    `   - Ventas:  $${(45.99 * 2 + 25.5 + 15.0 + 45.99 + 25.5 * 3 + 8.99 * 2).toFixed(2)}`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
