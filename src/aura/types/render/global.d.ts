interface HugoAuraGlobal {
  utils: Record<any, any>;
}

interface AssistantHugoAuraGlobal extends HugoAuraGlobal {
  plsStatus: PLSStatus;
  plsRules: Record<any, any>;
  plsSettings: Record<any, any>;
}

interface DesktopAssistantHugoAuraGlobal extends HugoAuraGlobal {
  plsWs: WebSocket | null;
  plsStats: PLSStatus;
}

type UIFunctionsObject = Record<string, any>;
type UIReactivesObject = Record<string, any>;
