-- CreateTable
CREATE TABLE "Rubro" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    CONSTRAINT "Rubro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rubro_nombre_key" ON "Rubro"("nombre");

-- Seed initial rubros
INSERT INTO "Rubro" ("nombre") VALUES
    ('Bar / Cafetería'),
    ('Deportes'),
    ('Electrónica'),
    ('Entretenimiento'),
    ('Farmacia'),
    ('Gym / Fitness'),
    ('Hotel / Alojamiento'),
    ('Indumentaria'),
    ('Librería / Papelería'),
    ('Restaurante'),
    ('Salón de Belleza'),
    ('Salud'),
    ('Supermercado'),
    ('Tecnología'),
    ('Otros');

-- AddColumn rubroId nullable first so we can backfill
ALTER TABLE "Local" ADD COLUMN "rubroId" INTEGER;

-- Backfill existing locals with 'Otros'
UPDATE "Local" SET "rubroId" = (SELECT "id" FROM "Rubro" WHERE "nombre" = 'Otros');

-- Make NOT NULL
ALTER TABLE "Local" ALTER COLUMN "rubroId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Local" ADD CONSTRAINT "Local_rubroId_fkey"
    FOREIGN KEY ("rubroId") REFERENCES "Rubro"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
