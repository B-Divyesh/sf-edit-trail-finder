import "@fontsource/azeret-mono/500.css";
import "@fontsource/azeret-mono/700.css";
import "./styles.css";
import { filterRecords, parseSidecars, SAMPLE, type DemoRecord } from "./demo";

const query = <T extends Element>(selector: string): T | null => document.querySelector<T>(selector);
const queryAll = <T extends Element>(selector: string): T[] => [...document.querySelectorAll<T>(selector)];

// Keep the verifier-friendly ?demo=1 entry point while giving the demo a real,
// reloadable URL with its own document title and heading.
if (document.body.dataset.page === "home" && new URLSearchParams(window.location.search).get("demo") === "1") {
  window.location.replace("/demo/");
}

function setOnlineStatus(): void {
  const banner = query<HTMLElement>("[data-offline]");
  if (banner) banner.hidden = navigator.onLine;
}

function setOfflineBanner(offline: boolean): void {
  const banner = query<HTMLElement>("[data-offline]");
  if (banner) banner.hidden = !offline;
}

function showToast(message: string): void {
  const toast = query<HTMLElement>("[data-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
  showToast("Command copied");
}

function setupCopyButtons(): void {
  queryAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await copyText(button.dataset.copy ?? "");
        const before = button.textContent;
        button.textContent = "Command copied";
        window.setTimeout(() => { button.textContent = before; }, 1600);
      } catch { showToast("Could not copy. Select the command manually."); }
    });
  });
}

function setupTabs(): void {
  const tabs = queryAll<HTMLButtonElement>("[role=tab]");
  const activate = (tab: HTMLButtonElement): void => {
    for (const candidate of tabs) {
      const selected = candidate === tab;
      candidate.setAttribute("aria-selected", String(selected));
      candidate.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(candidate.getAttribute("aria-controls") ?? "");
      if (panel) panel.hidden = !selected;
    }
    tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (event) => {
      const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (delta) { event.preventDefault(); activate(tabs[(index + delta + tabs.length) % tabs.length]); }
      if (event.key === "Home") { event.preventDefault(); activate(tabs[0]); }
      if (event.key === "End") { event.preventDefault(); activate(tabs[tabs.length - 1]); }
    });
  });
}

function setupMobileNavigation(): void {
  const toggle = query<HTMLButtonElement>("[data-navigation-toggle]");
  const navigation = query<HTMLElement>("#site-navigation");
  if (!toggle || !navigation) return;

  const close = (restoreFocus = false): void => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    navigation.classList.remove("is-open");
    if (restoreFocus) toggle.focus();
  };
  const open = (): void => {
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation menu");
    navigation.classList.add("is-open");
    query<HTMLAnchorElement>("#site-navigation a")?.focus();
  };

  toggle.addEventListener("click", () => {
    if (toggle.getAttribute("aria-expanded") === "true") close(true);
    else open();
  });
  navigation.addEventListener("click", (event) => {
    if ((event.target as Element).closest("a")) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      event.preventDefault();
      close(true);
    }
  });
  window.matchMedia("(max-width: 900px)").addEventListener("change", (event) => {
    if (!event.matches) close();
  });
}

