"""VFBCAI platform integration contracts (STEP11).

This package converts STEP10 report objects into transport-safe DTOs. It does
not depend on the VFBCAI web application, database, CRM, or PDF implementation.
"""

from .customer_report_adapter import CustomerReportDTO, adapt_customer_report
from .expert_report_adapter import ExpertReportDTO, adapt_expert_report
from .report_api import PlatformReportContext, build_platform_report_payload

__all__ = [
    "CustomerReportDTO",
    "ExpertReportDTO",
    "PlatformReportContext",
    "adapt_customer_report",
    "adapt_expert_report",
    "build_platform_report_payload",
]
