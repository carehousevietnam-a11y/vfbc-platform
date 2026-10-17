"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type ComponentType, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ACCOUNTING_ROUTES,
  ACCOUNTING_SHELL_DESKTOP_NAV,
  type AccountingNavKey,
} from "@/lib/accounting/accountingNav";
import { AccountingBrandLockup } from "@/lib/accounting/AccountingBrandLockup";
import { accountingMessage, type AccountingMessageKey } from "@/lib/accounting/uiCatalog";
import type { AccountingLocale } from "@/lib/accounting/uiCatalog";
import {
  HubIconApply,
  HubIconDeclare,
  HubIconInquiry,
  ShortcutIconCalendar,
  ShortcutIconSettings,
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
};

const SHELL_NAV_I18N: Record<AccountingNavKey, AccountingMessageKey> = {
  home: "accounting.nav.home",
  transactions: "accounting.nav.transactions",
  ledger: "accounting.nav.ledger",
  tax: "accounting.nav.tax",
  filing: "accounting.nav.filing",
  evidence: "accounting.nav.evidence",
  company: "accounting.nav.company",
  pending: "accounting.workspace.pending.title",
  more: "accounting.nav.more",
};

function routeForNavKey(key: AccountingNavKey): string {
  return ACCOUNTING_ROUTES[key];
}

export function AccountingHomeHub({ lang }: Props) {
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
        links: [{ labelKey: "accounting.nav.ledger", href: ACCOUNTING_ROUTES.ledger }],
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
        links: [{ labelKey: "accounting.nav.tax", href: ACCOUNTING_ROUTES.tax }],
      },
    ],
    []
  );

  const searchCatalog = useMemo(() => {
    const items: { labelKey: AccountingMessageKey; href: string; text: string }[] = [];
    for (const tile of tiles) {
      for (const link of tile.links) {
        items.push({ ...link, text: `${t(tile.labelKey)} ${t(link.labelKey)}` });
      }
    }
    const navKeys: AccountingNavKey[] = [...ACCOUNTING_SHELL_DESKTOP_NAV, "more"];
    for (const key of navKeys) {
      const labelKey = SHELL_NAV_I18N[key];
      items.push({ labelKey, href: routeForNavKey(key), text: t(labelKey) });
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

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const first = searchHits[0];
    if (first) router.push(first.href);
  }

  return (
    <section className="mx-auto w-full max-w-[1100px] px-2 py-6 sm:px-4" data-testid="accounting-home-hub">
      <AccountingBrandLockup locale={lang} variant="hub" />

      <div className="mx-auto mt-8 flex w-full max-w-[600px] justify-center">
        <form
          className="flex w-full overflow-hidden rounded-2xl border border-[#E3E8F0] bg-white shadow-sm"
          onSubmit={onSearchSubmit}
        >
          <label className="sr-only">{t("accounting.home.hub.search.label")}</label>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("accounting.home.hub.search.placeholder")}
            className="min-h-14 flex-1 border-0 bg-transparent px-5 text-[15px] text-[#071A33] placeholder:text-[#6B7A90] focus:outline-none focus:ring-0"
            data-testid="accounting-home-hub-search"
          />
          <button
            type="submit"
            className="min-h-14 shrink-0 px-6 text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1d4ed8]"
            data-testid="accounting-home-hub-search-submit"
          >
            {t("accounting.home.hub.search.button")}
          </button>
        </form>
      </div>
      {searchHits.length > 0 ? (
        <ul
          className="mx-auto mt-2 max-w-[600px] overflow-hidden rounded-xl border border-[#E3E8F0] bg-white text-left shadow-sm"
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

      <div
        className="mx-auto mt-10 grid max-w-2xl grid-cols-3 justify-items-center gap-x-6 gap-y-8"
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
                className="flex w-full max-w-[8.5rem] flex-col items-center gap-3"
                data-testid={`accounting-home-hub-tile-${tile.id}`}
              >
                <span className="flex h-[6.5rem] w-[6.5rem] items-center justify-center rounded-full bg-[#EEF2F8] sm:h-[6.875rem] sm:w-[6.875rem]">
                  <Icon className="h-14 w-14 text-[#071A33]" />
                </span>
                <span className="text-[17px] font-bold leading-snug text-[#071A33]">{t(tile.labelKey)}</span>
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
        className="mx-auto mt-10 w-full max-w-xl overflow-x-auto rounded-full border border-[#E3E8F0] bg-white px-3 py-3 shadow-sm"
        data-testid="accounting-home-hub-shortcuts"
      >
        <ul className="flex items-stretch justify-center gap-4 px-1">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            const inner = (
              <>
                <Icon className="h-8 w-8 shrink-0" />
                <span className="text-[14px] font-semibold leading-tight text-[#071A33]">{t(item.labelKey)}</span>
              </>
            );
            const itemClass =
              "flex min-h-[5.25rem] min-w-[5.5rem] flex-1 flex-col items-center justify-center gap-1.5 rounded-full px-2 text-center hover:bg-[#F7F9FC] sm:min-w-[6rem] sm:flex-none";
            return (
              <li key={item.id} className="shrink-0 sm:flex-1 sm:max-w-[7rem]">
                {item.href.startsWith("#") ? (
                  <a href={item.href} className={itemClass}>
                    {inner}
                  </a>
                ) : (
                  <Link href={item.href} className={itemClass}>
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