function setupDemo(): void {
  const input = query<HTMLTextAreaElement>("#sidecar-input");
  const fileInput = query<HTMLInputElement>("#sidecar-files");
  const optionRoot = query<HTMLElement>("[data-operation-options]");
  const resultRoot = query<HTMLElement>("[data-demo-results]");
  const status = query<HTMLElement>("[data-demo-status]");
  if (!input || !fileInput || !optionRoot || !resultRoot || !status) return;
  let records: DemoRecord[] = [];

  const renderOptions = (selectedOperations?: ReadonlySet<string>): void => {
    const previous = selectedOperations ?? new Set(queryAll<HTMLInputElement>("[data-operation-options] input:checked").map((item) => item.value));
    const operations = [...new Set(records.flatMap((record) => record.operations))].sort();
    optionRoot.replaceChildren(...operations.map((operation) => {
      const label = document.createElement("label");
      const control = document.createElement("input");
      control.type = "checkbox";
      control.value = operation;
      control.checked = previous.size ? previous.has(operation) : ["crop", "denoise"].includes(operation);
      label.append(control, document.createTextNode(operation));
      return label;
    }));
  };

  const parse = (selectedOperations?: ReadonlySet<string>): boolean => {
    try {
      records = parseSidecars(input.value);
      renderOptions(selectedOperations);
      status.textContent = records.length ? `${records.length} sidecars parsed locally. Choose editing steps, then search.` : "No sidecar content yet. Paste a sidecar or choose files.";
      status.className = "result-status";
      return true;
    } catch (error) {
      records = [];
      optionRoot.replaceChildren();
      resultRoot.replaceChildren();
      status.textContent = error instanceof Error ? error.message : "This sidecar could not be parsed.";
      status.className = "result-status error";
      return false;
    }
  };

  const renderResults = (): void => {
    if (!parse()) return;
    const selected = queryAll<HTMLInputElement>("[data-operation-options] input:checked").map((control) => control.value);
    const mode = query<HTMLInputElement>("input[name=match]:checked")?.value === "any" ? "any" : "all";
    const matches = filterRecords(records, selected, mode);
    status.textContent = `${matches.length} of ${records.length} sidecars match ${mode} selected operations.`;
    status.className = `result-status ${matches.length ? "success" : "empty"}`;
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "empty-result";
      empty.textContent = "No matching trails. Try “Any selected” or choose fewer operations.";
      resultRoot.replaceChildren(empty);
      return;
    }
    resultRoot.replaceChildren(...matches.map((record) => {
      const item = document.createElement("article");
      const title = document.createElement(document.body.dataset.page === "demo" ? "h2" : "h3");
      title.className = "result-title";
      title.textContent = record.name.replace(/\.(?:xmp|dop|pp3)$/i, "");
      const editor = document.createElement("p");
      editor.textContent = record.editor;
      const tags = document.createElement("div");
      tags.className = "result-tags";
      tags.append(...record.operations.map((operation) => {
        const tag = document.createElement("span");
        tag.textContent = operation;
        return tag;
      }));
      item.append(title, editor, tags);
      return item;
    }));
  };

  const reset = (search = false): void => {
    input.value = SAMPLE;
    fileInput.value = "";
    query<HTMLInputElement>("input[name=match][value=all]")!.checked = true;
    query<HTMLInputElement>("input[name=match][value=any]")!.checked = false;
    const defaults = new Set(["crop", "denoise"]);
    if (search) {
      if (!parse(defaults)) return;
      renderResults();
    }
    else {
      parse(defaults);
      resultRoot.replaceChildren();
    }
  };
  input.value = SAMPLE;
  parse();
  query<HTMLButtonElement>("[data-search]")?.addEventListener("click", renderResults);
  queryAll<HTMLButtonElement>("[data-reset-demo]").forEach((button) => button.addEventListener("click", () => reset(true)));
  fileInput.addEventListener("change", async () => {
    const files = [...(fileInput.files ?? [])];
    if (!files.length) return;
    input.value = (await Promise.all(files.map(async (file) => `--- FILE: ${file.name}\n${await file.text()}`))).join("\n");
    parse();
    resultRoot.replaceChildren();
  });
  if (document.body.dataset.page === "demo" || new URLSearchParams(window.location.search).get("demo") === "1") {
    reset(true);
    requestAnimationFrame(() => {
      query<HTMLElement>("h1")?.focus({ preventScroll: true });
    });
  }
}

function setupRouteFocus(): void {
  const announcement = query<HTMLElement>("[data-route-announcement]");
  queryAll<HTMLAnchorElement>("a[href='/demo/']").forEach((link) => {
    link.addEventListener("click", () => {
      link.dataset.demoTrigger = "true";
      history.replaceState({ ...(history.state ?? {}), restoreDemoFocus: true }, "", window.location.href);
    });
  });
  window.addEventListener("pageshow", () => {
    const state = history.state as { restoreDemoFocus?: boolean } | null;
    if (document.body.dataset.page === "home" && state?.restoreDemoFocus) {
      requestAnimationFrame(() => query<HTMLElement>("[data-demo-trigger='true'], a[href='/demo/'].primary")?.focus({ preventScroll: true }));
      history.replaceState({ ...state, restoreDemoFocus: false }, "", window.location.href);
    }
    const heading = query<HTMLElement>("h1");
    if (announcement && heading) announcement.textContent = `${heading.textContent?.trim() ?? "Page"} loaded`;
  });
  let fragmentTarget: HTMLElement | null = null;
  try {
    const fragmentId = decodeURIComponent(window.location.hash.slice(1));
    fragmentTarget = fragmentId ? document.getElementById(fragmentId) : null;
  } catch {
    fragmentTarget = null;
  }
  if (fragmentTarget?.matches("h1[tabindex]")) {
    requestAnimationFrame(() => fragmentTarget.focus({ preventScroll: true }));
  }
}

function setupRecipeDownload(): void {
  query<HTMLButtonElement>("[data-download-recipes]")?.addEventListener("click", () => {
    const recipes = ["# Edit Trail archive audit recipes", "edit-trail find -o masking --json", "edit-trail find -o crop --format csv", "edit-trail find -o denoise -o crop --match all", "edit-trail find -o exposure -o contrast --match any", "edit-trail find -o perspective --limit 20", "edit-trail report --output full-audit.html", "edit-trail report -o masking --output masking-audit.html", "edit-trail find -o lens-correction --json", "edit-trail find -o vignette --format csv", "edit-trail find -o color-balance-rgb --json", "edit-trail index ~/Pictures --include-hidden", "edit-trail find -o denoise --limit 1 --open"].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([recipes], { type: "text/plain" }));
    link.download = "edit-trail-audit-recipes.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  });
}

setOnlineStatus();
window.addEventListener("online", () => setOfflineBanner(false));
window.addEventListener("offline", () => setOfflineBanner(true));
setupCopyButtons();
setupMobileNavigation();
setupTabs();
setupDemo();
setupRecipeDownload();
setupRouteFocus();
if ("serviceWorker" in navigator && import.meta.env.PROD) window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js"));
