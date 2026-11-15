import { useState, useCallback } from "react";
import { etherscanTxUrl } from "../../contracts/config";

export function useTransaction() {
  // state: idle | confirming | pending | success | rejected | error
  const [status, setStatus] = useState({ state: "idle" });

  const run = useCallback((start) => start(setStatus), []);
  const reset = useCallback(() => setStatus({ state: "idle" }), []);

  return {
    state: status.state,
    hash: status.hash ?? null,
    explorerUrl: status.hash ? etherscanTxUrl(status.hash) : null, // link Etherscan
    message: status.message ?? "",
    isBusy: status.state === "confirming" || status.state === "pending",
    run,
    reset,
  };
}