(() => {
  if (globalThis.__applyPilotMessageHandler) {
    chrome.runtime.onMessage.removeListener(
      globalThis.__applyPilotMessageHandler
    );
  }

  const rules = [
    ["personal.prefix", ["name prefix", "prefix", "salutation", "title"]],
    ["personal.firstName", ["first name", "firstname", "given name", "given-name", "fname"]],
    ["personal.middleName", ["middle name", "middlename", "additional name"]],
    ["personal.lastName", ["last name", "lastname", "family name", "family-name", "surname", "lname"]],
    ["personal.preferredName", ["preferred name", "chosen name"]],
    ["personal.email", ["email address", "email", "e-mail"]],
    ["personal.phoneCountryCode", [
      "phone country code", "mobile country code", "telephone country code",
      "dialing code", "dial code", "calling code", "country code"
    ]],
    ["personal.phoneExtension", [
      "phone extension", "telephone extension", "extension number",
      "phone ext", "telephone ext", "ext"
    ]],
    ["personal.phoneDeviceType", [
      "phone device type", "telephone device type", "phone type",
      "telephone type", "device type"
    ]],
    ["personal.phone", ["phone number", "telephone", "mobile number", "mobile", "phone", "tel"]],
    ["personal.address.line1", ["address line 1", "street address", "address1", "address"]],
    ["personal.address.line2", ["address line 2", "apartment", "apt suite", "address2"]],
    ["personal.address.city", ["current location", "present location", "city", "town"]],
    ["personal.address.state", ["state province", "state/province", "province", "region", "state"]],
    ["personal.address.postalCode", ["postal code", "zip code", "postcode", "zipcode", "zip"]],
    ["personal.address.country", [
      "country / territory", "country or territory", "country territory",
      "country of residence", "country"
    ]],
    ["account.verifyPassword", [
      "verify password", "confirm password", "password confirmation",
      "re enter password", "retype password"
    ]],
    ["account.password", ["create password", "new password", "password"]],
    ["links.linkedin", ["linkedin profile", "linkedin url", "linkedin"]],
    ["links.github", ["github profile", "github url", "github"]],
    ["links.portfolio", [
      "website portfolio linkedin", "portfolio linkedin", "portfolio url",
      "portfolio"
    ]],
    ["links.website", ["personal website", "website url", "website"]],
    ["workPreferences.authorizedToWork", ["legally authorized", "authorized to work", "work authorization"]],
    ["workPreferences.requiresSponsorship", ["require sponsorship", "requires sponsorship", "need sponsorship", "visa sponsorship", "sponsorship"]],
    ["workPreferences.willingToRelocate", [
      "open for job location", "open to job location", "willing to relocate",
      "open to relocate", "relocation"
    ]],
    ["workPreferences.currentSalary", [
      "current ctc", "current compensation", "current salary"
    ]],
    ["workPreferences.desiredSalary", [
      "expected ctc", "desired ctc", "desired salary", "salary expectation",
      "expected salary", "expected compensation"
    ]],
    ["workPreferences.noticePeriod", ["notice period", "available to start", "start availability"]],
    ["workPreferences.reasonForChange", [
      "reason for looking for a change", "reason for job change",
      "reason for change", "why are you looking"
    ]],
    ["applicationAnswers.hybridPolicy", [
      "willing and able to commit to the hybrid policy", "commit to hybrid policy",
      "hybrid work policy", "hybrid policy", "willing"
    ]],
    ["applicationAnswers.howDidYouHear", [
      "how did you hear about", "how did you learn about",
      "how did you find out about", "source of referral", "referral source"
    ]],
    ["demographics.gender", ["gender identity", "gender"]],
    ["demographics.hispanicLatino", [
      "are you hispanic latino", "hispanic latino", "hispanic ethnicity"
    ]],
    ["demographics.veteranStatus", [
      "protected veteran status", "veteran status", "are you a veteran"
    ]],
    ["demographics.disabilityStatus", [
      "disability status", "self identification of disability",
      "do you have a disability", "have you ever had a disability"
    ]],
    ["workExperience.0.company", ["current company", "employer", "company name"]],
    ["workExperience.0.title", ["current title", "job title", "position title"]],
    ["workExperience.0.description", [
      "role description", "work description", "experience description",
      "job responsibilities", "responsibilities", "job description", "description"
    ]],
    ["education.0.institution", ["school name", "university", "institution"]],
    ["education.0.degree", ["degree type", "degree"]],
    ["education.0.fieldOfStudy", ["field of study", "major"]],
    ["education.0.gpa", ["grade point average", "gpa"]],
    ["summary", ["professional summary", "profile summary", "about you"]]
  ];

  const normalize = (value) =>
    String(value ?? "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}+]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

  function getByPath(object, path) {
    return path.split(".").reduce((value, key) => value?.[key], object);
  }

  function formatProfileValue(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      if ("callingCode" in value || "countryName" in value) {
        return [value.callingCode, value.countryName].filter(Boolean);
      }

      if ("heading" in value || Array.isArray(value.bullets)) {
        const lines = [];
        if (value.heading) lines.push(String(value.heading).trim());

        const bullets = (value.bullets ?? [])
          .map((bullet) => String(bullet).trim())
          .filter(Boolean)
          .map((bullet) => `• ${bullet}`);

        if (lines.length && bullets.length) lines.push("");
        lines.push(...bullets);
        return lines.join("\n");
      }
    }

    return value;
  }

  function fieldDescription(field) {
    const label = field.labels?.[0]?.innerText;
    const labelledBy = field
      .getAttribute("aria-labelledby")
      ?.split(/\s+/)
      .map((id) => document.getElementById(id)?.innerText)
      .filter(Boolean)
      .join(" ");

    let nearbyText = "";
    let ancestor = field;
    for (let depth = 0; ancestor && depth < 12; depth += 1) {
      const siblingText = ancestor.previousElementSibling?.innerText?.trim();
      if (siblingText && siblingText.length <= 500) {
        nearbyText = siblingText;
        break;
      }
      ancestor = ancestor.parentElement;
    }

    const group = field.closest("fieldset, [role='radiogroup'], [role='group']");
    const groupLabelledBy = group
      ?.getAttribute("aria-labelledby")
      ?.split(/\s+/)
      .map((id) => document.getElementById(id)?.innerText)
      .filter(Boolean)
      .join(" ");
    const groupText =
      group?.querySelector(":scope > legend")?.innerText ?? groupLabelledBy;

    return normalize([
      label,
      labelledBy,
      field.getAttribute("aria-label"),
      field.getAttribute("placeholder"),
      field.getAttribute("autocomplete"),
      field.name,
      field.id,
      groupText,
      nearbyText
    ].filter(Boolean).join(" "));
  }

  function sectionDescription(field) {
    const details = [];
    let ancestor = field.parentElement;

    for (let depth = 0; ancestor && depth < 6; depth += 1) {
      details.push(
        ancestor.getAttribute("aria-label"),
        ancestor.id,
        ancestor.getAttribute("data-testid"),
        ancestor.getAttribute("data-automation-id")
      );

      const heading = ancestor.querySelector(
        ":scope > legend, :scope > h1, :scope > h2, :scope > h3, :scope > h4"
      );
      if (heading) details.push(heading.innerText);
      ancestor = ancestor.parentElement;
    }

    return normalize(details.filter(Boolean).join(" "));
  }

  function matchingDateField(field) {
    const description = fieldDescription(field);
    const context = `${description} ${sectionDescription(field)}`;
    const isDateControl =
      field instanceof HTMLInputElement &&
      ["date", "month"].includes(field.type);
    const hasDateWords =
      /\b(date|month|year|from|to|start|end|graduat|attend)\b/.test(context);

    if (!isDateControl && !hasDateWords) return null;

    const periodSource =
      /\b(end|ending|to|until|graduat|completion|start|starting|from|begin|attend)\b/.test(
        description
      )
        ? description
        : context;
    const period = /\b(end|ending|to|until|graduat|completion)\b/.test(periodSource)
      ? "endDate"
      : /\b(start|starting|from|begin|attend)\b/.test(periodSource)
        ? "startDate"
        : null;
    if (!period) return null;

    const educationWords =
      /\b(education|school|college|university|degree|academic|graduat|study)\b/;
    const workWords =
      /\b(work|employment|employer|experience|job|position|company|role)\b/;
    const collection = educationWords.test(context)
      ? "education"
      : workWords.test(context)
        ? "workExperience"
        : "workExperience";

    const part = /\byear\b/.test(description)
      ? "year"
      : /\bmonth\b/.test(description)
        ? "month"
        : "date";

    return { path: `${collection}.0.${period}`, part };
  }

  function parseProfileDate(value) {
    const match = String(value ?? "").trim().match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );
    if (!match) return null;

    const [, dayText, monthText, yearText] = match;
    const day = Number(dayText);
    const month = Number(monthText);
    const year = Number(yearText);
    const candidate = new Date(Date.UTC(year, month - 1, day));

    if (
      candidate.getUTCFullYear() !== year ||
      candidate.getUTCMonth() + 1 !== month ||
      candidate.getUTCDate() !== day
    ) {
      return null;
    }

    return {
      day: String(day).padStart(2, "0"),
      month: String(month).padStart(2, "0"),
      year: String(year)
    };
  }

  function formatDateValue(value, part, field) {
    const date = parseProfileDate(value);
    if (!date) return null;

    if (part === "year") return date.year;
    if (part === "month") {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthName = monthNames[Number(date.month) - 1];
      return [
        date.month,
        String(Number(date.month)),
        monthName,
        monthName.slice(0, 3)
      ];
    }

    if (field instanceof HTMLInputElement && field.type === "month") {
      return `${date.year}-${date.month}`;
    }
    if (field instanceof HTMLInputElement && field.type === "date") {
      return `${date.year}-${date.month}-${date.day}`;
    }
    return `${date.month}/${date.year}`;
  }

  function matchingPath(field) {
    const description = fieldDescription(field);
    if (!description) return null;

    // High-confidence semantic fields take precedence over generic aliases.
    if (/\b(verify|confirm|confirmation|re enter|retype) password\b/.test(description)) {
      return "account.verifyPassword";
    }
    if (/\blinkedin\b/.test(description)) return "links.linkedin";
    if (/\bwilling\b/.test(description)) {
      return "applicationAnswers.hybridPolicy";
    }

    let best = null;
    for (const [path, aliases] of rules) {
      for (const alias of aliases) {
        const normalizedAlias = normalize(alias);
        if (description.includes(normalizedAlias)) {
          const score = normalizedAlias.length;
          if (!best || score > best.score) best = { path, score };
        }
      }
    }
    return best?.path ?? null;
  }

  function isFillable(field) {
    if (field.disabled || field.readOnly || field.closest("[aria-hidden='true']")) {
      return false;
    }

    if (field instanceof HTMLInputElement) {
      return ![
        "button", "file", "hidden", "image", "reset", "submit"
      ].includes(field.type);
    }

    return field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement;
  }

  function valueCandidates(value) {
    return (Array.isArray(value) ? value : [value])
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  function matchingOption(options, value) {
    const targets = valueCandidates(value).map(normalize);
    const containsPhrase = (text, target) =>
      text === target ||
      text.startsWith(`${target} `) ||
      text.endsWith(` ${target}`) ||
      text.includes(` ${target} `);
    const directMatch =
      options.find((item) => {
        const optionValue = normalize(item.value ?? item.getAttribute?.("data-value"));
        const optionText = normalize(item.text ?? item.innerText);
        return targets.some(
          (target) => optionValue === target || optionText === target
        );
      }) ??
      options.find((item) => {
        const optionValue = normalize(item.value ?? item.getAttribute?.("data-value"));
        const optionText = normalize(item.text ?? item.innerText);
        return targets.some(
          (target) =>
            containsPhrase(optionValue, target) ||
            containsPhrase(optionText, target)
        );
      });
    if (directMatch) return directMatch;

    // Portal option labels often add punctuation or slightly misspell a value.
    // Use a conservative edit-distance fallback, never an arbitrary option.
    function editDistance(left, right) {
      const previous = Array.from({ length: right.length + 1 }, (_, i) => i);
      for (let i = 1; i <= left.length; i += 1) {
        const current = [i];
        for (let j = 1; j <= right.length; j += 1) {
          current[j] = Math.min(
            current[j - 1] + 1,
            previous[j] + 1,
            previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1)
          );
        }
        previous.splice(0, previous.length, ...current);
      }
      return previous[right.length];
    }

    let closest = null;
    for (const item of options) {
      const labels = [
        normalize(item.value ?? item.getAttribute?.("data-value")),
        normalize(item.text ?? item.innerText)
      ].filter(Boolean);
      for (const target of targets) {
        for (const label of labels) {
          const distance = editDistance(label, target);
          const similarity = 1 - distance / Math.max(label.length, target.length);
          if (similarity >= 0.8 && (!closest || similarity > closest.similarity)) {
            closest = { item, similarity };
          }
        }
      }
    }
    return closest?.item;
  }

  function assignInputValue(field, value) {
    const prototype = field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    setter ? setter.call(field, String(value)) : (field.value = String(value));
    const inputEvent = typeof InputEvent === "function"
      ? new InputEvent("input", {
          bubbles: true,
          data: String(value),
          inputType: "insertText"
        })
      : new Event("input", { bubbles: true });
    field.dispatchEvent(inputEvent);
    field.dispatchEvent(new Event("change", { bubbles: true }));
  }

  const wait = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

  function repeatFieldKind(field) {
    const description = fieldDescription(field);
    if (
      /\b(company name|current company|employer|job title|position title)\b/.test(
        description
      )
    ) {
      return "workExperience";
    }
    if (
      /\b(school name|school|university|institution|degree|field of study)\b/.test(
        description
      )
    ) {
      return "education";
    }
    return null;
  }

  function countRepeatSections(kind) {
    const controls = [
      ...document.querySelectorAll("input, textarea, select")
    ].filter((field) => repeatFieldKind(field) === kind);

    if (!controls.length) return 0;

    const descriptions = controls.map(fieldDescription);
    if (kind === "workExperience") {
      const companies = descriptions.filter((description) =>
        /\b(company name|current company|employer)\b/.test(description)
      ).length;
      const titles = descriptions.filter((description) =>
        /\b(job title|position title)\b/.test(description)
      ).length;
      if (companies && titles) return Math.min(companies, titles);
      return Math.max(companies, titles, 1);
    }

    const institutions = descriptions.filter((description) =>
      /\b(school name|school|university|institution)\b/.test(description)
    ).length;
    const degrees = descriptions.filter((description) =>
      /\bdegree\b/.test(description)
    ).length;
    if (institutions && degrees) return Math.min(institutions, degrees);
    return Math.max(institutions, degrees, 1);
  }

  function buttonDescription(button) {
    return normalize([
      button.innerText,
      button.value,
      button.getAttribute("aria-label"),
      button.getAttribute("title")
    ].filter(Boolean).join(" "));
  }

  function contextualRepeatKind(button) {
    let ancestor = button.parentElement;

    for (let depth = 0; ancestor && depth < 10; depth += 1) {
      const controls = [
        ...ancestor.querySelectorAll("input, textarea, select")
      ];
      const kinds = new Set(controls.map(repeatFieldKind).filter(Boolean));
      if (kinds.size === 1) return [...kinds][0];

      const heading = ancestor.querySelector(
        ":scope > legend, :scope > h1, :scope > h2, :scope > h3, :scope > h4"
      );
      const context = normalize([
        heading?.innerText,
        ancestor.getAttribute("aria-label"),
        ancestor.id,
        ancestor.getAttribute("data-testid"),
        ancestor.getAttribute("data-automation-id")
      ].filter(Boolean).join(" "));

      if (/\b(work|employment|experience|employer|job history)\b/.test(context)) {
        return "workExperience";
      }
      if (/\b(education|school|college|university|academic)\b/.test(context)) {
        return "education";
      }
      ancestor = ancestor.parentElement;
    }

    return null;
  }

  function findAddButton(kind) {
    const candidates = [
      ...new Set(document.querySelectorAll("button, [role='button']"))
    ].filter((button) => {
      if (
        button.disabled ||
        button.getAttribute("aria-disabled") === "true" ||
        button.getClientRects().length === 0
      ) {
        return false;
      }
      return /\b(add|another|more|new)\b/.test(buttonDescription(button));
    });

    const explicitlyMatched = candidates.find((button) => {
      const label = buttonDescription(button);
      if (kind === "workExperience") {
        return /\b(work|employment|experience|employer|job)\b/.test(label);
      }
      return /\b(education|school|college|university|academic)\b/.test(label);
    });
    if (explicitlyMatched) return explicitlyMatched;

    return candidates.find(
      (button) => contextualRepeatKind(button) === kind
    ) ?? null;
  }

  async function waitForSectionCount(kind, previousCount) {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      await wait(125);
      if (countRepeatSections(kind) > previousCount) return true;
    }
    return false;
  }

  async function addMissingSections(kind, desiredCount) {
    if (desiredCount <= 1) return 0;

    const detectedCount = countRepeatSections(kind);
    const startingCount = Math.max(detectedCount, 1);
    const clicksNeeded = Math.max(0, desiredCount - startingCount);
    let added = 0;

    for (let index = 0; index < clicksNeeded; index += 1) {
      const button = findAddButton(kind);
      if (!button) break;

      const previousCount = countRepeatSections(kind);
      button.click();
      added += 1;
      const rendered = await waitForSectionCount(kind, previousCount);
      if (!rendered) await wait(250);
    }

    return added;
  }

  async function prepareRepeatSections(profile) {
    const workAdded = await addMissingSections(
      "workExperience",
      profile.workExperience?.length ?? 0
    );
    const educationAdded = await addMissingSections(
      "education",
      profile.education?.length ?? 0
    );
    return workAdded + educationAdded;
  }

  function indexedProfilePath(path, occurrences) {
    const match = path?.match(/^(workExperience|education)\.0\.(.+)$/);
    if (!match) return path;

    const [, collection, property] = match;
    const key = `${collection}.${property}`;
    const index = occurrences.get(key) ?? 0;
    occurrences.set(key, index + 1);
    return `${collection}.${index}.${property}`;
  }

  async function setCustomComboboxValue(field, value) {
    const combobox =
      field.closest("[role='combobox']") ??
      (field.getAttribute("role") === "combobox" ? field : null);
    if (!combobox && field.getAttribute("aria-autocomplete") === null) {
      return false;
    }

    const displayValue = valueCandidates(value)[0];
    if (!displayValue) return false;

    const control =
      field.closest(".select__control, .select-shell, [role='combobox']") ??
      combobox;
    field.focus();
    control?.click();
    field.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowDown",
        code: "ArrowDown",
        bubbles: true
      })
    );

    async function chooseVisibleOption(attempts) {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        await wait(125);
        const options = [
          ...document.querySelectorAll(
            "[role='option'], [role='listbox'] li, .MuiAutocomplete-option"
          )
        ].filter((option) => option.getClientRects().length > 0);
        const option = matchingOption(options, value);
        if (option) {
          option.click();
          field.dataset.applyPilotFilled = "true";
          return true;
        }
      }
      return false;
    }

    // Many React selects expose all options as soon as they open. Selecting
    // directly is more reliable than changing their controlled input value.
    if (await chooseVisibleOption(4)) return true;

    assignInputValue(field, displayValue);
    field.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowDown",
        code: "ArrowDown",
        bubbles: true
      })
    );

    if (await chooseVisibleOption(8)) return true;

    return false;
  }

  function expandedAnswer(path, value) {
    if (normalize(value) === "yes") {
      return [value, "True"];
    }
    if (normalize(value) !== "no") return value;

    if (path === "demographics.hispanicLatino") {
      return [value, "False", "No, not Hispanic or Latino"];
    }
    if (path === "demographics.veteranStatus") {
      return [
        value,
        "False",
        "I am not a protected veteran",
        "I am not a veteran"
      ];
    }
    if (path === "demographics.disabilityStatus") {
      return [
        value,
        "False",
        "No, I do not have a disability and have not had one in the past",
        "I do not have a disability"
      ];
    }
    return [value, "False"];
  }

  function checkboxAnswer(value) {
    return valueCandidates(value).some((candidate) =>
      ["yes", "true", "checked"].includes(normalize(candidate))
    );
  }

  function optionDescription(field) {
    return normalize([
      field.labels?.[0]?.innerText,
      field.getAttribute("aria-label"),
      field.value
    ].filter(Boolean).join(" "));
  }

  async function setFieldValue(field, value) {
    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      field.checked = checkboxAnswer(value);
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
      field.dataset.applyPilotFilled = "true";
      return true;
    }

    if (field instanceof HTMLInputElement && field.type === "radio") {
      const option = optionDescription(field);
      const matches = valueCandidates(value)
        .map(normalize)
        .some((candidate) =>
          option === candidate ||
          option.startsWith(`${candidate} `) ||
          option.endsWith(` ${candidate}`)
        );
      if (!matches) return false;
      field.checked = true;
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
      field.dataset.applyPilotFilled = "true";
      return true;
    }

    if (
      field instanceof HTMLInputElement &&
      (field.getAttribute("aria-autocomplete") !== null ||
        field.closest("[role='combobox']"))
    ) {
      return setCustomComboboxValue(field, value);
    }

    if (field instanceof HTMLSelectElement) {
      const option = matchingOption([...field.options], value);
      if (!option) return false;
      field.value = option.value;
    } else {
      assignInputValue(field, valueCandidates(value)[0]);
    }

    field.dispatchEvent(new Event("change", { bubbles: true }));
    field.dataset.applyPilotFilled = "true";
    return true;
  }

  async function selectIntlPhoneCountry(phoneField, value) {
    const container = phoneField.closest(".iti");
    const button = container?.querySelector(".iti__selected-country");
    if (!button || !value) return false;

    button.click();
    await wait(100);
    const options = [
      ...container.querySelectorAll(
        ".iti__country[role='option'], [role='option'][data-country-code]"
      )
    ];
    const option = matchingOption(options, formatProfileValue(value));
    if (!option) return false;
    option.click();
    button.dataset.applyPilotFilled = "true";
    return true;
  }

  async function autofill(profile) {
    const sectionsAdded = await prepareRepeatSections(profile);
    const fields = [...document.querySelectorAll("input, textarea, select")];
    const occurrences = new Map();
    let filledCount = 0;

    for (const field of fields) {
      if (!isFillable(field)) continue;
      const dateField = matchingDateField(field);
      const basePath = dateField?.path ?? matchingPath(field);
      const path = indexedProfilePath(basePath, occurrences);
      if (String(field.value ?? "").trim()) continue;
      const rawValue = path ? getByPath(profile, path) : null;
      const value = dateField
        ? formatDateValue(rawValue, dateField.part, field)
        : expandedAnswer(path, formatProfileValue(rawValue));
      const hasValue = Array.isArray(value)
        ? value.some((item) => String(item).trim())
        : value !== null && value !== undefined && String(value).trim();
      if (hasValue) {
        if (
          path === "personal.phone" &&
          field instanceof HTMLInputElement &&
          field.classList.contains("iti__tel-input") &&
          await selectIntlPhoneCountry(field, profile.personal?.phoneCountryCode)
        ) {
          filledCount += 1;
        }
        if (await setFieldValue(field, value)) filledCount += 1;
      }
    }

    return { filledCount, sectionsAdded };
  }

  const messageHandler = (message, _sender, sendResponse) => {
    if (message?.type !== "APPLY_PILOT_AUTOFILL") return false;

    try {
      if (!message.profile || typeof message.profile !== "object") {
        throw new Error("The local profile is missing or invalid.");
      }
      autofill(message.profile)
        .then(({ filledCount, sectionsAdded }) =>
          sendResponse({ ok: true, filledCount, sectionsAdded })
        )
        .catch((error) => sendResponse({ ok: false, error: error.message }));
    } catch (error) {
      sendResponse({ ok: false, error: error.message });
    }
    return true;
  };

  globalThis.__applyPilotMessageHandler = messageHandler;
  chrome.runtime.onMessage.addListener(messageHandler);
})();
