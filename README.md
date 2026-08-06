# ApplyPilotAI

A dependency-free Chrome extension starter for reviewing and autofilling job
application forms from a local JavaScript profile.

The extension only fills fields after you click **Autofill this page**. It never
clicks a submit button.

Field discovery uses explicit HTML labels, accessibility labels, placeholders,
field names and IDs, plus nearby question text for sites that do not connect
labels to their inputs. Native selects and common autocomplete/combobox
controls are supported.

## Quick start

1. Edit [`src/data/profile.js`](src/data/profile.js) with your information.
2. Open `chrome://extensions` in Google Chrome.
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select this project directory.
5. Open a job application page, click the ApplyPilotAI extension, and click
   **Autofill this page**.
6. Review every populated value before submitting the application yourself.

After editing `profile.js`, click the reload button for ApplyPilotAI on
`chrome://extensions`.

## Project structure

```text
.
├── manifest.json              Chrome Manifest V3 configuration
├── src
│   ├── content
│   │   └── autofill.js        Form discovery, matching, and filling
│   ├── assets
│   │   └── icons              Chrome toolbar and extension icons
│   ├── data
│   │   └── profile.js         Your local source-of-truth profile
│   └── popup
│       ├── popup.css
│       ├── popup.html
│       └── popup.js           Extension popup and current-tab trigger
└── tests
    └── validate.mjs           Lightweight configuration checks
```

## Profile format

The profile is exported as a JavaScript constant:

```js
export const profile = {
  personal: {
    firstName: "Jane",
    // middleName: "",
    lastName: "Doe"
  }
};
```

You can comment out properties and array entries you do not want to include.
Because this is JavaScript rather than JSON, `//` and `/* ... */` comments are
supported. Make sure commas remain valid when commenting out adjacent values.

The starter profile contains:

- personal/contact details and location
- work authorization and sponsorship answers
- demographic information (optional)
- links
- work experience
- education
- certifications
- skills

Curated aliases handle common variations such as "Expected CTC" for
`desiredSalary`. Matching is intentionally allowlisted so an unrelated word in
a custom question cannot accidentally receive a profile value. The extension
only fills a question when a corresponding, recognized profile value exists.

Common application preferences can be configured separately:

```js
applicationAnswers: {
  hybridPolicy: "Yes",
  howDidYouHear: "LinkedIn"
},
demographics: {
  gender: "Male",
  hispanicLatino: "No",
  veteranStatus: "No",
  disabilityStatus: "No"
}
```

These answers support text inputs, native selects, common custom comboboxes,
checkboxes, and radio buttons. Unknown free-response questions remain blank.
Labels containing `LinkedIn` always use `links.linkedin`, and recognized
questions containing `willing` use the affirmative hybrid-policy answer.

### Phone country-code dropdowns

Store the calling code and country name together:

```js
phoneCountryCode: {
  callingCode: "+91",
  countryName: "India"
},
phone: "9787123063"
```

When a form has a separate phone country-code dropdown, ApplyPilotAI tries both
values. This supports options labelled `+91`, `India`, or `India (+91)`. The
`phone` property should contain the number that belongs in the separate phone
input.

### Work-experience descriptions

A work-experience description can contain a heading and bullet list:

```js
description: {
  heading: "Key responsibilities and achievements",
  bullets: [
    "Built a centralized global risk-monitoring platform.",
    "Collaborated with cross-functional product teams.",
    // "Comment out any bullet you do not want to include."
  ]
}
```

ApplyPilotAI converts this into multiline text before filling the description
textarea:

```text
Key responsibilities and achievements

• Built a centralized global risk-monitoring platform.
• Collaborated with cross-functional product teams.
```

Standard HTML textareas support line breaks and bullet characters, but not rich
formatting such as bold text, font sizes, or colors. A plain string is still
supported if you do not need the heading-and-bullets structure.

### Work and education dates

Enter work-experience and education dates in `DD/MM/YYYY` format:

```js
startDate: "21/10/2024",
endDate: "19/05/2026"
```

ApplyPilotAI adapts these values to common application controls:

- month picker: `2024-10`
- date picker: `2024-10-21`
- combined month/year text field: `10/2024`
- separate month dropdown: `October`, `Oct`, or `10`
- separate year dropdown: `2024`

The extension uses field labels and surrounding employment or education section
headings to decide which date to use. Repeating portal sections still vary, so
review each populated date before submitting.

Common single-value fields are autofilled now. Repeating application sections
are also supported. Before filling, ApplyPilotAI looks for visible buttons such
as **Add Another**, **Add Work**, **Add Experience**, **Add Work Experience**,
**Add Education**, and **Add More**. Generic button labels such as **Add More**
are classified from the surrounding employment or education section.

The extension adds sections until the page has enough entries for the
`workExperience` and `education` arrays, waits for each section to render, and
then maps the first group of fields to array index `0`, the second group to
index `1`, and so on. Job portals structure repeating sections differently, so
always confirm that each company, role, school, and date stayed grouped
together before submitting.

If you do not want the extension to answer optional demographic questions,
leave those values blank.

## Safety and privacy

- Your profile is bundled locally with the unpacked extension; this template
  does not send it to a server.
- Anyone with access to your computer or extension source can read
  `profile.js`. Do not store passwords, Social Security numbers, financial
  data, or other secrets in it.
- The extension requests temporary access to the active tab when you invoke it.
- Chrome blocks scripts on protected pages such as `chrome://` URLs and the
  Chrome Web Store.
- Autofill is heuristic. Always review the entire form before submitting.

## Validate the template

Node.js is optional and only used for local validation:

```bash
npm test
```

## Good next steps

1. Add portal adapters for Workday, Greenhouse, Lever, and Ashby.
2. Add a profile editor backed by `chrome.storage.local` instead of editing JSON.
3. Add tests using saved, anonymized form fixtures.
4. Add explicit controls for sensitive and voluntary self-identification fields.
