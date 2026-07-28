import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { profile } from "../src/data/profile.js";

const manifest = JSON.parse(await readFile("manifest.json", "utf8"));

assert.equal(manifest.manifest_version, 3, "Manifest V3 is required");
assert.equal(manifest.action.default_popup, "src/popup/popup.html");
assert.equal(manifest.icons["128"], "src/assets/icons/icon-128.png");
assert.deepEqual(
  [...manifest.permissions].sort(),
  ["activeTab", "scripting"],
  "Keep extension permissions intentionally narrow"
);

for (const path of [
  manifest.action.default_popup,
  "src/popup/popup.js",
  "src/popup/popup.css",
  "src/content/autofill.js",
  "src/data/profile.js",
  ...Object.values(manifest.icons)
]) {
  await readFile(path);
}

assert.ok(profile.personal, "Profile must contain personal details");
assert.ok(
  profile.personal.phoneCountryCode?.callingCode,
  "Phone country code must contain a calling code"
);
assert.ok(
  profile.personal.phoneCountryCode?.countryName,
  "Phone country code must contain a country name"
);
assert.ok(profile.links, "Profile must contain links");
assert.equal(
  profile.workPreferences.currentSalary,
  "3200000",
  "Current salary must be configured"
);
assert.equal(profile.applicationAnswers.hybridPolicy, "Yes");
assert.equal(profile.applicationAnswers.howDidYouHear, "LinkedIn");
assert.equal(profile.demographics.gender, "Male");
assert.equal(profile.demographics.hispanicLatino, "No");
assert.equal(profile.demographics.veteranStatus, "No");
assert.equal(profile.demographics.disabilityStatus, "No");
assert.ok(Array.isArray(profile.workExperience), "Work experience must be an array");
assert.ok(
  typeof profile.workExperience[0]?.description === "string" ||
    Array.isArray(profile.workExperience[0]?.description?.bullets),
  "Work description must be a string or contain a bullets array"
);
assert.ok(Array.isArray(profile.education), "Education must be an array");
assert.ok(Array.isArray(profile.certifications), "Certifications must be an array");

const profileDatePattern = /^\d{2}\/\d{2}\/\d{4}$/;
for (const collection of [profile.workExperience, profile.education]) {
  for (const entry of collection) {
    assert.match(
      entry.startDate,
      profileDatePattern,
      "Start dates must use DD/MM/YYYY"
    );
    if (entry.endDate) {
      assert.match(
        entry.endDate,
        profileDatePattern,
        "End dates must use DD/MM/YYYY"
      );
    }
  }
}

console.log("✓ Manifest, extension files, and profile structure are valid");
