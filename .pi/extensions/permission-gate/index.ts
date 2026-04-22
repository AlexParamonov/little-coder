import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

// Port of tools.py::_SAFE_PREFIXES + agent.py::_check_permission. Bash
// commands not matching the whitelist are blocked in "auto" mode. In
// "accept-all" mode all commands pass (benchmark runs set this explicitly).
// Write/Edit confirmations are deferred to the TUI's own prompt; we simply
// add an extra guardrail on bash here to match little-coder's behavior.

const SAFE_PREFIXES: readonly string[] = [
  "ls", "cat", "head", "tail", "wc", "pwd", "echo", "printf", "date",
  "which", "type", "env", "printenv", "uname", "whoami", "id",
  "git log", "git status", "git diff", "git show", "git branch",
  "git remote", "git stash list", "git tag",
  "find ", "grep ", "rg ", "ag ", "fd ",
  "python ", "python3 ", "node ", "ruby ", "perl ",
  "pip show", "pip list", "npm list", "cargo metadata",
  "df ", "du ", "free ", "top -bn", "ps ",
  "curl -I", "curl --head",
];

export function isSafeBash(command: string): boolean {
  const c = command.trim();
  return SAFE_PREFIXES.some((p) => c.startsWith(p));
}

function getPermissionMode(): "auto" | "accept-all" | "manual" {
  const v = process.env.LITTLE_CODER_PERMISSION_MODE;
  if (v === "accept-all" || v === "manual") return v;
  return "auto";
}

export default function (pi: ExtensionAPI) {
  pi.on("tool_call", async (event, _ctx) => {
    const mode = getPermissionMode();
    if (mode === "accept-all") return;

    const toolName = (event as any).toolName;
    const input: any = (event as any).input ?? (event as any).args;

    // Only gate bash-family tools for now; pi has its own confirmation flow
    // for destructive edits via the TUI.
    if (toolName === "bash" || toolName === "Bash") {
      const cmd = input?.command;
      if (typeof cmd === "string" && !isSafeBash(cmd)) {
        if (mode === "manual") {
          return { block: true, reason: "manual permission mode: bash command not pre-approved" };
        }
        // auto: block when not whitelisted
        return { block: true, reason: `bash whitelist: "${cmd.split(/\s+/)[0]}" is not in SAFE_PREFIXES` };
      }
    }
  });
}
