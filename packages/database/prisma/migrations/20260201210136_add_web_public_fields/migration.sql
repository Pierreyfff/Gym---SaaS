-- AlterTable
ALTER TABLE "configuraciones_gimnasio" ADD COLUMN     "descripcionCorta" TEXT,
ADD COLUMN     "descripcionLarga" TEXT,
ADD COLUMN     "imagenHero" TEXT,
ADD COLUMN     "imagenesCarrusel" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "mapaLatitud" TEXT,
ADD COLUMN     "mapaLongitud" TEXT,
ADD COLUMN     "misionVision" TEXT,
ADD COLUMN     "tiktok" TEXT,
ADD COLUMN     "whatsapp" TEXT,
ADD COLUMN     "youtube" TEXT;
