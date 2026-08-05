-- ============================================================================
-- VFBCAI Legal Intelligence Platform — Legal Knowledge Base Schema DROP
--
-- ⚠️ legal_rag 스키마 전체를 삭제한다. 기존 VFBCAI(public 스키마 등)는
--    전혀 건드리지 않는다 — DROP SCHEMA 대상이 legal_rag 하나로 한정됨을
--    반드시 확인하고 실행할 것.
--
-- CASCADE로 legal_rag 스키마 안의 모든 테이블/인덱스/트리거/함수/확장을
-- 한 번에 제거한다. 개별 DROP TABLE 순서를 신경 쓸 필요가 없도록
-- 스키마 단위로 정리한다(순수 SQL, 별도 Migration 도구 불필요).
-- ============================================================================

DROP SCHEMA IF EXISTS legal_rag CASCADE;
