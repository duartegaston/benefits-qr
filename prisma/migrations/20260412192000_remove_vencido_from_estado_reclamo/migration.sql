BEGIN;

ALTER TABLE "Reclamo" ALTER COLUMN "estado" DROP DEFAULT;

UPDATE "Reclamo"
SET "estado" = 'PENDIENTE'
WHERE "estado"::text = 'VENCIDO';

CREATE TYPE "EstadoReclamo_new" AS ENUM ('PENDIENTE', 'CANJEADO', 'CANCELADO');

ALTER TABLE "Reclamo"
ALTER COLUMN "estado"
TYPE "EstadoReclamo_new"
USING ("estado"::text::"EstadoReclamo_new");

ALTER TYPE "EstadoReclamo" RENAME TO "EstadoReclamo_old";
ALTER TYPE "EstadoReclamo_new" RENAME TO "EstadoReclamo";
DROP TYPE "EstadoReclamo_old";

ALTER TABLE "Reclamo" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';

COMMIT;
