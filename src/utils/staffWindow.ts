// The window this browser's staff member works at, remembered across page
// reloads. The server holds the real claim; this only lets the dashboard
// renew it after a reload or a server restart.
const KEY = "queuex.staffWindow";

export function getSavedWindow(): number | null {
  try {
    const value = Number(localStorage.getItem(KEY));
    return Number.isInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function saveWindow(counter: number | null) {
  try {
    if (counter == null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, String(counter));
  } catch {
    // Storage blocked: the choice lasts until the page is reloaded.
  }
}
