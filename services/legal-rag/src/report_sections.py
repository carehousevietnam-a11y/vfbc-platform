"""Shared immutable report section models for STEP10.

These models are presentation contracts only. They do not alter STEP6~9 results.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ReportMetric:
    key: str
    label: str
    value: Any
    unit: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "key": self.key,
            "label": self.label,
            "value": self.value,
            "unit": self.unit,
        }


@dataclass(frozen=True)
class ReportLink:
    label: str
    url: str

    def to_dict(self) -> dict[str, str]:
        return {"label": self.label, "url": self.url}


@dataclass
class ReportSection:
    section_id: str
    title: str
    content: str | None = None
    items: list[Any] = field(default_factory=list)
    metrics: list[ReportMetric] = field(default_factory=list)
    links: list[ReportLink] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        result: dict[str, Any] = {
            "section_id": self.section_id,
            "title": self.title,
        }
        if self.content is not None:
            result["content"] = self.content
        if self.items:
            result["items"] = list(self.items)
        if self.metrics:
            result["metrics"] = [metric.to_dict() for metric in self.metrics]
        if self.links:
            result["links"] = [link.to_dict() for link in self.links]
        return result
