"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { ACCOUNTING_ROUTES } from "@/lib/accounting/accountingNav";
import { accountingMessage, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";
import type { AccountingLocale } from "@/lib/accounting/uiCatalog";
import {
  HubIconAgent,
  HubIconApply,
  HubIconConsult,
  HubIconDeclare,
  HubIconInquiry,
  HubIconProof,
  ShortcutIconCalendar,
  ShortcutIconEvidence,
  ShortcutIconExcel,
  ShortcutIconReceipt,
  ShortcutIconSettings,
  ShortcutIconTxn,
} from "./AccountingHomeHubIcons";

type MenuLink = { labelKey: AccountingMessageKey; href: string };

type HubTile = {
  id: string;
  labelKey: AccountingMessageKey;
  icon: ComponentType<{ className?: string }>;
  links: MenuLink[];
};

type Props = {
  lang: AccountingLocale;
  expertReviewPeriodKey?: string | null;
};

export function AccountingHomeHub({ lang, expertReviewPeriodKey }: Props) {
  const router = useRouter();
  const t = useCallback((key: AccountingMessageKey) => accountingMessage(lang, key), [lang]);
  const [query, setQuery] = useState("");
  const [openTile, setOpenTile] = useState<string | null>(null);

  const tiles: HubTile[] = useMemo(
    () => [
      {
        id: "inquiry",
        labelKey: "accounting.home.hub.tile.inquiry",
        icon: HubIconInquiry,
        links: [
          { labelKey: "accounting.nav.ledger", href: ACCOUNTING_ROUTES.ledger },
          { labelKey: "accounting.nav.evidence", href: ACCOUNTING_ROUTES.evidence },
          { labelKey: "accounting.nav.filing", href: ACCOUNTING_ROUTES.filing },
        ],
      },
      {
        id: "proof",
        labelKey: "accounting.home.hub.tile.proof",
        icon: HubIconProof,
        links: [
          { labelKey: "accounting.nav.ledger", href: ACCOUNTING_ROUTES.ledger },
          { labelKey: "accounting.nav.filing", href: ACCOUNTING_ROUTES.filing },
        ],
      },
      {
        id: "apply",
        labelKey: "accounting.home.hub.tile.apply",
        icon: HubIconApply,
        links: [{ labelKey: "accounting.nav.transactions", href: ACCOUNTING_ROUTES.transactions }],
      },
      {
        id: "declare",
        labelKey: "accounting.home.hub.tile.declare",
        icon: HubIconDeclare,
        links: [
          { labelKey: "accounting.nav.tax", href: ACCOUNTING_ROUTES.tax },
          { labelKey: "accounting.nav.filing", href: ACCOUNTING_ROUTES.filing },
        ],
      },
      {
        id: "consult",
        labelKey: "accounting.home.hub.tile.consult",
        icon: HubIconConsult,
        links: [
          {
            labelKey: "accounting.home.hub.link.expert_review",
            href: expertReviewPeriodKey
              ? `${ACCOUNTING_ROUTES.tax}?periodKey=${encodeURIComponent(expertReviewPeriodKey)}`
              : ACCOUNTING_ROUTES.tax,
          },
          { labelKey: "accounting.nav.filing", href: ACCOUNTING_ROUTES.filing },
        ],
      },
      {
        id: "agent",
        labelKey: "accounting.home.hub.tile.agent",
        icon: HubIconAgent,
        links: [{ labelKey: "accounting.home.hub.link.tax_agent", href: ACCOUNTING_ROUTES.tax }],
      },
    ],
    [expertReviewPeriodKey]
  );

  const searchCatalog = useMemo(() => {
    const items: { labelKey: AccountingMessageKey; href: string; text: string }[] = [];
    for (const tile of tiles) {
      for (const link of tile.links) {
        items.push({ ...link, text: `${t(tile.labelKey)} ${t(link.labelKey)}` });
      }
    }
    const navKeys: AccountingMessageKey[] = [
      "accounting.nav.home",
      "accounting.nav.transactions",
      "accounting.nav.ledger",
      "accounting.nav.tax",
      "accounting.nav.filing",
      "accounting.nav.evidence",
      "accounting.nav.company",
      "accounting.nav.more",
    ];
    for (const key of navKeys) {
      const href =
        key === "accounting.nav.home"
          ? ACCOUNTING_ROUTES.home
          : key === "accounting.nav.transactions"
            ? ACCOUNTING_ROUTES.transactions
            : key === "accounting.nav.ledger"
              ? ACCOUNTING_ROUTES.ledger
              : key === "accounting.nav.tax"
                ? ACCOUNTING_ROUTES.tax
                : key === "accounting.nav.filing"
                  ? ACCOUNTING_ROUTES.filing
                  : key === "accounting.nav.evidence"
                    ? ACCOUNTING_ROUTES.evidence
                    : key === "accounting.nav.company"
                      ? ACCOUNTING_ROUTES.company
                      : ACCOUNTING_ROUTES.more;
      items.push({ labelKey: key, href, text: t(key) });
    }
    return items;
  }, [t, tiles]);

  const searchHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const seen = new Set<string>();
    return searchCatalog.filter((item) => {
      const label = t(item.labelKey).toLowerCase();
      if (!label.includes(q) && !item.text.toLowerCase().includes(q)) return false;
      const k = `${item.href}-${item.labelKey}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [query, searchCatalog, t]);

  const shortcuts = [
    {
      id: "schedule",
      labelKey: "accounting.home.hub.short.schedule" as AccountingMessageKey,
      icon: ShortcutIconCalendar,
      href: "#accounting-home-schedule",
    },
    {
      id: "txn",
      labelKey: "accounting.home.hub.short.transactions" as AccountingMessageKey,
      icon: ShortcutIconTxn,
      href: ACCOUNTING_ROUTES.transactions,
    },
    {
      id: "excel",
      labelKey: "accounting.home.hub.short.ledger_excel" as AccountingMessageKey,
      icon: ShortcutIconExcel,
      href: ACCOUNTING_ROUTES.ledger,
    },
    {
      id: "evidence",
      labelKey: "accounting.home.hub.short.evidence" as AccountingMessageKey,
      icon: ShortcutIconEvidence,
      href: ACCOUNTING_ROUTES.evidence,
    },
    {
      id: "receipt",
      labelKey: "accounting.home.hub.short.receipt" as AccountingMessageKey,
      icon: ShortcutIconReceipt,
      href: ACCOUNTING_ROUTES.filing,
    },
    {
      id: "settings",
      labelKey: "accounting.home.hub.short.settings" as AccountingMessageKey,
      icon: ShortcutIconSettings,
      href: ACCOUNTING_ROUTES.company,
    },
  ];

  function onTileActivate(tile: HubTile) {
    if (tile.links.length === 1) {
      router.push(tile.links[0].href);
      return;
    }
    setOpenTile((cur) => (cur === tile.id ? null : tile.id));
  }

  return (
    <section
      className="mx-auto w-full max-w-3xl rounded-[20px] border border-[#E3E8F0] bg-[#F7F9FC] px-4 py-8 sm:px-8"
      data-testid="accounting-home-hub"
    >
      <div className="mx-auto max-w-xl">
        <label className="block text-center">
          <span className="sr-only">{t("accounting.home.hub.search.label")}</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("accounting.home.hub.search.placeholder")}
            className="min-h-12 w-full rounded-full border border-[#E3E8F0] bg-white px-5 text-center text-[15px] text-[#071A33] shadow-sm placeholder:text-[#6B7A90] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            data-testid="accounting-home-hub-search"
          />
        </label>
        {searchHits.length > 0 ? (
          <ul
            className="mt-2 overflow-hidden rounded-xl border border-[#E3E8F0] bg-white text-left shadow-sm"
            data-testid="accounting-home-hub-search-results"
          >
            {searchHits.slice(0, 8).map((hit) => (
              <li key={`${hit.href}-${hit.labelKey}`}>
                <Link
                  href={hit.href}
                  className="block min-h-11 px-4 py-3 text-sm font-semibold text-[#2563EB] hover:bg-[#F7F9FC]"
                >
                  {t(hit.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div
        className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6 sm:gap-6"
        data-testid="accounting-home-hub-icons"
      >
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const open = openTile === tile.id;
          return (
            <div key={tile.id} className="relative flex flex-col items-center text-center">
              <button
                type="button"
                onClick={() => onTileActivate(tile)}
                className="flex w-full flex-col items-center gap-2 rounded-xl p-2 transition hover:bg-white/80"
                data-testid={`accounting-home-hub-tile-${tile.id}`}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#071A33] shadow-sm sm:h-16 sm:w-16">
                  <Icon className="h-9 w-9 sm:h-10 sm:w-10" />
                </span>
                <span className="text-[12px] font-semibold leading-snug text-[#071A33] sm:text-[13px]">
                  {t(tile.labelKey)}
                </span>
              </button>
              {open && tile.links.length > 1 ? (
                <ul
                  className="absolute left-1/2 top-full z-20 mt-1 min-w-[11rem] -translate-x-1/2 overflow-hidden rounded-xl border border-[#E3E8F0] bg-white py-1 text-left shadow-lg"
                  data-testid={`accounting-home-hub-menu-${tile.id}`}
                >
                  {tile.links.map((link) => (
                    <li key={link.href + link.labelKey}>
                      <Link
                        href={link.href}
                        className="block px-4 py-2.5 text-sm font-semibold text-[#2563EB] hover:bg-[#F7F9FC]"
                        onClick={() => setOpenTile(null)}
                      >
                        {t(link.labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        className="mt-8 overflow-x-auto rounded-full border border-[#E3E8F0] bg-white px-2 py-2 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        data-testid="accounting-home-hub-shortcuts"
      >
        <ul className="flex min-w-min items-stretch justify-center gap-1 px-1 sm:gap-2">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            const inner = (
              <>
                <Icon className="h-6 w-6 shrink-0 text-[#071A33]" />
                <span className="text-[11px] font-semibold leading-tight text-[#071A33] sm:text-xs">
                  {t(item.labelKey)}
                </span>
              </>
            );
            return (
              <li key={item.id} className="shrink-0">
                {item.href.startsWith("#") ? (
                  <a
                    href={item.href}
                    className="flex min-h-[4.5rem] w-[4.75rem] flex-col items-center justify-center gap-1 rounded-full px-2 text-center hover:bg-[#F7F9FC] sm:w-[5.25rem]"
                  >
                    {inner}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="flex min-h-[4.5rem] w-[4.75rem] flex-col items-center justify-center gap-1 rounded-full px-2 text-center hover:bg-[#F7F9FC] sm:w-[5.25rem]"
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
