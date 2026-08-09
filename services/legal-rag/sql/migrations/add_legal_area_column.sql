-- ============================================================================
-- Migration: add legal_area to legal_documents (category / service-scoped search)
--
-- ⚠️ DO NOT run automatically. Ace executes manually in Supabase Dashboard.
-- Schema: legal_rag (see sql/create_schema.sql)
-- ============================================================================

BEGIN;

SET search_path TO legal_rag, public;

ALTER TABLE legal_rag.legal_documents
    ADD COLUMN IF NOT EXISTS legal_area text;

COMMENT ON COLUMN legal_rag.legal_documents.legal_area IS
    'vbpl.vn legal_area (or th1nhng0 linh_vuc / legacy legal_sectors) preserved at normalize time. '
    'Used to scope VFBCAI service_type searches via service_category_mapping.';

-- Optional: index for browse/filter by category (not required for in-memory pilot).
CREATE INDEX IF NOT EXISTS idx_legal_documents_legal_area
    ON legal_rag.legal_documents (legal_area);

COMMIT;
