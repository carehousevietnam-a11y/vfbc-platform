"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FunnelPageHeader from "@/components/engine/FunnelPageHeader";
import FunnelPageShell from "@/components/engine/FunnelPageShell";
import {
  MasterFunnelLanding,
  MASTER_LANDING_ENGINE_CHECK,
  MASTER_LANDING_ENGINE_REGISTER,
  MASTER_LANDING_ENGINE_VERIFY,
  getMasterLandingPageHeader,
  type MasterFunnelContextTab,
} from "@/components/cost-check/MasterFunnelLanding";
import {
  getDefaultTabForEngine,
  getMasterFunnelRedirectForQuery,
  parseExplicitMasterFunnelTab,
  type MasterFunnelEngine,
} from "@/lib/masterFunnelEntry";

const ENGINE_CONFIGS = {
  check: MASTER_LANDING_ENGINE_CHECK,
  verify: MASTER_LANDING_ENGINE_VERIFY,
  register: MASTER_LANDING_ENGINE_REGISTER,
} as const;

export default function MasterEngineEntryClient({ engine }: { engine: MasterFunnelEngine }) {
  const router = useRouter();
  const config = ENGINE_CONFIGS[engine];
  const [contextTab, setContextTab] = useState<MasterFunnelContextTab>(() =>
    getDefaultTabForEngine(engine)
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const explicitTab = parseExplicitMasterFunnelTab(params.get("tab"));
    if (explicitTab) setContextTab(explicitTab);
    const redirectHref = getMasterFunnelRedirectForQuery(params.get("q") ?? "", engine);
    if (redirectHref) router.replace(redirectHref);
  }, [engine, router]);

  const header = getMasterLandingPageHeader(config, contextTab);

  return (
    <FunnelPageShell engine={engine} width="default">
      <FunnelPageHeader engine={engine} title={header.title} description={header.description} />
      <MasterFunnelLanding
        config={config}
        activeTab={contextTab}
        onTabChange={setContextTab}
        onContinue={() => {}}
      />
    </FunnelPageShell>
  );
}
