"""VFBCAI service integration layer (STEP12)."""

from .report_service import (
    IntegrationContext,
    IntegratedReportBundle,
    build_service_integration_bundle,
)

__all__ = [
    "IntegrationContext",
    "IntegratedReportBundle",
    "build_service_integration_bundle",
]
