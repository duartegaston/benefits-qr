-- Add composite index on esPublico + deletedAt.
-- The catalog query always filters WHERE b."esPublico" = true AND b."deletedAt" IS NULL.
-- Without this index, every page load does a full table scan on Beneficio.
CREATE INDEX "Beneficio_esPublico_deletedAt_idx" ON "Beneficio"("esPublico", "deletedAt");
