import { profile } from "../data/profile.js";

const button = document.querySelector("#autofill");
const status = document.querySelector("#status");

function setStatus(message, kind = "") {
  status.textContent = message;
  status.className = `status ${kind}`.trim();
}

button.addEventListener("click", async () => {
  button.disabled = true;
  setStatus("Scanning this page…");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id || !/^https?:/i.test(tab.url ?? "")) {
      throw new Error("Open a regular website before using autofill.");
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/content/autofill.js"]
    });

    const result = await chrome.tabs.sendMessage(tab.id, {
      type: "APPLY_PILOT_AUTOFILL",
      profile
    });

    if (!result?.ok) {
      throw new Error(result?.error || "The page could not be autofilled.");
    }

    const count = result.filledCount;
    setStatus(
      count
        ? `Filled ${count} field${count === 1 ? "" : "s"}. Review them before submitting.`
        : "No recognized empty fields were found on this page.",
      count ? "success" : ""
    );
  } catch (error) {
    setStatus(error.message || "Unable to autofill this page.", "error");
  } finally {
    button.disabled = false;
  }
});
