import { useEffect } from "react";

const TALLY_SCRIPT_ID = "tally-embed-script";
const TALLY_SCRIPT_SRC = "https://tally.so/widgets/embed.js";

/** Loads the Tally embed script once for landing waitlist buttons. */
export function useTallyScript(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    if (document.getElementById(TALLY_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = TALLY_SCRIPT_ID;
    script.async = true;
    script.src = TALLY_SCRIPT_SRC;
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [enabled]);
}
