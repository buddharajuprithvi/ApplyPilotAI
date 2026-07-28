/**
 * Your local source-of-truth profile.
 *
 * You can comment out any property or array entry you do not want to use.
 * Keep the remaining JavaScript syntax valid (especially commas between items).
 */
export const profile = {
  personal: {
    firstName: "Prithvi",
    middleName: "",
    lastName: "Buddharaju",
    preferredName: "",
    email: "buddharajuprithvi@gmail.com",
    // Used for phone country-code dropdowns. The autofill logic tries both
    // callingCode and countryName, so it can match options such as "+91",
    // "India", or "India (+91)".
    phoneCountryCode: {
      callingCode: "+91",
      countryName: "India"
    },
    phone: "9787123063",
    address: {
      line1: "Hyderabad",
      // line2: "",
      city: "Hyderabad",
      state: "Telangana",
      postalCode: "500034",
      country: "India"
    }
  },

  links: {
    linkedin: "https://www.linkedin.com/in/prithvi-buddharaju/",
    // github: "https://github.com/janedoe",
    portfolio: "https://buddharajuprithvi.github.io/pm/",
    website: "https://www.srikanyasteels.com/"
  },

  workPreferences: {
    authorizedToWork: "Yes",
    requiresSponsorship: "No",
    willingToRelocate: "Yes",
    currentSalary: "3200000",
    desiredSalary: "3500000",
    // noticePeriod: "",
    // reasonForChange: ""
  },

  applicationAnswers: {
    hybridPolicy: "Yes",
    howDidYouHear: "LinkedIn"
  },

  demographics: {
    gender: "Male",
    // raceEthnicity: "",
    hispanicLatino: "No",
    veteranStatus: "No",
    disabilityStatus: "No"
  },

  // summary:
  //   "Software engineer focused on building reliable, user-friendly products.",

  skills: [
    // "JavaScript",
    // "TypeScript",
    // "React",
    // "Node.js"
  ],

  workExperience: [
    {
      company: "Walmart",
      title: "Product Manager",
      location: "Hyderabad",
      startDate: "21/10/2024",
      // endDate: "",
      current: true,
      description: {
        heading: "Built a centralized global platform to monitor & respond to physical, disaster, & geopolitical risks.",
        bullets: [
          "Spearheaded an AI-powered chat-based intake form, transforming manual completion into a conversational workflow, reducing incident creation time by 64%, and advanced automation across crisis response workflows.",
          "Identified manual facility entry as a friction point in the workflow and prioritized a map-based polygon selection feature, simplifying bulk facility selection, reducing user actions, and improving response speed during incidents."
        ]
      }
    },
    {
      company: "Finvolv",
      title: "Product Manager",
      location: "Bangalore",
      startDate: "01/01/2020",
      endDate: "11/04/2022",
      current: false,
      description: {
        heading: "Led strategy and stakeholder collaboration to enhance product customization and process efficiency, delivering solutions such as UI Generator, LMS, and Credit Analyst Portal.",
        bullets: [
          "Pioneered design of a JSON-driven UI generator, informed by 25+ user interviews, enabling business teams to self-configure web/mobile forms without engineering support, shortening delivery timelines by 35%.",
          "Designed and launched a low-code JSON-Builder portal that simplified metadata creation and streamlined the process, reducing errors and saving 2 FTEs annually.",
          "Optimized product personalization by evaluating and integrating third-party PDF and email templating tools, boosting customer satisfaction (CSAT) by 500 bps.",
          "Differentiated the Loan Management System (LMS) by implementing workflow-based approvals and advanced configurability, creating a competitive edge and driving $1.6M in annual revenue.",
        ]
      }
    },
    {
      company: "Finvolv",
      title: "Software Engineer",
      location: "Bangalore",
      startDate: "01/01/2017",
      endDate: "30/12/2019",
      current: false,
      description: {
        heading: "",
        bullets: [
          "Built an underwriting engine, improving creditworthiness assessments and reducing false positives by 9%.",
        ]
      }
    },
  ],

  education: [
    {
      institution: "Boston University",
      degree: "Masters",
      fieldOfStudy: "Business Administration",
      startDate: "11/08/2022",
      endDate: "19/05/2024"
      // gpa: ""
    },
    {
      institution: "VIT University",
      degree: "Bachelors",
      fieldOfStudy: "Computer Science and Engineering",
      startDate: "01/07/2013",
      endDate: "28/06/2017"
      // gpa: ""
    }
  ],

  certifications: [
    {
      name: "Professional Scrum Product Owner (PSPO I)",
      issuer: "Scrum.org",
      issueDate: "23/12/2023",
      // expirationDate: "",
      credentialUrl: "https://www.credly.com/badges/9f747373-f0b2-4381-9ad2-5ff710423649/linked_in_profile"
    },
    {
      name: "Professional Scrum Master (PSM I)",
      issuer: "Scrum.org",
      issueDate: "30/10/2023",
      // expirationDate: "",
      credentialUrl: "https://www.credly.com/badges/a68b93fb-e1c5-4f0d-b832-726ebdf1d5f8/public_url"
    }
  ]
};
