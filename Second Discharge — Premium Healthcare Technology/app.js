/* =========================================================
   SECOND DISCHARGE
   PHASE 10
   INTEGRATION + TESTING + POLISH
   ========================================================= */

/*
 * Builds on Phases 6–7:
 * deviation detection and adaptive care-plan history remain intact.
 */


/* =========================================================
   DEFAULT APPLICATION STATE
   ========================================================= */

const defaultState = {

  patientData: null,

  currentDay: 0,

  currentCarePlanVersion: 0,

  carePlans: [],

  currentMonitoringSession: null,

  monitoringHistory: [],

  monitoringStatus: "NOT_STARTED",

  deviations: [],

  clinicianReviews: [],

  auditLog: [],

  persistence: {
    schemaVersion: 10,
    lastSavedAt: null
  }

};


/* =========================================================
   MONITORING PARAMETERS
   ========================================================= */

const parameters = [

  ["temperature", "Temperature", true],

  ["urineOutput", "Urine Output", true],

  ["pain", "Pain", true],

  ["swelling", "Swelling", true],

  ["generalSymptoms", "General Symptoms", true],

  ["medicationAdherence", "Medication Adherence", true],

  ["vomiting", "Vomiting", true],

  ["diarrhea", "Diarrhea", true],

  ["bloodPressure", "Blood Pressure", false],

  ["weight", "Weight", false],

  ["laboratoryValues", "Laboratory Values", false]

];


/* =========================================================
   QUESTION HELPER
   ========================================================= */

function q(
  id,
  day,
  text,
  options,
  parameter,
  extra = {}
) {

  return {

    id,

    day,

    text,

    type: "single",

    options,

    required: true,

    parameter,

    ...extra

  };

}


/* =========================================================
   PHASE 4A
   CENTRALIZED 7-DAY QUESTION CONFIGURATION
   ========================================================= */

const monitoringWorkflow = {


  /* =========================
     DAY 1
  ========================== */

  1: [

    q(
      "day1_overall_feeling",
      1,
      "How are you feeling overall today?",
      [
        "Much better",
        "About the same",
        "Worse"
      ],
      "generalSymptoms"
    ),

    q(
      "day1_new_symptoms",
      1,
      "Have you experienced any new or worsening symptoms?",
      [
        "Yes",
        "No"
      ],
      "generalSymptoms"
    ),

    q(
      "day1_temperature_measured",
      1,
      "Have you measured your temperature?",
      [
        "Yes",
        "No"
      ],
      "temperature",
      {
        futureInput: {
          type: "number",
          unit: "°C",
          showWhen: {
            equals: "Yes"
          }
        }
      }
    ),

    q(
      "day1_urine_output",
      1,
      "Have you noticed any change in urine output?",
      [
        "No change",
        "Less than usual",
        "Much less",
        "Little or no urine"
      ],
      "urineOutput"
    ),

    q(
      "day1_pain",
      1,
      "How is your pain compared with yesterday?",
      [
        "Better",
        "Same",
        "Worse"
      ],
      "pain"
    ),

    q(
      "day1_swelling",
      1,
      "Have you noticed any new swelling?",
      [
        "Yes",
        "No"
      ],
      "swelling"
    ),

    q(
      "day1_medication",
      1,
      "Have you taken your transplant medicines as prescribed?",
      [
        "Yes",
        "No"
      ],
      "medicationAdherence"
    ),

    q(
      "day1_follow_up",
      1,
      "Do you know when your next transplant-team follow-up is scheduled?",
      [
        "Yes",
        "No"
      ],
      "followUp"
    )

  ],


  /* =========================
     DAY 2
  ========================== */

  2: [

    q(
      "day2_overall_feeling",
      2,
      "Compared with yesterday, how do you feel today?",
      [
        "Better",
        "About the same",
        "Worse"
      ],
      "generalSymptoms"
    ),

    q(
      "day2_new_symptoms",
      2,
      "Have you developed any new symptoms since yesterday?",
      [
        "Yes",
        "No"
      ],
      "generalSymptoms"
    ),

    {
      id: "day2_symptoms_selected",

      day: 2,

      text: "Which new symptoms have you developed?",

      type: "multi",

      options: [
        "Pain",
        "Swelling",
        "Fever / feeling hot or shivery",
        "Urine-related change",
        "Vomiting",
        "Diarrhea",
        "Other"
      ],

      required: true,

      parameter: "generalSymptoms",

      showWhen: {
        questionId: "day2_new_symptoms",
        equals: "Yes"
      }

    },

    q(
      "day2_temperature_measured",
      2,
      "Have you measured your temperature today?",
      [
        "Yes",
        "No"
      ],
      "temperature",
      {
        futureInput: {
          type: "number",
          unit: "°C"
        }
      }
    ),

    q(
      "day2_urine_output",
      2,
      "Compared with yesterday, has urine output changed?",
      [
        "No change",
        "Slightly less",
        "Much less",
        "Little or no urine"
      ],
      "urineOutput"
    ),

    q(
      "day2_medication",
      2,
      "Have you taken transplant medicines as prescribed?",
      [
        "Yes",
        "No"
      ],
      "medicationAdherence"
    ),

    q(
      "day2_pain",
      2,
      "Compared with yesterday, is your pain:",
      [
        "Better",
        "Same",
        "Worse"
      ],
      "pain"
    ),

    {
      id: "day2_swelling_location",

      day: 2,

      text: "Where is the swelling?",

      type: "text",

      required: true,

      parameter: "swelling",

      showWhen: {
        questionId: "day2_symptoms_selected",
        includes: "Swelling"
      }

    },

    {
      id: "day2_swelling_increased",

      day: 2,

      text: "Has it increased since yesterday?",

      type: "single",

      options: [
        "Yes",
        "No",
        "Not sure"
      ],

      required: true,

      parameter: "swelling",

      showWhen: {
        questionId: "day2_symptoms_selected",
        includes: "Swelling"
      }

    }

  ],


  /* =========================
     DAY 3
  ========================== */

  3: [

    q(
      "day3_worsening_symptom",
      3,
      "Looking at the last two days, has any symptom been getting worse?",
      [
        "Yes",
        "No"
      ],
      "generalSymptoms"
    ),

    q(
      "day3_fever",
      3,
      "Any fever, chills, or feeling unusually hot?",
      [
        "Yes",
        "No"
      ],
      "temperature"
    ),

    q(
      "day3_urine_output",
      3,
      "Has urine output changed compared with the previous two days?",
      [
        "No change",
        "Decreasing",
        "Much less",
        "Little or no urine"
      ],
      "urineOutput"
    ),

    q(
      "day3_pain",
      3,
      "How has pain changed over the last two days?",
      [
        "Improving",
        "Stable",
        "Worsening"
      ],
      "pain"
    ),

    q(
      "day3_swelling",
      3,
      "New or increasing swelling?",
      [
        "Yes",
        "No"
      ],
      "swelling"
    ),

    q(
      "day3_medication",
      3,
      "Missed any transplant medication doses?",
      [
        "No",
        "Yes"
      ],
      "medicationAdherence"
    ),

    q(
      "day3_gastrointestinal",
      3,
      "Vomiting or diarrhea?",
      [
        "No",
        "Yes"
      ],
      "generalSymptoms"
    )

  ],


  /* =========================
     DAY 4
  ========================== */

  4: [

    q(
      "day4_recovery",
      4,
      "Compared with discharge day, how do you feel now?",
      [
        "Better",
        "About the same",
        "Worse"
      ],
      "generalSymptoms"
    ),

    q(
      "day4_activity",
      4,
      "Is your activity level increasing as expected according to your discharge instructions?",
      [
        "Yes",
        "No",
        "Not sure"
      ],
      "activity"
    ),

    q(
      "day4_pain",
      4,
      "Pain compared with the previous session:",
      [
        "Improving",
        "Stable",
        "Worsening"
      ],
      "pain"
    ),

    q(
      "day4_swelling",
      4,
      "New swelling?",
      [
        "Yes",
        "No"
      ],
      "swelling"
    ),

    q(
      "day4_symptoms",
      4,
      "Any fever, chills, vomiting, diarrhea, breathing difficulty, or chest pain?",
      [
        "Yes",
        "No"
      ],
      "generalSymptoms"
    ),

    q(
      "day4_medication",
      4,
      "Taken transplant medicines as prescribed?",
      [
        "Yes",
        "No"
      ],
      "medicationAdherence"
    )

  ],


  /* =========================
     DAY 5
  ========================== */

  5: [

    q(
      "day5_urine_output",
      5,
      "Has urine output changed since yesterday?",
      [
        "No change",
        "Less",
        "Much less",
        "Little or no urine"
      ],
      "urineOutput"
    ),

    q(
      "day5_symptoms",
      5,
      "New or worsening symptoms?",
      [
        "Yes",
        "No"
      ],
      "generalSymptoms"
    ),

    q(
      "day5_medication_missed",
      5,
      "Missed any prescribed transplant medication doses since the last session?",
      [
        "No",
        "Yes"
      ],
      "medicationAdherence"
    ),

    {
      id: "day5_medication_difficulty",

      day: 5,

      text: "Main difficulty:",

      type: "single",

      options: [
        "Forgot",
        "Could not obtain medicine",
        "Difficulty following schedule",
        "Concern about side effects",
        "Other"
      ],

      required: true,

      parameter: "medicationAdherence",

      showWhen: {
        questionId: "day5_medication_missed",
        equals: "Yes"
      }

    },

    q(
      "day5_gastrointestinal",
      5,
      "Vomiting or diarrhea since the last session?",
      [
        "Yes",
        "No"
      ],
      "generalSymptoms"
    ),

    q(
      "day5_swelling",
      5,
      "Increasing swelling?",
      [
        "Yes",
        "No"
      ],
      "swelling"
    )

  ],


  /* =========================
     DAY 6
  ========================== */

  6: [

    q(
      "day6_condition",
      6,
      "Over the last several days, overall condition:",
      [
        "Improving",
        "Stable",
        "Getting worse"
      ],
      "generalSymptoms"
    ),

    q(
      "day6_worsening_symptom",
      6,
      "Any symptom consistently worsening across more than one session?",
      [
        "Yes",
        "No"
      ],
      "generalSymptoms"
    ),

    {
      id: "day6_which_symptom",

      day: 6,

      text: "Which symptom?",

      type: "text",

      required: true,

      parameter: "generalSymptoms",

      showWhen: {
        questionId: "day6_worsening_symptom",
        equals: "Yes"
      }

    },

    q(
      "day6_urine_output",
      6,
      "Has urine output been consistently decreasing?",
      [
        "Yes",
        "No",
        "Not sure"
      ],
      "urineOutput"
    ),

    q(
      "day6_temperature_38",
      6,
      "Any temperature reading at or above 38°C?",
      [
        "Yes",
        "No"
      ],
      "temperature"
    ),

    q(
      "day6_medication_missed",
      6,
      "Any missed transplant medication doses during the monitoring period?",
      [
        "Yes",
        "No"
      ],
      "medicationAdherence"
    )

  ],


  /* =========================
     DAY 7
  ========================== */

  7: [

    q(
      "day7_recovery",
      7,
      "Compared with discharge day, recovery:",
      [
        "Improving",
        "Stable",
        "Worsening"
      ],
      "generalSymptoms"
    ),

    q(
      "day7_symptoms",
      7,
      "Any new or worsening symptoms during the past week?",
      [
        "Yes",
        "No"
      ],
      "generalSymptoms"
    ),

    q(
      "day7_temperature_38",
      7,
      "Any temperature ≥38°C during the week?",
      [
        "Yes",
        "No"
      ],
      "temperature"
    ),

    q(
      "day7_urine_output",
      7,
      "Significant reduction in urine output?",
      [
        "Yes",
        "No"
      ],
      "urineOutput"
    ),

    q(
      "day7_medication_missed",
      7,
      "Missed transplant medication doses?",
      [
        "Yes",
        "No"
      ],
      "medicationAdherence"
    ),

    q(
      "day7_pain_swelling",
      7,
      "Increasing pain or swelling?",
      [
        "Yes",
        "No"
      ],
      "pain"
    ),

    q(
      "day7_follow_up",
      7,
      "Attended/completed scheduled transplant follow-up?",
      [
        "Yes",
        "No",
        "Not yet due"
      ],
      "followUp"
    )

  ]

};


/* =========================================================
   QUESTION HELPERS
   ========================================================= */

function getQuestionsForDay(day) {

  return monitoringWorkflow[Number(day)] || [];

}


function getQuestionById(questionId) {

  return Object
    .values(monitoringWorkflow)
    .flat()
    .find(question => question.id === questionId) || null;

}



function getAnswerValue(session, questionId) {
  return session?.answers?.[questionId]?.answer;
}


function shouldShowQuestion(question, session) {
  if (!question?.showWhen) {
    return true;
  }

  const rule = question.showWhen;
  const actual = getAnswerValue(session, rule.questionId);

  if (Object.prototype.hasOwnProperty.call(rule, "equals")) {
    return actual === rule.equals;
  }

  if (Object.prototype.hasOwnProperty.call(rule, "includes")) {
    return Array.isArray(actual)
      ? actual.includes(rule.includes)
      : actual === rule.includes;
  }

  return true;
}


function getActiveQuestionsForSession(session) {
  if (!session) {
    return [];
  }

  return getQuestionsForDay(session.day)
    .filter(question => shouldShowQuestion(question, session));
}


function getActiveQuestionIndex(session) {
  const activeQuestions = getActiveQuestionsForSession(session);

  if (!activeQuestions.length) {
    return 0;
  }

  const allQuestions = getQuestionsForDay(session.day);
  const currentQuestion = allQuestions[session.questionIndex];

  const activeIndex = activeQuestions.findIndex(
    question => question.id === currentQuestion?.id
  );

  return activeIndex >= 0 ? activeIndex : 0;
}


function clearHiddenBranchAnswers(session) {
  if (!session) {
    return;
  }

  getQuestionsForDay(session.day).forEach(question => {
    if (shouldShowQuestion(question, session)) {
      return;
    }

    delete session.answers[question.id];

    session.questionsAsked =
      (session.questionsAsked || []).filter(
        id => id !== question.id
      );
  });
}


function getDayQuestionCount(day) {

  return getQuestionsForDay(day).length;

}


function getAllMonitoringQuestions() {

  return Object
    .values(monitoringWorkflow)
    .flat();

}


/* =========================================================
   CARE PLAN CONFIGURATION
   ========================================================= */

const planConfig = {

  temperature: [
    "Routine",
    "Medium",
    "Daily",
    "Configured for routine post-discharge symptom monitoring."
  ],

  urineOutput: [
    "Routine",
    "High",
    "Daily",
    "Configured to monitor patient-reported changes in urine output."
  ],

  pain: [
    "Routine",
    "Medium",
    "Daily",
    "Configured to monitor changes in patient-reported pain."
  ],

  swelling: [
    "Routine",
    "Medium",
    "Daily",
    "Configured to monitor new or changing swelling."
  ],

  generalSymptoms: [
    "Routine",
    "Medium",
    "Daily",
    "Configured to monitor new or worsening symptoms."
  ],

  medicationAdherence: [
    "Routine",
    "High",
    "Daily",
    "Configured to monitor adherence to prescribed transplant medicines."
  ],

  vomiting: [
    "Routine",
    "Medium",
    "Daily",
    "Configured to monitor patient-reported vomiting."
  ],

  diarrhea: [
    "Routine",
    "Medium",
    "Daily",
    "Configured to monitor patient-reported diarrhea."
  ],

  bloodPressure: [
    "Routine",
    "Medium",
    "Clinician Configured",
    "Optional parameter enabled by the user for prototype monitoring."
  ],

  weight: [
    "Routine",
    "Medium",
    "Clinician Configured",
    "Optional parameter enabled by the user for prototype monitoring."
  ],

  laboratoryValues: [
    "Clinician Configured",
    "Clinician Configured",
    "Clinician Configured",
    "Laboratory monitoring is configured by the clinician for this prototype."
  ]

};


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let appState = {
  ...defaultState
};

let currentPage = "landing";

let editingPatient = false;


/* =========================================================
   STORAGE
   ========================================================= */

function getStorageSnapshot() {
  try {
    return localStorage.getItem("secondDischargeState");
  } catch (error) {
    console.warn("Second Discharge storage read failed:", error);
    return null;
  }
}

function safeStorageWrite(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn("Second Discharge storage write failed:", error);
    return false;
  }
}

function runIntegrityChecks() {
  const checks = [];
  const patient = appState.patientData;
  const history = Array.isArray(appState.monitoringHistory) ? appState.monitoringHistory : [];
  const plans = Array.isArray(appState.carePlans) ? appState.carePlans : [];
  const deviations = Array.isArray(appState.deviations) ? appState.deviations : [];

  checks.push({
    label: "Patient registration",
    ok: !!(patient && patient.id && patient.name)
  });
  checks.push({
    label: "Care plan history",
    ok: plans.length > 0 && plans.every(plan => Number.isFinite(Number(plan.version)))
  });
  checks.push({
    label: "Monitoring history",
    ok: history.every(session => Number(session.day) >= 1 && Number(session.day) <= 7)
  });
  checks.push({
    label: "Deviation records",
    ok: deviations.every(item => item.id && item.day && item.level && item.status)
  });
  checks.push({
    label: "Persistence",
    ok: !!appState.persistence && Number(appState.persistence.schemaVersion) >= 10
  });

  return checks;
}

function renderIntegrityStatus() {
  const checks = runIntegrityChecks();
  const passed = checks.filter(check => check.ok).length;
  const allPassed = passed === checks.length;

  return `
    <section class="overview-section" aria-labelledby="integrity-title">
      <p class="eyebrow">SYSTEM INTEGRITY</p>
      <h3 id="integrity-title">Prototype data checks</h3>
      <p>${passed}/${checks.length} checks passed. These checks validate record structure only; they are not clinical validation.</p>
      <div class="history-list">
        ${checks.map(check => `
          <article class="history-item">
            <div class="history-day"><span>${check.ok ? "PASS" : "CHECK"}</span><strong>${check.ok ? "✓" : "!"}</strong></div>
            <div class="history-content"><h3>${safe(check.label)}</h3><p>${check.ok ? "Record structure looks consistent." : "Review this record before relying on the prototype output."}</p></div>
          </article>
        `).join("")}
      </div>
      <p><strong>${allPassed ? "Ready for demo review." : "Data integrity needs attention."}</strong></p>
    </section>
  `;
}

function saveState() {

  if (!appState.persistence) {
    appState.persistence = {};
  }

  appState.persistence.schemaVersion = 10;
  appState.persistence.lastSavedAt =
    new Date().toISOString();

  const saved = safeStorageWrite(
    "secondDischargeState",
    JSON.stringify(appState)
  );

  if (!saved) {
    toast("Could not save locally. Your browser storage may be unavailable or full.");
  }

}


function loadState() {

  try {

    const saved =
      getStorageSnapshot();

    if (saved) {

      const parsed = JSON.parse(saved);

      appState = {
        ...defaultState,
        ...parsed
      };

    } else {

      appState = {
        ...defaultState
      };

    }

    /*
     * Phase 8 persistence migration.
     * Older saved versions remain usable.
     */

    if (!Array.isArray(appState.carePlans)) {
      appState.carePlans = [];
    }

    if (!Array.isArray(appState.monitoringHistory)) {
      appState.monitoringHistory = [];
    }

    if (!Array.isArray(appState.deviations)) {
      appState.deviations = [];
    }

    if (!Array.isArray(appState.clinicianReviews)) {
      appState.clinicianReviews = [];
    }

    if (!Array.isArray(appState.auditLog)) {
      appState.auditLog = [];
    }

    if (!appState.persistence) {
      appState.persistence = {};
    }

    appState.persistence.schemaVersion = 10;

    /*
     * Normalize historical records so the history page
     * can safely render data created by earlier phases.
     */

    appState.monitoringHistory =
      appState.monitoringHistory.map(session => ({
        ...session,
        answers: session.answers || {},
        questionsAsked: Array.isArray(session.questionsAsked)
          ? session.questionsAsked
          : [],
        deviationIds: Array.isArray(session.deviationIds)
          ? session.deviationIds
          : [],
        createdAt:
          session.createdAt ||
          session.startedAt ||
          null,
        updatedAt:
          session.updatedAt ||
          session.completedAt ||
          session.startedAt ||
          null
      }));

    appState.carePlans =
      appState.carePlans.map(plan => ({
        ...plan,
        items: Array.isArray(plan.items)
          ? plan.items
          : [],
        createdAt:
          plan.createdAt ||
          new Date().toISOString()
      }));

    if (
      appState.currentMonitoringSession &&
      appState.currentMonitoringSession.status ===
        "IN_PROGRESS"
    ) {

      appState.currentMonitoringSession.answers =
        appState.currentMonitoringSession.answers || {};

      appState.currentMonitoringSession.questionsAsked =
        Array.isArray(
          appState.currentMonitoringSession.questionsAsked
        )
          ? appState.currentMonitoringSession.questionsAsked
          : [];

      appState.currentMonitoringSession.updatedAt =
        appState.currentMonitoringSession.updatedAt ||
        appState.currentMonitoringSession.startedAt ||
        new Date().toISOString();

      appState.monitoringStatus = "IN_PROGRESS";

    }

    saveState();

  } catch (error) {

    console.error(
      "State loading failed:",
      error
    );

    appState = {
      ...defaultState
    };

  }

}


/* =========================================================
   RESET
   ========================================================= */

function clearState() {

  const confirmed = window.confirm(
    "Reset all Second Discharge prototype data for this browser? This cannot be undone."
  );

  if (!confirmed) {
    return;
  }

  try {
    localStorage.removeItem(
      "secondDischargeState"
    );
  } catch (error) {
    console.warn("Second Discharge storage clear failed:", error);
  }

  appState = {
    ...defaultState
  };

  currentPage = "landing";

  editingPatient = false;

  updateHeader();

  renderPage();

  toast("Application data has been reset.");

}


function clearPatient() {

  appState = {
    ...defaultState
  };

  saveState();

  currentPage = "patient";

  editingPatient = false;

  updateHeader();

  renderPage();

  toast("Ready to register a new patient.");

}


/* =========================================================
   PAGE TITLES
   ========================================================= */

const titles = {

  landing: "Second Discharge",

  dashboard: "Dashboard",

  patient: "Patient",

  "care-plan": "Care Plan",

  monitoring: "Daily Monitoring",

  alerts: "Alerts",

  history: "Monitoring History",

  review: "Clinician Review",

  trends: "Trends"

};


/* =========================================================
   NAVIGATION
   ========================================================= */

function navigateTo(page) {

  currentPage = page;

  editingPatient = false;

  updateHeader();

  renderPage();

}


/* =========================================================
   CONTENT
   ========================================================= */

function content(html) {

  document.getElementById(
    "page-content"
  ).innerHTML = html;

}


/* =========================================================
   RENDER PAGE
   ========================================================= */

function renderPage() {

  const views = {

    landing,

    dashboard,

    patient,

    "care-plan": carePlan,

    monitoring,

    alerts,

    history,

    review,

    trends

  };

  if (views[currentPage]) {

    views[currentPage]();

  } else {

    landing();

  }

  document
    .querySelectorAll("[data-nav]")
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.nav === currentPage
      );

    });

}


/* =========================================================
   LANDING
   ========================================================= */

function landing() {

  content(`

    <section class="landing">

      <div class="landing-copy">

        <p class="eyebrow">
          POST-KIDNEY-TRANSPLANT MONITORING
        </p>

        <h2>
          Care continuity after discharge.
        </h2>

        <p>
          Adaptive post-discharge monitoring that tracks
          patient-reported changes and supports clinical review.
        </p>

        <button
          class="primary-button"
          data-go="patient"
        >
          START MONITORING
        </button>

      </div>


      <aside class="landing-panel">

        <p>
          THE MONITORING PATHWAY
        </p>

        <div class="pathway">

          <div>
            <span>1</span>
            Patient registration
          </div>

          <div>
            <span>2</span>
            Individual care plan
          </div>

          <div>
            <span>3</span>
            Ongoing monitoring
          </div>

        </div>

      </aside>

    </section>

  `);

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function dashboard() {

  const patient = appState.patientData;

  if (!patient) {

    content(`

      <section>

        <div class="dashboard-intro">

          <div>

            <p class="eyebrow">
              DASHBOARD
            </p>

            <h2>
              Welcome to Second Discharge
            </h2>

            <p>
              No patient has been registered yet.
            </p>

          </div>

          <button
            class="primary-button"
            data-go="patient"
          >
            REGISTER PATIENT
          </button>

        </div>


        <div class="status-grid">

          ${status(
            "PATIENT",
            "Not registered"
          )}

          ${status(
            "MONITORING",
            "Not started"
          )}

          ${status(
            "CARE PLAN",
            "Not created"
          )}

        </div>

      </section>

    `);

    return;

  }


  content(`

    <section>

      <div class="dashboard-intro">

        <div>

          <p class="eyebrow">
            DASHBOARD
          </p>

          <h2>
            Patient registered
          </h2>

          <p>
            Patient registration and monitoring configuration
            are available.
          </p>

        </div>

        <button
          class="secondary-button"
          data-edit
        >
          EDIT PATIENT
        </button>

      </div>


      <div class="status-grid">

        ${status(
          "PATIENT",
          patient.name
        )}

        ${status(
          "PATIENT ID",
          patient.id
        )}

        ${status(
          "TRANSPLANT",
          date(patient.transplant.date)
        )}

        ${status(
          "MONITORING",
          monitoringStatusLabel()
        )}

        ${status(
          "CARE PLAN",
          appState.currentCarePlanVersion
            ? `V${appState.currentCarePlanVersion} — Active`
            : "Not created"
        )}

        ${status(
          "CURRENT DAY",
          appState.currentDay
            ? `Day ${appState.currentDay} of 7`
            : "Not started"
        )}

      </div>

    </section>

  `);

}


/* =========================================================
   PATIENT PAGE
   ========================================================= */

function patient() {

  if (
    appState.patientData &&
    !editingPatient
  ) {

    overview();

    return;

  }

  const p =
    appState.patientData ||
    emptyPatient();

  content(`

    <section class="registration-form">

      <div>

        <p class="eyebrow">
          PATIENT ${editingPatient ? "EDIT" : "REGISTRATION"}
        </p>

        <h2 class="page-form-title">
          ${editingPatient
            ? "Edit patient information"
            : "Register patient"}
        </h2>

        <p class="form-intro">
          Enter information from the discharge record.
          Fields marked * are required.
        </p>

      </div>


      <form
        id="patient-form"
        novalidate
      >

        ${baseFields(p)}

        ${medications(p.medications)}

        ${monitorConfig(
          p.monitoringParameters
        )}


        <div class="form-actions">

          ${
            editingPatient
              ? `
                <button
                  class="secondary-button"
                  type="button"
                  data-cancel
                >
                  Cancel
                </button>
              `
              : ""
          }


          <button
            class="primary-button"
            type="submit"
          >
            ${
              editingPatient
                ? "SAVE CHANGES"
                : "REGISTER PATIENT"
            }
          </button>

        </div>

      </form>

    </section>

  `);

}


/* =========================================================
   PATIENT FIELDS
   ========================================================= */

function baseFields(p) {

  return `

    <section class="form-section">

      <p class="eyebrow">
        PATIENT INFORMATION
      </p>

      <h2>
        Patient details
      </h2>

      <div class="form-grid">

        ${field(
          "name",
          "Patient Name",
          p.name,
          true
        )}

        ${field(
          "id",
          "Patient ID",
          p.id,
          true
        )}

        ${field(
          "age",
          "Age",
          p.age,
          true,
          "number",
          'min="1" max="130"'
        )}

        ${select(
          "sex",
          "Sex",
          p.sex,
          [
            "Male",
            "Female",
            "Other",
            "Prefer not to say"
          ]
        )}

      </div>

    </section>


    <section class="form-section">

      <p class="eyebrow">
        TRANSPLANT INFORMATION
      </p>

      <h2>
        Transplant and discharge
      </h2>

      <div class="form-grid">

        ${field(
          "transplantDate",
          "Transplant Date",
          p.transplant.date,
          true,
          "date"
        )}

        ${field(
          "dischargeDate",
          "Discharge Date",
          p.discharge.date,
          true,
          "date"
        )}

        ${select(
          "transplantType",
          "Transplant Type",
          p.transplant.type,
          ["Kidney"],
          true
        )}

        ${select(
          "donorType",
          "Donor Type",
          p.transplant.donorType,
          [
            "Living",
            "Deceased"
          ],
          true
        )}

      </div>

    </section>


    <section class="form-section">

      <p class="eyebrow">
        CLINICAL INFORMATION
      </p>

      <h2>
        Discharge record
      </h2>

      <div class="form-grid">

        ${field(
          "primaryKidneyDisease",
          "Primary Kidney Disease",
          p.primaryKidneyDisease,
          true
        )}

        ${field(
          "dischargeDiagnosis",
          "Discharge Diagnosis",
          p.discharge.diagnosis,
          true,
          "textarea"
        )}

      </div>

    </section>


    <section class="form-section">

      <p class="eyebrow">
        DISCHARGE INSTRUCTIONS
      </p>

      <h2>
        Instructions and follow-up
      </h2>

      <div class="form-grid">

        ${field(
          "dischargeInstructions",
          "Discharge Instructions",
          p.discharge.instructions,
          true,
          "textarea"
        )}

        ${field(
          "activityRestrictions",
          "Activity Restrictions",
          p.discharge.activityRestrictions,
          false,
          "textarea"
        )}

        ${field(
          "followUpInformation",
          "Follow-up Information",
          p.discharge.followUpInformation,
          false,
          "textarea"
        )}

        ${field(
          "transplantTeamContact",
          "Transplant Team Contact",
          p.discharge.transplantTeamContact,
          false,
          "textarea"
        )}

        ${field(
          "warningSigns",
          "Warning Signs Provided by Clinician",
          p.discharge.warningSigns,
          false,
          "textarea"
        )}

      </div>

    </section>

  `;

}


/* =========================================================
   MEDICATIONS
   ========================================================= */

function medications(list) {

  return `

    <section class="form-section">

      <div class="section-heading">

        <div>

          <p class="eyebrow">
            MEDICATIONS
          </p>

          <h2>
            Medication information
          </h2>

        </div>

        <button
          class="secondary-button"
          type="button"
          id="add-medication"
        >
          + Add Medication
        </button>

      </div>


      <p>
        Record medication details supplied in the discharge record.
        This prototype does not recommend or modify medication.
      </p>


      <div id="medication-list">

        ${list.map(
          medCard
        ).join("")}

      </div>

    </section>

  `;

}


function medCard(m = {}) {

  return `

    <article
      class="medication-card"
      data-medication
    >

      <label>
        Medication Name

        <input
          name="medicationName"
          value="${esc(m.name || "")}"
        >
      </label>


      <label>
        Dose

        <input
          name="medicationDose"
          value="${esc(m.dose || "")}"
        >
      </label>


      <label>
        Frequency

        <input
          name="medicationFrequency"
          value="${esc(m.frequency || "")}"
        >
      </label>


      <label>
        Start Date

        <input
          name="medicationStartDate"
          type="date"
          value="${esc(m.startDate || "")}"
        >
      </label>


      <label>
        End Date

        <input
          name="medicationEndDate"
          type="date"
          value="${esc(m.endDate || "")}"
        >
      </label>


      <button
        class="remove-medication"
        type="button"
        data-remove
      >
        Remove
      </button>


      <label class="instructions">

        Instructions

        <textarea
          name="medicationInstructions"
        >${esc(m.instructions || "")}</textarea>

      </label>

    </article>

  `;

}


/* =========================================================
   MONITORING CONFIGURATION
   ========================================================= */

function monitorConfig(config) {

  return `

    <section class="form-section">

      <p class="eyebrow">
        MONITORING PARAMETERS
      </p>

      <h2>
        Prototype configuration
      </h2>

      <p>
        Select areas to make available in the monitoring workflow.
        These selections are configuration only.
      </p>


      <div class="parameter-grid">

        ${parameters.map(
          ([key, label]) => `

            <label class="check-field">

              <input
                type="checkbox"
                name="monitoringParameters"
                value="${key}"
                ${
                  config[key]
                    ? "checked"
                    : ""
                }
              >

              ${label}

            </label>

          `
        ).join("")}

      </div>

    </section>

  `;

}


/* =========================================================
   PATIENT OVERVIEW
   ========================================================= */

function overview() {

  const p =
    appState.patientData;


  const meds = p.medications.length

    ? `

      <section class="overview-section">

        <p class="eyebrow">
          MEDICATIONS
        </p>

        <h2>
          Recorded medications
        </h2>

        <table class="medication-table">

          <thead>

            <tr>
              <th>Name</th>
              <th>Dose</th>
              <th>Frequency</th>
              <th>Dates</th>
              <th>Instructions</th>
            </tr>

          </thead>


          <tbody>

            ${p.medications.map(
              m => `

                <tr>

                  <td>${safe(m.name)}</td>

                  <td>${safe(m.dose)}</td>

                  <td>${safe(m.frequency)}</td>

                  <td>
                    ${date(m.startDate)}
                    ${
                      m.endDate
                        ? " – " + date(m.endDate)
                        : ""
                    }
                  </td>

                  <td>
                    ${safe(m.instructions)}
                  </td>

                </tr>

              `
            ).join("")}

          </tbody>

        </table>

      </section>

    `

    : `

      <section class="overview-section">

        <p class="eyebrow">
          MEDICATIONS
        </p>

        <h2>
          Recorded medications
        </h2>

        <p>
          No medications were entered.
        </p>

      </section>

    `;


  content(`

    <section class="overview">

      <div class="dashboard-intro">

        <div>

          <p class="eyebrow">
            PATIENT OVERVIEW
          </p>

          <h2>
            ${safe(p.name)}
          </h2>

          <p>
            Patient registration is complete.
          </p>

        </div>


        <button
          class="primary-button"
          data-edit
        >
          EDIT PATIENT
        </button>

      </div>


      ${details(
        "Patient information",
        [
          ["Patient Name", p.name],
          ["Patient ID", p.id],
          ["Age", p.age],
          ["Sex", p.sex || "Not provided"]
        ]
      )}


      <section class="overview-section">

        <p class="eyebrow">
          NEXT STEP
        </p>

        <h2>
          Care Plan V${appState.currentCarePlanVersion || 1} is active.
        </h2>

        <div class="question-actions">

          <button
            class="primary-button"
            type="button"
            data-go="care-plan"
          >
            VIEW CARE PLAN
          </button>

          <button
            class="secondary-button"
            type="button"
            data-go="monitoring"
          >
            START MONITORING
          </button>

        </div>

      </section>


      ${details(
        "Transplant",
        [
          [
            "Transplant Date",
            date(p.transplant.date)
          ],
          [
            "Transplant Type",
            p.transplant.type
          ],
          [
            "Donor Type",
            p.transplant.donorType
          ]
        ]
      )}


      ${details(
        "Discharge",
        [
          [
            "Discharge Date",
            date(p.discharge.date)
          ],
          [
            "Primary Kidney Disease",
            p.primaryKidneyDisease
          ],
          [
            "Discharge Diagnosis",
            p.discharge.diagnosis
          ],
          [
            "Discharge Instructions",
            p.discharge.instructions
          ],
          [
            "Activity Restrictions",
            p.discharge.activityRestrictions ||
              "Not provided"
          ],
          [
            "Follow-up Information",
            p.discharge.followUpInformation ||
              "Not provided"
          ],
          [
            "Transplant Team Contact",
            p.discharge.transplantTeamContact ||
              "Not provided"
          ],
          [
            "Warning Signs",
            p.discharge.warningSigns ||
              "Not provided"
          ]
        ]
      )}


      ${meds}


      <section class="overview-section">

        <p class="eyebrow">
          MONITORING PARAMETERS
        </p>

        <h2>
          Enabled parameters
        </h2>

        <div class="tag-list">

          ${
            parameters
              .filter(
                ([key]) =>
                  p.monitoringParameters[key]
              )
              .map(
                ([, label]) =>
                  `<span class="tag">${label}</span>`
              )
              .join("")
              ||
              "<p>No parameters selected.</p>"
          }

        </div>

      </section>


      <section class="overview-section">

        <p class="eyebrow">
          CARE PLAN
        </p>

        <h2>
          Current monitoring plan
        </h2>

        ${
          appState.currentCarePlanVersion

            ? `

              <p>
                Care Plan V${appState.currentCarePlanVersion}
                is active.
              </p>

              <button
                class="secondary-button"
                data-go="care-plan"
              >
                VIEW CARE PLAN
              </button>

            `

            : `

              <p>
                No care plan has been generated.
              </p>

            `
        }

      </section>

    </section>

  `);

}


/* =========================================================
   CARE PLAN
   ========================================================= */

function carePlan() {

  const plan = currentPlan();


  if (!appState.patientData) {

    empty(
      "Care Plan",
      "A patient-specific care plan will be generated after patient registration.",
      "□"
    );

    return;

  }


  if (!plan) {

    empty(
      "Care Plan",
      "A configured monitoring plan has not been generated yet.",
      "□"
    );

    return;

  }


  content(`

    <section class="overview">

      <div class="dashboard-intro">

        <div>

          <p class="eyebrow">
            CONFIGURED MONITORING PLAN
          </p>

          <h2>
            Care Plan V${plan.version}
          </h2>

          <p>
            Prototype monitoring configuration.
          </p>

        </div>

        <div class="question-actions">

          <button
            class="secondary-button"
            type="button"
            data-regenerate
          >
            REGENERATE CARE PLAN
          </button>

          <button
            class="primary-button"
            type="button"
            data-go="monitoring"
          >
            START MONITORING
          </button>

        </div>

      </div>


      <div class="status-grid">

        ${status(
          "CARE PLAN",
          `V${plan.version}`
        )}

        ${status(
          "STATUS",
          "Active"
        )}

        ${status(
          "MONITORING ITEMS",
          plan.items.length
        )}

        ${status(
          "MONITORING",
          monitoringStatusLabel()
        )}

      </div>


      ${details(
        "Patient context",
        [
          [
            "Patient",
            appState.patientData.name
          ],
          [
            "Patient ID",
            appState.patientData.id
          ],
          [
            "Created",
            new Date(
              plan.createdAt
            ).toLocaleString()
          ]
        ]
      )}


      <section class="overview-section">

        <p class="eyebrow">
          ACTIVE MONITORING ITEMS
        </p>

        <h2>
          Configured parameters
        </h2>


        <table class="medication-table">

          <thead>

            <tr>
              <th>Parameter</th>
              <th>Level</th>
              <th>Priority</th>
              <th>Frequency</th>
              <th>Reason</th>
            </tr>

          </thead>


          <tbody>

            ${plan.items.map(
              item => `

                <tr>

                  <td>
                    ${safe(item.parameter)}
                  </td>

                  <td>
                    ${safe(item.monitoringLevel)}
                  </td>

                  <td>
                    ${safe(item.priority)}
                  </td>

                  <td>
                    ${safe(item.frequency)}
                  </td>

                  <td>
                    ${safe(item.reason)}
                  </td>

                </tr>

              `
            ).join("")}

          </tbody>

        </table>

      </section>


      <section class="overview-section">

        <p class="eyebrow">
          ADAPTIVE LOGIC
        </p>

        <h2>
          Why this plan changed
        </h2>

        ${plan.planType === "ADAPTIVE"
          ? `
              <div class="detail-grid">
                ${details(
                  "Adaptation",
                  [
                    ["Plan transition", `V${plan.parentVersion} → V${plan.version}`],
                    ["Effective day", plan.effectiveDay || "Not specified"],
                    ["Change", getCarePlanChangeLabel(plan)],
                    ["Reason", plan.changeReason || "Configured deviation detected"]
                  ]
                )}
              </div>
            `
          : `
              <p>
                V${plan.version} is the initial configured monitoring plan.
                A future version may be created when a rule-based deviation
                requires increased monitoring or clinical escalation.
              </p>
            `}

      </section>


      <section class="overview-section">

        <p class="eyebrow">
          CARE PLAN HISTORY
        </p>

        <h2>
          Plan versions
        </h2>


        <div class="detail-grid">

          ${appState.carePlans.map(
            planItem => `

              <div class="detail">

                <dt>
                  V${planItem.version}
                </dt>

                <dd>
                  ${new Date(
                    planItem.createdAt
                  ).toLocaleString()}
                  <br>
                  <small>
                    ${safe(getCarePlanChangeLabel(planItem))}
                  </small>
                  ${planItem.changeReason
                    ? `<br><small>${safe(planItem.changeReason)}</small>`
                    : ""}
                </dd>

              </div>

            `
          ).join("")}

        </div>

      </section>

    </section>

  `);

}


/* =========================================================
   CURRENT PLAN
   ========================================================= */

function currentPlan() {

  return appState.carePlans.find(
    plan =>
      plan.version ===
      appState.currentCarePlanVersion
  ) || null;

}


/* =========================================================
   GENERATE CARE PLAN
   ========================================================= */

function generatePlan() {

  const patient =
    appState.patientData;

  if (!patient) {
    return null;
  }


  const version =
    appState.carePlans.length + 1;


  const items =
    parameters

      .filter(
        ([key]) =>
          patient.monitoringParameters[key]
      )

      .map(
        ([key, label]) => {

          const [
            monitoringLevel,
            priority,
            frequency,
            reason
          ] = planConfig[key];


          return {

            id: key,

            parameterKey: key,

            parameter: label,

            monitoringLevel,

            priority,

            frequency,

            reason,

            status: "ROUTINE"

          };

        }
      );


  const plan = {

    version,

    createdAt:
      new Date().toISOString(),

    patientId:
      patient.id,

    status:
      "ACTIVE",

    items

  };


  appState.carePlans.push(
    plan
  );

  appState.currentCarePlanVersion =
    version;


  return plan;

}


/* =========================================================
   PHASE 4C
   DAILY MONITORING
   ========================================================= */

function monitoring() {

  if (!appState.patientData) {

    empty(
      "Daily Monitoring",
      "Daily monitoring will become available after patient registration.",
      "◷"
    );

    return;

  }


  if (!currentPlan()) {

    empty(
      "Daily Monitoring",
      "A patient-specific care plan is required before monitoring can begin.",
      "◷"
    );

    return;

  }


  /*
   * IMPORTANT:
   *
   * If an incomplete session exists,
   * immediately restore it.
   */

  if (
    appState.currentMonitoringSession &&
    appState.currentMonitoringSession.status ===
      "IN_PROGRESS"
  ) {

    renderMonitoringQuestion();

    return;

  }


  if (
    appState.monitoringStatus ===
      "COMPLETED"
  ) {

    renderMonitoringComplete();

    return;

  }


  const nextDay =
    appState.currentDay
      ? Math.min(
          appState.currentDay + 1,
          7
        )
      : 1;


  content(`

    <section class="monitoring-shell">

      <div class="monitoring-heading">

        <div>

          <p class="eyebrow">
            DAILY PATIENT MONITORING
          </p>

          <h2>
            ${nextDay === 1
              ? "Begin Day 1 monitoring"
              : `Start Day ${nextDay}`}
          </h2>

          <p>
            Patient:
            <strong>
              ${safe(
                appState.patientData.name
              )}
            </strong>

            · Care Plan V${appState.currentCarePlanVersion}
          </p>

        </div>


        <span class="monitoring-status-badge">
          ${monitoringStatusLabel()}
        </span>

      </div>


      ${renderDayTracker(nextDay)}


      <section class="monitoring-start-card">

        <p class="eyebrow">
          DAY ${nextDay} OF 7
        </p>

        <h2>
          Start today's monitoring session
        </h2>

        <p>
          You will answer one question at a time.
          Your responses are saved as part of this
          monitoring session.
        </p>


        <button
          class="primary-button"
          data-start-day="${nextDay}"
        >
          START DAY ${nextDay}
        </button>


        <p class="monitoring-note">
          Prototype workflow. Responses are recorded
          for demonstration and are not interpreted
          as a diagnosis or treatment recommendation.
        </p>

      </section>

    </section>

  `);

}


/* =========================================================
   START MONITORING DAY
   ========================================================= */


/* =========================================================
   PHASE 8
   PERSISTENCE + AUDIT HELPERS
   ========================================================= */

function recordAuditEvent(type, details = {}) {

  if (!Array.isArray(appState.auditLog)) {
    appState.auditLog = [];
  }

  appState.auditLog.push({
    id:
      `audit-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
    type,
    timestamp: new Date().toISOString(),
    patientId: appState.patientData?.id || null,
    details
  });

  /*
   * Keep the prototype storage bounded.
   * The most recent 500 events are retained.
   */

  if (appState.auditLog.length > 500) {
    appState.auditLog =
      appState.auditLog.slice(-500);
  }

}

function exportPatientRecord() {

  if (!appState.patientData) {
    toast("Register a patient before exporting a record.");
    return;
  }

  const exportData = {
    application: "Second Discharge",
    exportVersion: 10,
    exportedAt: new Date().toISOString(),
    patient: appState.patientData,
    currentDay: appState.currentDay,
    currentCarePlanVersion:
      appState.currentCarePlanVersion,
    carePlans: appState.carePlans || [],
    currentMonitoringSession:
      appState.currentMonitoringSession || null,
    monitoringHistory:
      appState.monitoringHistory || [],
    deviations:
      appState.deviations || [],
    clinicianReviews:
      appState.clinicianReviews || [],
    auditLog:
      appState.auditLog || []
  };

  const blob = new Blob(
    [
      JSON.stringify(
        exportData,
        null,
        2
      )
    ],
    {
      type: "application/json"
    }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  const patientId =
    String(appState.patientData.id || "patient")
      .replace(/[^a-z0-9_-]/gi, "_");

  anchor.href = url;
  anchor.download =
    `second-discharge-${patientId}-record.json`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);

  recordAuditEvent(
    "PATIENT_RECORD_EXPORTED",
    {
      patientId: appState.patientData.id
    }
  );

  saveState();

  toast("Patient record exported.");
}

function getPersistenceSummary() {

  return {
    lastSavedAt:
      appState.persistence?.lastSavedAt || null,
    schemaVersion:
      appState.persistence?.schemaVersion || 8,
    historyCount:
      Array.isArray(appState.monitoringHistory)
        ? appState.monitoringHistory.length
        : 0,
    deviationCount:
      Array.isArray(appState.deviations)
        ? appState.deviations.length
        : 0,
    carePlanCount:
      Array.isArray(appState.carePlans)
        ? appState.carePlans.length
        : 0
  };

}

function startMonitoringDay(day) {

  const questions = getQuestionsForDay(day);

  if (!questions.length) {
    toast(`No questions are configured for Day ${day}.`);
    return;
  }

  if (
    appState.currentMonitoringSession &&
    appState.currentMonitoringSession.status ===
      "IN_PROGRESS"
  ) {
    toast("A monitoring session is already in progress.");
    renderPage();
    return;
  }

  const now = new Date().toISOString();

  appState.currentMonitoringSession = {
    id:
      `session-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
    patientId: appState.patientData?.id || null,
    day: Number(day),
    startedAt: now,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    answers: {},
    questionsAsked: [],
    questionIndex: 0,
    originalQuestionIndex: 0,
    status: "IN_PROGRESS",
    carePlanVersion:
      appState.currentCarePlanVersion,
    deviationIds: []
  };

  appState.currentDay = Number(day);
  appState.monitoringStatus = "IN_PROGRESS";

  recordAuditEvent(
    "MONITORING_SESSION_STARTED",
    {
      sessionId:
        appState.currentMonitoringSession.id,
      day: Number(day)
    }
  );

  saveState();
  renderMonitoringQuestion();

}


/* =========================================================
   RENDER CURRENT QUESTION
   ========================================================= */

function renderMonitoringQuestion() {
  const session = appState.currentMonitoringSession;

  if (!session) {
    monitoring();
    return;
  }

  const questions = getActiveQuestionsForSession(session);

  if (!questions.length) {
    toast("No questions are available for this monitoring day.");
    return;
  }

  const activeIndex = getActiveQuestionIndex(session);
  const index = Math.max(
    0,
    Math.min(activeIndex, questions.length - 1)
  );

  const question = questions[index];

  const allQuestions = getQuestionsForDay(session.day);
  session.questionIndex =
    allQuestions.findIndex(q => q.id === question.id);

  if (!session.questionsAsked.includes(question.id)) {
    session.questionsAsked.push(question.id);
    saveState();
  }

  const savedAnswer =
    session.answers[question.id]?.answer ?? "";

  const latestDeviation =
    session.latestDeviationId
      ? appState.deviations.find(
          item => item.id === session.latestDeviationId
        )
      : null;

  content(`

    <section class="monitoring-shell">

      <div class="monitoring-heading">

        <div>
          <p class="eyebrow">
            DAILY PATIENT MONITORING
          </p>

          <h2>
            ${safe(appState.patientData.name)}
          </h2>

          <p>
            Care Plan V${session.carePlanVersion}
          </p>
        </div>

        <span class="monitoring-status-badge">
          IN PROGRESS
        </span>

      </div>

      ${renderDeviationBanner(latestDeviation)}

      ${renderDayTracker(session.day)}

      <section class="question-card">

        <div class="question-progress-row">

          <span>
            QUESTION ${index + 1} OF ${questions.length}
          </span>

          <span>
            DAY ${session.day} OF 7
          </span>

        </div>

        <div class="progress-track">

          <div
            class="progress-fill"
            style="
              width:${((index + 1) / questions.length) * 100}%;
            "
          ></div>

        </div>

        <div class="question-body">

          <p class="eyebrow">
            MONITORING QUESTION
          </p>

          <h2>
            ${safe(question.text)}
          </h2>

          <div id="question-control">
            ${renderQuestionControl(question, savedAnswer)}
          </div>

          <p
            class="question-error"
            id="question-error"
            aria-live="polite"
          ></p>

        </div>

        <div class="question-actions">

          <button
            class="secondary-button"
            type="button"
            data-monitor-back
            ${index === 0 ? "disabled" : ""}
          >
            BACK
          </button>

          <button
            class="primary-button"
            type="button"
            data-monitor-next
          >
            ${
              index === questions.length - 1
                ? "COMPLETE DAY"
                : "NEXT"
            }
          </button>

        </div>

      </section>

    </section>

  `);
}


/* =========================================================
   QUESTION CONTROL
   ========================================================= */

function renderQuestionControl(
  question,
  savedAnswer
) {


  if (
    question.type ===
    "multi"
  ) {

    const values =
      Array.isArray(savedAnswer)
        ? savedAnswer
        : [];


    return `

      <fieldset
        class="question-options"
      >

        <legend class="sr-only">
          ${safe(question.text)}
        </legend>


        ${question.options.map(
          option => `

            <label
              class="option-card"
            >

              <input
                type="checkbox"
                name="monitor-answer"
                value="${esc(option)}"
                ${
                  values.includes(option)
                    ? "checked"
                    : ""
                }
              >

              <span>
                ${safe(option)}
              </span>

            </label>

          `
        ).join("")}

      </fieldset>

    `;

  }


  if (
    question.type ===
    "text"
  ) {

    return `

      <textarea
        class="monitor-text-input"
        id="monitor-text-answer"
        rows="5"
        placeholder="Enter your response"
      >${safe(
        savedAnswer || ""
      )}</textarea>

    `;

  }


  if (
    question.type ===
    "number"
  ) {

    return `

      <div class="number-input-wrap">

        <input
          class="monitor-number-input"
          id="monitor-number-answer"
          type="number"
          step="0.1"
          value="${savedAnswer ?? ""}"
          aria-label="${safe(question.text)}"
        >

        <span>
          ${safe(question.futureInput?.unit || "")}
        </span>

      </div>

    `;
  }


  return `

    <fieldset
      class="question-options"
    >

      <legend class="sr-only">
        ${safe(question.text)}
      </legend>


      ${question.options.map(
        option => `

          <label
            class="option-card"
          >

            <input
              type="radio"
              name="monitor-answer"
              value="${esc(option)}"
              ${
                savedAnswer === option
                  ? "checked"
                  : ""
              }
            >

            <span>
              ${safe(option)}
            </span>

          </label>

        `
      ).join("")}

    </fieldset>

    ${
      question.futureInput?.type === "number"
        ? `
          <div
            class="future-input-control"
            style="margin-top:1rem;"
          >
            <label for="monitor-future-number">
              Temperature (${safe(question.futureInput.unit || "°C")})
            </label>

            <input
              id="monitor-future-number"
              class="monitor-number-input"
              type="number"
              step="0.1"
              inputmode="decimal"
              placeholder="Enter temperature if measured"
              aria-label="Temperature value"
            >
          </div>
        `
        : ""
    }

  `;


}


/* =========================================================
   READ QUESTION ANSWER
   ========================================================= */

function readCurrentQuestionAnswer(question) {
  if (
    question.type ===
    "multi"
  ) {
    return [
      ...document.querySelectorAll(
        'input[name="monitor-answer"]:checked'
      )
    ].map(
      input => input.value
    );
  }

  if (
    question.type ===
    "text"
  ) {
    return (
      document
        .getElementById(
          "monitor-text-answer"
        )
        ?.value
        .trim() || ""
    );
  }

  if (
    question.type ===
    "number"
  ) {
    const value =
      document
        .getElementById(
          "monitor-number-answer"
        )
        ?.value;

    return value === ""
      ? ""
      : Number(value);
  }

  return (
    document.querySelector(
      'input[name="monitor-answer"]:checked'
    )?.value || ""
  );
}


function readFutureInputValue(question) {
  if (question?.futureInput?.type !== "number") {
    return null;
  }

  const value =
    document.getElementById("monitor-future-number")?.value;

  return value === "" || value == null
    ? null
    : Number(value);
}


/* =========================================================
   ANSWER VALIDATION
   ========================================================= */

function answerIsValid(
  question,
  answer
) {

  if (!question.required) {

    return true;

  }


  if (
    question.type ===
    "multi"
  ) {

    return (
      Array.isArray(answer) &&
      answer.length > 0
    );

  }


  return (
    answer !== "" &&
    answer !== null &&
    answer !== undefined
  );

}


/* =========================================================
   SAVE CURRENT QUESTION
   ========================================================= */

function saveCurrentQuestionAnswer() {

  const session =
    appState.currentMonitoringSession;

  if (!session) {
    return false;
  }

  const allQuestions =
    getQuestionsForDay(session.day);

  const question =
    allQuestions[session.questionIndex];

  if (!question) {
    return false;
  }

  const answer =
    readCurrentQuestionAnswer(question);

  if (!answerIsValid(question, answer)) {

    const error =
      document.getElementById(
        "question-error"
      );

    if (error) {
      error.textContent =
        "Please answer this question before continuing.";
    }

    return false;

  }

  const now =
    new Date().toISOString();

  const temperatureValue =
    question.futureInput?.type === "number"
      ? readFutureInputValue(question)
      : null;

  const answerRecord = {
    questionId: question.id,
    questionText: question.text,
    answer,
    answeredAt: now
  };

  if (
    typeof temperatureValue === "number" &&
    Number.isFinite(temperatureValue)
  ) {
    answerRecord.temperatureValue = temperatureValue;
  }

  session.answers[question.id] = answerRecord;
  session.updatedAt = now;

  clearHiddenBranchAnswers(session);

  recordAuditEvent(
    "QUESTION_ANSWER_SAVED",
    {
      sessionId: session.id,
      day: session.day,
      questionId: question.id
    }
  );

  saveState();

  return true;

}


/* =========================================================
   NEXT QUESTION
   ========================================================= */

function moveMonitoringNext() {
  const session = appState.currentMonitoringSession;

  if (!session) {
    return;
  }

  if (!saveCurrentQuestionAnswer()) {
    return;
  }

  const currentQuestion =
    getQuestionsForDay(session.day)[session.questionIndex];

  const currentDeviation =
    currentQuestion
      ? evaluateQuestionDeviation(session, currentQuestion)
      : null;

  const latestDeviation =
    session.latestDeviationId
      ? appState.deviations.find(
          item => item.id === session.latestDeviationId
        )
      : null;

  if (latestDeviation?.level === 2 || currentDeviation?.level === 2) {
    adaptCarePlanAfterSession(session);
    saveState();
    renderDeviationEscalation(latestDeviation || currentDeviation);
    return;
  }

  const activeQuestions =
    getActiveQuestionsForSession(session);

  const currentIndex =
    getActiveQuestionIndex(session);

  if (
    currentIndex <
    activeQuestions.length - 1
  ) {
    const nextQuestion =
      activeQuestions[currentIndex + 1];

    const allQuestions =
      getQuestionsForDay(session.day);

    session.questionIndex =
      allQuestions.findIndex(
        q => q.id === nextQuestion.id
      );

    saveState();
    renderMonitoringQuestion();
    return;
  }

  completeMonitoringDay();
}


/* =========================================================
   BACK QUESTION
   ========================================================= */

function moveMonitoringBack() {
  const session = appState.currentMonitoringSession;

  if (!session) {
    return;
  }

  const activeQuestions =
    getActiveQuestionsForSession(session);

  const currentIndex =
    getActiveQuestionIndex(session);

  if (currentIndex <= 0) {
    return;
  }

  const currentQuestion =
    activeQuestions[currentIndex];

  if (currentQuestion) {
    const answer =
      readCurrentQuestionAnswer(currentQuestion);

    if (answerIsValid(currentQuestion, answer)) {
      session.answers[currentQuestion.id] = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        answer,
        ...(readFutureInputValue(currentQuestion) !== null
          ? {
              temperatureValue:
                readFutureInputValue(currentQuestion)
            }
          : {}),
        answeredAt: new Date().toISOString()
      };

      evaluateQuestionDeviation(
        session,
        currentQuestion
      );
    }
  }

  const previousQuestion =
    activeQuestions[currentIndex - 1];

  const allQuestions =
    getQuestionsForDay(session.day);

  session.questionIndex =
    allQuestions.findIndex(
      q => q.id === previousQuestion.id
    );

  saveState();
  renderMonitoringQuestion();
}


/* =========================================================
   COMPLETE DAILY SESSION
   ========================================================= */

function completeMonitoringDay() {
  const session = appState.currentMonitoringSession;

  if (!session) {
    return;
  }

  const activeQuestions =
    getActiveQuestionsForSession(session);

  for (const question of activeQuestions) {
    const answer =
      session.answers[question.id]?.answer;

    if (!answerIsValid(question, answer)) {
      const allQuestions =
        getQuestionsForDay(session.day);

      session.questionIndex =
        allQuestions.findIndex(
          q => q.id === question.id
        );

      saveState();
      renderMonitoringQuestion();

      const error =
        document.getElementById("question-error");

      if (error) {
        error.textContent =
          "Please answer this question before completing the day.";
      }

      return;
    }
  }

  evaluateSessionDeviations(session);

  const adaptivePlan =
    adaptCarePlanAfterSession(session);

  session.status = "COMPLETED";
  session.completedAt = new Date().toISOString();
  session.updatedAt = session.completedAt;

  const existingIndex =
    appState.monitoringHistory.findIndex(
      item => item.id === session.id
    );

  if (existingIndex === -1) {
    appState.monitoringHistory.push({
      ...session
    });
  } else {
    appState.monitoringHistory[existingIndex] = {
      ...session
    };
  }

  if (session.day < 7) {
    appState.currentDay = session.day;
    appState.monitoringStatus = "IN_PROGRESS";
  } else {
    appState.currentDay = 7;
    appState.monitoringStatus = "COMPLETED";
  }

  recordAuditEvent(
    "MONITORING_SESSION_COMPLETED",
    {
      sessionId: session.id,
      day: session.day,
      deviationCount: session.deviationIds?.length || 0,
      carePlanVersion: session.carePlanVersion
    }
  );

  appState.currentMonitoringSession = null;

  saveState();

  renderDayCompletion(session);
}


/* =========================================================
   DAY COMPLETION
   ========================================================= */

function renderDayCompletion(
  session
) {

  const nextDay =
    session.day < 7
      ? session.day + 1
      : null;


  content(`

    <section class="monitoring-shell">

      <div class="monitoring-heading">

        <div>

          <p class="eyebrow">
            DAILY PATIENT MONITORING
          </p>

          <h2>
            Day ${session.day} complete
          </h2>

          <p>
            Patient:
            <strong>
              ${safe(
                appState.patientData.name
              )}
            </strong>
          </p>

        </div>


        <span class="monitoring-status-badge">
          DAY COMPLETE
        </span>

      </div>


      ${renderDayTracker(
        session.day
      )}


      <section class="monitoring-complete-card">

        <div class="complete-icon">
          ✓
        </div>

        <p class="eyebrow">
          SESSION RECORDED
        </p>

        <h2>
          Day ${session.day} complete
        </h2>

        <p>
          Your Day ${session.day}
          monitoring responses have been recorded.
        </p>


        <div class="completion-summary">

          ${meta(
            "Questions answered",
            session.questionsAsked.length
          )}

          ${meta(
            "Deviations",
            getSessionDeviationSummary(session).count
          )}

          ${meta(
            "Highest level",
            getDeviationSeverityLabel(
              getSessionDeviationSummary(session).highestLevel
            )
          )}

          ${meta(
            "Monitoring day",
            `${session.day} of 7`
          )}

          ${meta(
            "Care plan",
            `V${session.carePlanVersion}`
          )}

        </div>

        ${adaptivePlan
          ? `
              <div class="monitoring-note">
                <strong>Care plan adapted:</strong>
                V${adaptivePlan.parentVersion} → V${adaptivePlan.version}.
                ${safe(getCarePlanChangeLabel(adaptivePlan))}
              </div>
            `
          : ""}


        <p class="monitoring-note">
          Responses are stored for the prototype.
          They have not been clinically interpreted.
        </p>


        ${
          nextDay

            ? `

              <button
                class="primary-button"
                data-next-day="${nextDay}"
              >
                START DAY ${nextDay}
              </button>

            `

            : `

              <button
                class="primary-button"
                data-finish-week
              >
                VIEW WEEKLY STATUS
              </button>

            `
        }

      </section>

    </section>

  `);

}


/* =========================================================
   START NEXT DAY
   ========================================================= */

function advanceToNextDay(
  day
) {

  const requestedDay =
    Number(day);


  const expectedDay =
    appState.currentDay + 1;


  if (
    requestedDay !==
    expectedDay
  ) {

    toast(
      `Please complete Day ${expectedDay} first.`
    );

    return;

  }


  startMonitoringDay(
    requestedDay
  );

}


/* =========================================================
   COMPLETE WEEK
   ========================================================= */

function finishWeek() {

  appState.currentDay = 7;

  appState.monitoringStatus =
    "COMPLETED";

  appState.currentMonitoringSession =
    null;

  saveState();

  renderPage();

}


/* =========================================================
   WEEK COMPLETE
   ========================================================= */

function renderMonitoringComplete() {

  content(`

    <section class="monitoring-shell">

      <div class="monitoring-heading">

        <div>

          <p class="eyebrow">
            DAILY PATIENT MONITORING
          </p>

          <h2>
            7-day monitoring complete
          </h2>

          <p>
            Patient:
            <strong>
              ${safe(
                appState.patientData.name
              )}
            </strong>
          </p>

        </div>


        <span class="monitoring-status-badge">
          COMPLETED
        </span>

      </div>


      ${renderDayTracker(7)}


      <section class="monitoring-complete-card">

        <div class="complete-icon">
          ✓
        </div>

        <p class="eyebrow">
          MONITORING PERIOD
        </p>

        <h2>
          7-day monitoring complete
        </h2>

        <p>
          The prototype monitoring workflow has
          reached Day 7.
        </p>


        <div class="completion-summary">

          ${meta(
            "Monitoring period",
            "Day 1 → Day 7"
          )}

          ${meta(
            "Sessions",
            appState.monitoringHistory.length
          )}

          ${meta(
            "Care plan",
            `V${appState.currentCarePlanVersion}`
          )}

        </div>


        <button
          class="secondary-button"
          data-go="history"
        >
          VIEW MONITORING HISTORY
        </button>

      </section>

    </section>

  `);

}


/* =========================================================
   DAY TRACKER
   ========================================================= */

function renderDayTracker(
  activeDay
) {

  return `

    <div
      class="day-tracker"
      aria-label="Seven day monitoring progress"
    >

      ${Array.from(
        { length: 7 },
        (_, index) => {

          const day =
            index + 1;


          const completed =
            appState.monitoringHistory.some(
              session =>
                session.day === day &&
                session.status ===
                  "COMPLETED"
            );


          let className =
            "locked";


          if (
            completed &&
            day !== activeDay
          ) {

            className =
              "complete";

          }


          if (
            day === activeDay
          ) {

            className =
              "current";

          }


          return `

            <div
              class="day-step ${className}"
            >

              <span>
                ${day}
              </span>

              <small>
                DAY ${day}
              </small>

            </div>

          `;

        }
      ).join("")}

    </div>

  `;

}



/* =========================================================
   PHASE 7
   ADAPTIVE CARE PLAN V1 → V2 → V3
   ========================================================= */

function getLatestCompletedSession() {
  const history = Array.isArray(appState.monitoringHistory)
    ? appState.monitoringHistory
    : [];

  return history
    .slice()
    .sort(
      (a, b) =>
        new Date(b.completedAt || 0) -
        new Date(a.completedAt || 0)
    )[0] || null;
}

function getPlanItemByParameter(plan, parameterKeyOrLabel) {
  if (!plan || !Array.isArray(plan.items)) return null;

  return plan.items.find(item =>
    item.parameterKey === parameterKeyOrLabel ||
    item.parameter === parameterKeyOrLabel
  ) || null;
}

function clonePlanItems(plan) {
  return (plan?.items || []).map(item => ({
    ...item,
    parameterKey: item.parameterKey || item.id || null
  }));
}

function setPlanItem(items, parameterKey, changes) {
  const item = items.find(
    current => current.parameterKey === parameterKey
  );

  if (!item) return;

  Object.assign(item, changes);
}

function getAdaptiveChangesForDeviations(deviations) {
  const changes = {
    level: 0,
    parameters: new Set(),
    reasons: [],
    sourceDeviationIds: []
  };

  for (const deviation of deviations) {
    changes.level = Math.max(
      changes.level,
      Number(deviation.level) || 0
    );

    changes.sourceDeviationIds.push(deviation.id);

    const label = deviation.ruleLabel || "Configured deviation";

    if (!changes.reasons.includes(label)) {
      changes.reasons.push(label);
    }

    switch (deviation.ruleId) {
      case "TEMP_38":
      case "TEMP_38_BINARY":
        changes.parameters.add("temperature");
        changes.parameters.add("generalSymptoms");
        break;

      case "LITTLE_NO_URINE":
      case "WORSENING_URINE":
        changes.parameters.add("urineOutput");
        break;

      case "WORSENING_PAIN":
        changes.parameters.add("pain");
        break;

      case "NEW_SWELLING":
        changes.parameters.add("swelling");
        break;

      case "MISSED_MEDICATION":
        changes.parameters.add("medicationAdherence");
        break;

      case "GI_SYMPTOMS":
      case "SEVERE_SYSTEMIC_WARNING":
        changes.parameters.add("vomiting");
        changes.parameters.add("diarrhea");
        changes.parameters.add("generalSymptoms");
        break;

      case "NEW_WORSENING_SYMPTOMS":
      case "WORSENING_CONDITION":
        changes.parameters.add("generalSymptoms");
        break;

      case "FOLLOW_UP_NOT_COMPLETED":
        changes.parameters.add("followUp");
        break;

      default:
        changes.parameters.add("generalSymptoms");
        break;
    }
  }

  return changes;
}

function getAdaptiveParameterLabel(key) {
  const match = parameters.find(
    ([parameterKey]) => parameterKey === key
  );

  if (match) return match[1];

  if (key === "followUp") return "Follow-up Status";

  return key;
}

function buildAdaptiveCarePlan(previousPlan, deviations, session) {
  if (!appState.patientData || !previousPlan || !deviations.length) {
    return null;
  }

  const changes = getAdaptiveChangesForDeviations(deviations);
  const nextVersion = previousPlan.version + 1;
  const items = clonePlanItems(previousPlan);

  for (const parameterKey of changes.parameters) {
    if (parameterKey === "followUp") continue;

    const item = items.find(
      current => current.parameterKey === parameterKey
    );

    if (!item) continue;

    if (changes.level >= 2) {
      item.monitoringLevel = "Urgent clinical escalation";
      item.priority = "Critical";
      item.frequency = "Immediate clinical review";
      item.status = "ESCALATION";
      item.reason =
        "Serious warning signal detected; clinician review is required.";
    } else {
      item.monitoringLevel = "Increased monitoring";
      item.priority =
        item.priority === "High" ? "High" : "Elevated";
      item.frequency = "Additional monitoring enabled";
      item.status = "ADAPTIVE";
      item.reason =
        "Monitoring increased after a potential deviation was detected.";
    }
  }

  const plan = {
    version: nextVersion,
    createdAt: new Date().toISOString(),
    patientId: appState.patientData.id,
    status: "ACTIVE",
    planType: "ADAPTIVE",
    parentVersion: previousPlan.version,
    effectiveDay: session?.day || null,
    changeType:
      changes.level >= 2
        ? "SERIOUS_WARNING_ESCALATION"
        : "POTENTIAL_DEVIATION_ADAPTATION",
    changeReason: changes.reasons.join(", "),
    sourceDeviationIds: changes.sourceDeviationIds,
    items
  };

  return plan;
}

function adaptCarePlanAfterSession(session) {
  if (!session || !appState.patientData) return null;

  const sessionDeviations =
    (appState.deviations || []).filter(
      deviation => deviation.sessionId === session.id
    );

  if (!sessionDeviations.length) {
    return null;
  }

  const previousPlan = currentPlan();

  if (!previousPlan) {
    return null;
  }

  const existingAdaptivePlan =
    (appState.carePlans || []).find(
      plan =>
        plan.planType === "ADAPTIVE" &&
        plan.effectiveDay === session.day &&
        plan.parentVersion === previousPlan.version
    );

  if (existingAdaptivePlan) {
    appState.currentCarePlanVersion = existingAdaptivePlan.version;
    session.carePlanVersion = existingAdaptivePlan.version;
    return existingAdaptivePlan;
  }

  const adaptivePlan = buildAdaptiveCarePlan(
    previousPlan,
    sessionDeviations,
    session
  );

  if (!adaptivePlan) return null;

  appState.carePlans.push(adaptivePlan);
  appState.currentCarePlanVersion = adaptivePlan.version;
  session.carePlanVersion = adaptivePlan.version;

  return adaptivePlan;
}

function getCarePlanChangeLabel(plan) {
  if (!plan) return "";

  if (plan.changeType === "SERIOUS_WARNING_ESCALATION") {
    return "Serious warning → escalation monitoring";
  }

  if (plan.changeType === "POTENTIAL_DEVIATION_ADAPTATION") {
    return "Potential deviation → increased monitoring";
  }

  return "Initial configured plan";
}


/* =========================================================
   PHASE 6
   DEVIATION DETECTION
   ========================================================= */

const deviationRules = [
  {
    id: "TEMP_38",
    level: 2,
    label: "Temperature warning",
    questionIds: [
      "day1_temperature_measured",
      "day2_temperature_measured"
    ],
    check: ({ questionId, answer, session }) => {
      const temperature =
        session.answers[questionId]?.temperatureValue;

      return (
        (
          questionId === "day1_temperature_measured" ||
          questionId === "day2_temperature_measured"
        ) &&
        answer === "Yes" &&
        typeof temperature === "number" &&
        temperature >= 38
      );
    },
    evidence: "Recorded temperature is at or above 38°C.",
    signal: "Potential transplant warning sign detected.",
    patientInstruction:
      "Please contact your transplant team / follow your urgent discharge instructions for urgent clinical assessment."
  },

  {
    id: "LITTLE_NO_URINE",
    level: 2,
    label: "Little or no urine",
    questionIds: [
      "day1_urine_output",
      "day2_urine_output",
      "day3_urine_output",
      "day5_urine_output"
    ],
    check: ({ answer }) =>
      answer === "Little or no urine",
    evidence: "Patient reported little or no urine output.",
    signal: "Potential transplant warning sign detected.",
    patientInstruction:
      "Please contact your transplant team / follow your urgent discharge instructions for urgent clinical assessment."
  },

  {
    id: "TEMP_38_BINARY",
    level: 2,
    label: "Temperature ≥38°C",
    questionIds: [
      "day6_temperature_38",
      "day7_temperature_38"
    ],
    check: ({ answer }) =>
      answer === "Yes",
    evidence: "Patient reported a temperature reading at or above 38°C.",
    signal: "Potential transplant warning sign detected.",
    patientInstruction:
      "Please contact your transplant team / follow your urgent discharge instructions for urgent clinical assessment."
  },

  {
    id: "SEVERE_SYSTEMIC_WARNING",
    level: 2,
    label: "Serious warning symptom",
    questionIds: [
      "day2_symptoms_selected",
      "day4_symptoms"
    ],
    check: ({ questionId, answer }) => {
      if (
        questionId === "day2_symptoms_selected" &&
        Array.isArray(answer)
      ) {
        return answer.some(item =>
          [
            "Fever / feeling hot or shivery",
            "Vomiting",
            "Diarrhea"
          ].includes(item)
        );
      }

      if (
        questionId === "day4_symptoms" &&
        answer === "Yes"
      ) {
        return true;
      }

      return false;
    },
    evidence: "Patient reported a configured transplant warning symptom.",
    signal: "Potential transplant warning sign detected.",
    patientInstruction:
      "Please contact your transplant team / follow your urgent discharge instructions for urgent clinical assessment."
  },

  {
    id: "WORSENING_URINE",
    level: 1,
    label: "Worsening urine output",
    questionIds: [
      "day1_urine_output",
      "day2_urine_output",
      "day3_urine_output",
      "day5_urine_output",
      "day6_urine_output"
    ],
    check: ({ answer }) =>
      [
        "Less than usual",
        "Slightly less",
        "Much less",
        "Decreasing",
        "Less"
      ].includes(answer),
    evidence: "Patient reported reduced or decreasing urine output.",
    signal: "Potential deviation detected — clinical review recommended."
  },

  {
    id: "NEW_WORSENING_SYMPTOMS",
    level: 1,
    label: "New or worsening symptoms",
    questionIds: [
      "day1_new_symptoms",
      "day2_new_symptoms",
      "day5_symptoms",
      "day7_symptoms"
    ],
    check: ({ answer }) =>
      answer === "Yes",
    evidence: "Patient reported new or worsening symptoms.",
    signal: "Potential deviation detected — clinical review recommended."
  },

  {
    id: "WORSENING_CONDITION",
    level: 1,
    label: "Worsening overall condition",
    questionIds: [
      "day1_overall_feeling",
      "day2_overall_feeling",
      "day3_worsening_symptom",
      "day4_recovery",
      "day6_condition",
      "day7_recovery"
    ],
    check: ({ questionId, answer }) => {
      if (
        [
          "day1_overall_feeling",
          "day2_overall_feeling",
          "day4_recovery"
        ].includes(questionId)
      ) {
        return answer === "Worse";
      }

      if (
        questionId === "day3_worsening_symptom" ||
        questionId === "day6_condition"
      ) {
        return (
          answer === "Yes" ||
          answer === "Getting worse"
        );
      }

      if (questionId === "day7_recovery") {
        return answer === "Worsening";
      }

      return false;
    },
    evidence: "Patient reported worsening overall condition or recovery.",
    signal: "Potential deviation detected — clinical review recommended."
  },

  {
    id: "WORSENING_PAIN",
    level: 1,
    label: "Worsening pain",
    questionIds: [
      "day1_pain",
      "day2_pain",
      "day3_pain",
      "day4_pain",
      "day7_pain_swelling"
    ],
    check: ({ questionId, answer }) => {
      if (
        ["day1_pain", "day2_pain"].includes(questionId)
      ) {
        return answer === "Worse";
      }

      if (
        ["day3_pain", "day4_pain"].includes(questionId)
      ) {
        return answer === "Worsening";
      }

      return questionId === "day7_pain_swelling" &&
        answer === "Yes";
    },
    evidence: "Patient reported increasing or worsening pain.",
    signal: "Potential deviation detected — clinical review recommended."
  },

  {
    id: "NEW_SWELLING",
    level: 1,
    label: "New or increasing swelling",
    questionIds: [
      "day1_swelling",
      "day2_symptoms_selected",
      "day2_swelling_increased",
      "day3_swelling",
      "day4_swelling",
      "day5_swelling",
      "day7_pain_swelling"
    ],
    check: ({ questionId, answer }) => {
      if (
        questionId === "day2_symptoms_selected" &&
        Array.isArray(answer)
      ) {
        return answer.includes("Swelling");
      }

      return answer === "Yes";
    },
    evidence: "Patient reported new or increasing swelling.",
    signal: "Potential deviation detected — clinical review recommended."
  },

  {
    id: "MISSED_MEDICATION",
    level: 1,
    label: "Missed transplant medication",
    questionIds: [
      "day1_medication",
      "day2_medication",
      "day3_medication",
      "day5_medication_missed",
      "day6_medication_missed",
      "day7_medication_missed"
    ],
    check: ({ questionId, answer }) => {
      if (
        questionId === "day1_medication" ||
        questionId === "day2_medication"
      ) {
        return answer === "No";
      }

      return answer === "Yes";
    },
    evidence: "Patient reported a missed or non-adherent transplant medication dose.",
    signal: "Potential deviation detected — clinical review recommended."
  },

  {
    id: "GI_SYMPTOMS",
    level: 1,
    label: "Vomiting or diarrhea",
    questionIds: [
      "day3_gastrointestinal",
      "day5_gastrointestinal"
    ],
    check: ({ answer }) =>
      answer === "Yes",
    evidence: "Patient reported vomiting or diarrhea.",
    signal: "Potential deviation detected — clinical review recommended."
  },

  {
    id: "FOLLOW_UP_NOT_COMPLETED",
    level: 1,
    label: "Follow-up status",
    questionIds: [
      "day7_follow_up"
    ],
    check: ({ answer }) =>
      answer === "No",
    evidence: "Scheduled transplant follow-up was reported as not completed.",
    signal: "Potential deviation detected — clinical review recommended."
  }
];


function getDeviationSeverityLabel(level) {
  if (level === 2) {
    return "SERIOUS WARNING";
  }

  if (level === 1) {
    return "POTENTIAL DEVIATION";
  }

  return "NO DEVIATION";
}


function getDeviationKey(session, questionId, ruleId) {
  return `${session.id}:${questionId}:${ruleId}`;
}


function evaluateQuestionDeviation(session, question) {
  if (!session || !question) {
    return null;
  }

  const answerRecord =
    session.answers?.[question.id];

  if (!answerRecord) {
    return null;
  }

  const answer =
    answerRecord.answer;

  for (const rule of deviationRules) {
    if (!rule.questionIds.includes(question.id)) {
      continue;
    }

    let triggered = false;

    try {
      triggered = Boolean(
        rule.check({
          questionId: question.id,
          answer,
          session
        })
      );
    } catch (error) {
      console.error(
        "Deviation rule evaluation failed:",
        rule.id,
        error
      );
    }

    if (!triggered) {
      continue;
    }

    const key =
      getDeviationKey(
        session,
        question.id,
        rule.id
      );

    const existing =
      appState.deviations.find(
        item => item.key === key
      );

    if (existing) {
      return existing;
    }

    const deviation = {
      id: `deviation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      key,
      patientId: session.patientId,
      sessionId: session.id,
      day: session.day,
      questionId: question.id,
      questionText: question.text,
      answer,
      level: rule.level,
      severity: getDeviationSeverityLabel(rule.level),
      ruleId: rule.id,
      ruleLabel: rule.label,
      evidence: rule.evidence,
      clinicalSignal: rule.signal,
      patientInstruction: rule.patientInstruction || null,
      status: "OPEN",
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      reviewNote: ""
    };

    appState.deviations.push(deviation);

    session.deviationIds =
      Array.isArray(session.deviationIds)
        ? session.deviationIds
        : [];

    session.deviationIds.push(deviation.id);

    session.latestDeviationId =
      deviation.id;

    saveState();

    return deviation;
  }

  return null;
}


function evaluateSessionDeviations(session) {
  if (!session) {
    return [];
  }

  const activeQuestions =
    getActiveQuestionsForSession(session);

  return activeQuestions
    .map(question =>
      evaluateQuestionDeviation(session, question)
    )
    .filter(Boolean);
}


function getOpenDeviations() {
  return (appState.deviations || [])
    .filter(item => item.status === "OPEN")
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );
}


function renderDeviationBanner(deviation) {
  if (!deviation) {
    return "";
  }

  const serious =
    deviation.level === 2;

  return `
    <section
      class="overview-section"
      style="margin-bottom:1rem;"
      aria-live="assertive"
    >

      <p class="eyebrow">
        ${safe(deviation.severity)}
      </p>

      <h3>
        ${safe(deviation.clinicalSignal)}
      </h3>

      <p>
        <strong>Evidence:</strong>
        ${safe(deviation.evidence)}
      </p>

      ${
        serious
          ? `
            <p>
              <strong>
                ${safe(deviation.patientInstruction)}
              </strong>
            </p>
          `
          : ""
      }

      <p class="monitoring-note">
        This prototype does not diagnose, prescribe, change medication,
        or make autonomous clinical decisions.
      </p>

    </section>
  `;
}


function renderDeviationStatusForSession(session) {
  const deviations =
    (appState.deviations || [])
      .filter(item => item.sessionId === session.id);

  if (!deviations.length) {
    return `
      <span class="history-deviation-status">
        NO DEVIATION
      </span>
    `;
  }

  const highest =
    Math.max(
      ...deviations.map(item => item.level)
    );

  return `
    <span class="history-deviation-status">
      ${safe(getDeviationSeverityLabel(highest))}
    </span>
  `;
}


function renderDeviationReviewControls(deviation) {
  return `
    <div
      class="deviation-review-controls"
      style="margin-top:1rem;"
    >

      ${
        deviation.status === "OPEN"
          ? `
            <button
              class="secondary-button"
              type="button"
              data-review-deviation="${esc(deviation.id)}"
            >
              MARK AS REVIEWED
            </button>
          `
          : `
            <span>
              Reviewed
              ${
                deviation.reviewedAt
                  ? new Date(
                      deviation.reviewedAt
                    ).toLocaleString()
                  : ""
              }
            </span>
          `
      }

    </div>
  `;
}


function markDeviationReviewed(deviationId) {
  const deviation =
    (appState.deviations || []).find(
      item => item.id === deviationId
    );

  if (!deviation) {
    toast("Deviation could not be found.");
    return;
  }

  deviation.status = "REVIEWED";
  deviation.reviewedAt = new Date().toISOString();
  deviation.reviewedBy = "Clinician";
  deviation.reviewNote =
    "Marked reviewed in prototype clinician workflow.";

  saveState();
  updateHeader();
  alerts();

  toast("Deviation marked as reviewed.");
}


function getSessionDeviationSummary(session) {
  const deviations =
    (appState.deviations || [])
      .filter(item => item.sessionId === session.id);

  if (!deviations.length) {
    return {
      count: 0,
      highestLevel: 0
    };
  }

  return {
    count: deviations.length,
    highestLevel: Math.max(
      ...deviations.map(item => item.level)
    )
  };
}


function renderDeviationEscalation(deviation) {
  const session =
    appState.currentMonitoringSession;

  content(`

    <section class="monitoring-shell">

      <div class="monitoring-heading">

        <div>

          <p class="eyebrow">
            CLINICAL ESCALATION SIGNAL
          </p>

          <h2>
            ${safe(appState.patientData?.name || "Patient")}
          </h2>

          <p>
            Day ${session?.day || deviation.day}
          </p>

        </div>

        <span class="monitoring-status-badge">
          REVIEW REQUIRED
        </span>

      </div>

      <section class="monitoring-complete-card">

        <div class="complete-icon">
          !
        </div>

        <p class="eyebrow">
          ${safe(deviation.severity)}
        </p>

        <h2>
          Clinical review recommended
        </h2>

        <p>
          ${safe(deviation.evidence)}
        </p>

        <p>
          <strong>
            ${safe(deviation.patientInstruction || "Please follow your configured transplant-team instructions.")}
          </strong>
        </p>

        <p class="monitoring-note">
          This prototype does not diagnose, prescribe,
          recommend medication changes, or make autonomous
          clinical decisions.
        </p>

        <div class="question-actions">

          <button
            class="secondary-button"
            type="button"
            data-go="alerts"
          >
            VIEW ALERTS
          </button>

          <button
            class="primary-button"
            type="button"
            data-go="review"
          >
            OPEN CLINICIAN REVIEW
          </button>

        </div>

      </section>

    </section>

  `);
}


/* =========================================================
   ALERTS
   ========================================================= */

function alerts() {
  const deviations =
    getOpenDeviations();

  if (!deviations.length) {
    empty(
      "Alerts",
      "No open deviations. New alerts will appear when configured monitoring rules are triggered.",
      "✓"
    );
    return;
  }

  content(`

    <section class="overview">

      <div class="dashboard-intro">

        <div>
          <p class="eyebrow">
            CLINICAL ESCALATION SIGNALS
          </p>

          <h2>
            Open alerts
          </h2>

          <p>
            These are rule-based prototype signals for clinician review.
            They are not diagnoses or treatment recommendations.
          </p>
        </div>

      </div>

      <div class="status-grid">

        ${status(
          "OPEN DEVIATIONS",
          deviations.length
        )}

        ${status(
          "SERIOUS WARNINGS",
          deviations.filter(
            item => item.level === 2
          ).length
        )}

        ${status(
          "POTENTIAL DEVIATIONS",
          deviations.filter(
            item => item.level === 1
          ).length
        )}

      </div>

      <section class="overview-section">

        <p class="eyebrow">
          REVIEW QUEUE
        </p>

        <h2>
          Evidence requiring clinician review
        </h2>

        <div class="history-list">

          ${deviations.map(
            deviation => `

              <article class="history-item">

                <div class="history-day">

                  <span>
                    DAY
                  </span>

                  <strong>
                    ${deviation.day}
                  </strong>

                </div>

                <div class="history-content">

                  <h3>
                    ${safe(deviation.severity)}
                  </h3>

                  <p>
                    ${safe(deviation.ruleLabel)}
                  </p>

                  <div class="history-meta">

                    <span>
                      Evidence:
                      ${safe(deviation.evidence)}
                    </span>

                    <span>
                      Answer:
                      ${
                        Array.isArray(deviation.answer)
                          ? deviation.answer
                              .map(value => safe(value))
                              .join(", ")
                          : safe(deviation.answer)
                      }
                    </span>

                  </div>

                  ${
                    deviation.level === 2
                      ? `
                        <p class="monitoring-note">
                          ${safe(deviation.patientInstruction || "")}
                        </p>
                      `
                      : ""
                  }

                  ${renderDeviationReviewControls(deviation)}

                </div>

              </article>

            `
          ).join("")}

        </div>

      </section>

    </section>

  `);
}


/* =========================================================
   HISTORY
   ========================================================= */

function history() {

  const sessions =
    Array.isArray(appState.monitoringHistory)
      ? [...appState.monitoringHistory]
      : [];

  if (!sessions.length) {

    if (!appState.patientData) {
      empty(
        "Monitoring History",
        "Register a patient to begin recording monitoring history.",
        "↶"
      );
      return;
    }

    content(`

      <section class="overview">

        <div class="dashboard-intro">

          <div>
            <p class="eyebrow">
              MONITORING HISTORY
            </p>

            <h2>
              No sessions recorded yet
            </h2>

            <p>
              Monitoring responses will remain available
              here after each completed day.
            </p>
          </div>

          <button
            class="secondary-button"
            type="button"
            data-go="monitoring"
          >
            GO TO MONITORING
          </button>

        </div>

        ${renderPersistenceCard()}

      </section>

    `);

    return;

  }

  sessions.sort(
    (a, b) =>
      a.day - b.day ||
      new Date(a.completedAt || 0) -
        new Date(b.completedAt || 0)
  );

  const completedCount =
    sessions.filter(
      session =>
        session.status === "COMPLETED"
    ).length;

  const deviationCount =
    (appState.deviations || []).length;

  content(`

    <section class="overview">

      <div class="dashboard-intro">

        <div>

          <p class="eyebrow">
            MONITORING HISTORY
          </p>

          <h2>
            Recorded sessions
          </h2>

          <p>
            ${sessions.length}
            session${sessions.length === 1 ? "" : "s"}
            stored for this patient.
          </p>

        </div>

        <button
          class="secondary-button"
          type="button"
          data-export-record
        >
          EXPORT PATIENT RECORD
        </button>

      </div>

      <div class="status-grid">

        ${status(
          "COMPLETED SESSIONS",
          completedCount
        )}

        ${status(
          "DEVIATIONS",
          deviationCount
        )}

        ${status(
          "CARE PLAN",
          `V${appState.currentCarePlanVersion || 0}`
        )}

        ${status(
          "STORAGE",
          "LOCAL"
        )}

      </div>

      ${renderPersistenceCard()}

      <section class="overview-section">

        <p class="eyebrow">
          SEVEN-DAY TIMELINE
        </p>

        <h2>
          Monitoring sessions
        </h2>

        <div class="history-list">

          ${sessions.map(
            session => {

              const sessionDeviations =
                (appState.deviations || [])
                  .filter(
                    item =>
                      item.sessionId ===
                      session.id
                  );

              const highestLevel =
                sessionDeviations.length
                  ? Math.max(
                      ...sessionDeviations.map(
                        item =>
                          Number(item.level) || 0
                      )
                    )
                  : 0;

              return `

                <article class="history-item">

                  <div class="history-day">
                    <span>DAY</span>
                    <strong>${session.day}</strong>
                  </div>

                  <div class="history-content">

                    <h3>
                      Day ${session.day} monitoring
                    </h3>

                    <p>
                      Completed:
                      ${
                        session.completedAt
                          ? new Date(
                              session.completedAt
                            ).toLocaleString()
                          : "Not completed"
                      }
                    </p>

                    <div class="history-meta">

                      <span>
                        ${
                          Object.keys(
                            session.answers || {}
                          ).length
                        }
                        answers
                      </span>

                      <span>
                        ${
                          sessionDeviations.length
                        }
                        deviation${
                          sessionDeviations.length === 1
                            ? ""
                            : "s"
                        }
                      </span>

                      ${
                        highestLevel
                          ? `
                            <span>
                              ${safe(
                                getDeviationSeverityLabel(
                                  highestLevel
                                )
                              )}
                            </span>
                          `
                          : ""
                      }

                      <span>
                        Care Plan
                        V${session.carePlanVersion || 0}
                      </span>

                      <span>
                        ${safe(
                          session.status || "UNKNOWN"
                        )}
                      </span>

                    </div>

                    <button
                      class="secondary-button"
                      type="button"
                      data-view-session="${esc(
                        session.id
                      )}"
                    >
                      VIEW RESPONSES
                    </button>

                  </div>

                </article>

              `;

            }
          ).join("")}

        </div>

      </section>

    </section>

  `);

}

function renderPersistenceCard() {

  const summary =
    getPersistenceSummary();

  const savedAt =
    summary.lastSavedAt
      ? new Date(
          summary.lastSavedAt
        ).toLocaleString()
      : "Not available";

  return `

    <section
      class="overview-section"
      style="margin-top:1rem;"
    >

      <p class="eyebrow">
        PERSISTENCE
      </p>

      <h2>
        Local record storage
      </h2>

      <div class="history-meta">

        <span>
          Schema V${summary.schemaVersion}
        </span>

        <span>
          Last saved:
          ${safe(savedAt)}
        </span>

        <span>
          ${summary.historyCount}
          session${
            summary.historyCount === 1
              ? ""
              : "s"
          }
        </span>

        <span>
          ${summary.carePlanCount}
          care-plan version${
            summary.carePlanCount === 1
              ? ""
              : "s"
          }
        </span>

        <span>
          ${summary.deviationCount}
          deviation${
            summary.deviationCount === 1
              ? ""
              : "s"
          }
        </span>

      </div>

      <p class="monitoring-note">
        Prototype data is stored in this browser using
        localStorage. It is not a production clinical
        record system or secure medical-record repository.
      </p>

    </section>

  `;

}


/* =========================================================
   VIEW SESSION
   ========================================================= */

function viewMonitoringSession(
  sessionId
) {

  const session =
    appState.monitoringHistory.find(
      item =>
        item.id === sessionId
    );


  if (!session) {

    toast(
      "Monitoring session could not be found."
    );

    return;

  }


  const answers =
    Object.values(
      session.answers || {}
    );


  content(`

    <section class="overview">

      <div class="dashboard-intro">

        <div>

          <p class="eyebrow">
            MONITORING SESSION
          </p>

          <h2>
            Day ${session.day}
          </h2>

          <p>
            ${
              session.completedAt
                ? new Date(
                    session.completedAt
                  ).toLocaleString()
                : ""
            }
          </p>

        </div>


        <button
          class="secondary-button"
          data-go="history"
        >
          BACK TO HISTORY
        </button>

      </div>


      ${details(
        "Session details",
        [
          [
            "Patient",
            appState.patientData?.name ||
              "—"
          ],
          [
            "Patient ID",
            session.patientId
          ],
          [
            "Care Plan",
            `V${session.carePlanVersion}`
          ],
          [
            "Questions",
            answers.length
          ]
        ]
      )}


      <section class="overview-section">

        <p class="eyebrow">
          DEVIATION REVIEW
        </p>

        <h2>
          Rule-based signals
        </h2>

        ${
          (appState.deviations || [])
            .filter(item => item.sessionId === session.id)
            .map(
              deviation => `
                <article class="history-item">

                  <div class="history-content">

                    <h3>
                      ${safe(deviation.severity)}
                    </h3>

                    <p>
                      ${safe(deviation.clinicalSignal)}
                    </p>

                    <p>
                      <strong>Evidence:</strong>
                      ${safe(deviation.evidence)}
                    </p>

                    ${renderDeviationReviewControls(deviation)}

                  </div>

                </article>
              `
            )
            .join("") ||
          `<p>No deviations recorded for this session.</p>`
        }

      </section>


      <section class="overview-section">

        <p class="eyebrow">
          RECORDED RESPONSES
        </p>

        <h2>
          Questions and answers
        </h2>


        <div class="session-response-list">

          ${answers.map(
            (item, index) => `

              <article
                class="session-response"
              >

                <div class="response-number">
                  ${index + 1}
                </div>


                <div>

                  <p class="response-question">
                    ${safe(
                      item.questionText
                    )}
                  </p>


                  <p class="response-answer">

                    ${
                      Array.isArray(
                        item.answer
                      )

                        ? item.answer
                            .map(
                              value =>
                                safe(value)
                            )
                            .join(", ")

                        : safe(
                            item.answer
                          )
                    }

                  </p>


                  <small>

                    ${
                      item.answeredAt
                        ? new Date(
                            item.answeredAt
                          ).toLocaleString()
                        : ""
                    }

                  </small>

                </div>

              </article>

            `
          ).join("")}

        </div>

      </section>

    </section>

  `);

}


/* =========================================================
   CLINICIAN REVIEW
   ========================================================= */

function getCompletedMonitoringDays() {
  return [...new Set(
    (appState.monitoringHistory || [])
      .filter(session => session.status === "COMPLETED")
      .map(session => session.day)
  )].sort((a, b) => a - b);
}

function getAllDeviations() {
  return Array.isArray(appState.deviations)
    ? [...appState.deviations].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )
    : [];
}

function getTemperatureTrend() {
  const points = [];

  (appState.monitoringHistory || []).forEach(session => {
    Object.values(session.answers || {}).forEach(answer => {
      if (
        typeof answer?.temperatureValue === "number" &&
        Number.isFinite(answer.temperatureValue)
      ) {
        points.push({
          day: session.day,
          value: answer.temperatureValue,
          questionId: answer.questionId,
          answeredAt: answer.answeredAt
        });
      }
    });
  });

  return points.sort((a, b) =>
    a.day - b.day ||
    new Date(a.answeredAt || 0) - new Date(b.answeredAt || 0)
  );
}

function renderTimeline(items, emptyText, formatter) {
  if (!items.length) {
    return `<p class="muted">${safe(emptyText)}</p>`;
  }

  return `
    <div class="history-list">
      ${items.map(formatter).join("")}
    </div>
  `;
}

function renderTemperatureChart() {
  const points = getTemperatureTrend();

  if (!points.length) {
    return `
      <div class="overview-section">
        <p class="eyebrow">OBSERVED NUMERIC DATA</p>
        <h3>Temperature trend</h3>
        <p class="muted">No patient-entered temperature values are available yet.</p>
      </div>
    `;
  }

  const width = 720;
  const height = 250;
  const pad = 42;
  const min = Math.min(35, ...points.map(p => p.value)) - 0.2;
  const max = Math.max(38.5, ...points.map(p => p.value)) + 0.2;
  const x = i => points.length === 1
    ? width / 2
    : pad + i * ((width - pad * 2) / (points.length - 1));
  const y = value =>
    height - pad - ((value - min) / (max - min)) * (height - pad * 2);
  const path = points.map((point, i) =>
    `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(point.value).toFixed(1)}`
  ).join(" ");
  const thresholdY = y(38);

  return `
    <div class="overview-section">
      <p class="eyebrow">OBSERVED NUMERIC DATA</p>
      <h3>Temperature trend</h3>
      <p class="muted">Patient-entered observations only. The dashed line is the configured 38°C warning threshold, not a recovery target.</p>
      <div style="overflow-x:auto;">
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Observed temperature trend" style="width:100%;min-width:560px;height:auto;">
          <line x1="${pad}" y1="${thresholdY}" x2="${width-pad}" y2="${thresholdY}" stroke="currentColor" stroke-dasharray="7 5" opacity="0.45"></line>
          <text x="${width-pad}" y="${Math.max(16, thresholdY-7)}" text-anchor="end" font-size="12">38°C warning threshold</text>
          <line x1="${pad}" y1="${height-pad}" x2="${width-pad}" y2="${height-pad}" stroke="currentColor" opacity="0.2"></line>
          <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height-pad}" stroke="currentColor" opacity="0.2"></line>
          <path d="${path}" fill="none" stroke="currentColor" stroke-width="3"></path>
          ${points.map((point, i) => `
            <circle cx="${x(i)}" cy="${y(point.value)}" r="5" fill="currentColor"></circle>
            <text x="${x(i)}" y="${height-18}" text-anchor="middle" font-size="12">D${point.day}</text>
            <text x="${x(i)}" y="${y(point.value)-10}" text-anchor="middle" font-size="12">${point.value.toFixed(1)}°C</text>
          `).join("")}
        </svg>
      </div>
    </div>
  `;
}

function review() {
  const patient = appState.patientData;
  const completedDays = getCompletedMonitoringDays();
  const allDeviations = getAllDeviations();
  const open = allDeviations.filter(item => item.status === "OPEN");
  const serious = open.filter(item => item.level === 2);
  const reviewed = allDeviations.filter(item => item.status === "REVIEWED");
  const latestSession = [...(appState.monitoringHistory || [])]
    .sort((a, b) => new Date(b.completedAt || b.updatedAt || 0) - new Date(a.completedAt || a.updatedAt || 0))[0];
  const latestDeviation = allDeviations[0];
  const plan = currentPlan();
  const plans = [...(appState.carePlans || [])].sort((a, b) => a.version - b.version);

  if (!patient) {
    empty(
      "Clinician Dashboard",
      "Register a patient before opening the clinician review dashboard.",
      "□"
    );
    return;
  }

  recordAuditEvent("CLINICIAN_DASHBOARD_VIEWED", {
    completedDays: completedDays.length,
    openDeviationCount: open.length,
    currentCarePlanVersion: plan?.version || null
  });

  content(`
    <section class="overview">
      <div class="dashboard-intro">
        <div>
          <p class="eyebrow">CLINICIAN DASHBOARD</p>
          <h2>${safe(patient.name || "Registered patient")}</h2>
          <p>Post-discharge monitoring overview for clinician review.</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="secondary-button" data-nav="trends">OPEN TRENDS</button>
          <button class="secondary-button" data-nav="history">MONITORING HISTORY</button>
        </div>
      </div>

      <div class="status-grid">
        ${status("MONITORING", `${completedDays.length} / 7 days`)}
        ${status("CURRENT PLAN", plan ? `V${plan.version}` : "Not created")}
        ${status("OPEN DEVIATIONS", open.length)}
        ${status("SERIOUS WARNINGS", serious.length)}
        ${status("REVIEWED", reviewed.length)}
        ${status("STATUS", serious.length ? "Clinician review required" : open.length ? "Review open signals" : "No open signals")}
      </div>

      <section class="overview-section">
        <p class="eyebrow">PATIENT PROFILE</p>
        <div class="status-grid">
          ${status("PATIENT ID", patient.id || "—")}
          ${status("AGE", patient.age || "—")}
          ${status("SEX", patient.sex || "—")}
          ${status("TRANSPLANT DATE", patient.transplant?.date ? date(patient.transplant.date) : "—")}
          ${status("DISCHARGE DATE", patient.discharge?.date ? date(patient.discharge.date) : "—")}
          ${status("DONOR TYPE", patient.transplant?.donorType || "—")}
        </div>
      </section>

      <section class="overview-section">
        <p class="eyebrow">LATEST ACTIVITY</p>
        <div class="history-list">
          <article class="history-item">
            <div class="history-day"><span>LATEST</span><strong>${latestSession ? `D${latestSession.day}` : "—"}</strong></div>
            <div class="history-content">
              <h3>${latestSession ? "Latest completed monitoring session" : "No completed session yet"}</h3>
              <p>${latestSession ? `Completed ${safe(dateTime(latestSession.completedAt || latestSession.updatedAt))}. Care plan V${safe(latestSession.carePlanVersion || plan?.version || "—")}.` : "The clinician dashboard will populate as monitoring sessions are completed."}</p>
            </div>
          </article>
          <article class="history-item">
            <div class="history-day"><span>ALERT</span><strong>${latestDeviation ? `D${latestDeviation.day}` : "—"}</strong></div>
            <div class="history-content">
              <h3>${latestDeviation ? safe(latestDeviation.severity) : "No deviations recorded"}</h3>
              <p>${latestDeviation ? safe(latestDeviation.clinicalSignal) : "No rule-based deviation has been recorded yet."}</p>
              ${latestDeviation ? `<p><strong>Evidence:</strong> ${safe(latestDeviation.evidence)}</p>` : ""}
            </div>
          </article>
        </div>
      </section>

      <section class="overview-section">
        <p class="eyebrow">7-DAY MONITORING TIMELINE</p>
        <h3>Completion by day</h3>
        <div class="day-tracker" aria-label="Clinician seven day monitoring timeline">
          ${Array.from({length:7}, (_, i) => {
            const day = i + 1;
            const session = (appState.monitoringHistory || []).find(s => s.day === day && s.status === "COMPLETED");
            const dayDeviations = allDeviations.filter(d => d.day === day);
            return `<div class="${session ? "complete" : "locked"} day-step"><span>${day}</span><small>${session ? "Completed" : "Not completed"}${dayDeviations.length ? ` · ${dayDeviations.length} signal${dayDeviations.length === 1 ? "" : "s"}` : ""}</small></div>`;
          }).join("")}
        </div>
      </section>

      <section class="overview-section">
        <p class="eyebrow">OPEN CLINICAL SIGNALS</p>
        <h3>Priority review queue</h3>
        ${renderTimeline(open.slice(0, 8), "No open deviations.", deviation => `
          <article class="history-item">
            <div class="history-day"><span>D${deviation.day}</span><strong>${deviation.level === 2 ? "L2" : "L1"}</strong></div>
            <div class="history-content">
              <h3>${safe(deviation.severity)}</h3>
              <p>${safe(deviation.clinicalSignal)}</p>
              <p><strong>Evidence:</strong> ${safe(deviation.evidence)}</p>
              <p><small>${safe(dateTime(deviation.createdAt))}</small></p>
              ${renderDeviationReviewControls(deviation)}
            </div>
          </article>
        `)}
      </section>

      ${renderTemperatureChart()}

      <section class="overview-section">
        <p class="eyebrow">CARE PLAN HISTORY</p>
        <h3>V1 → current</h3>
        ${renderTimeline(plans, "No care plans recorded.", planItem => `
          <article class="history-item">
            <div class="history-day"><span>PLAN</span><strong>V${planItem.version}</strong></div>
            <div class="history-content">
              <h3>${safe(getCarePlanChangeLabel(planItem))}</h3>
              <p>Created ${safe(dateTime(planItem.createdAt))}${planItem.effectiveDay ? ` · effective after Day ${planItem.effectiveDay}` : ""}.</p>
              ${planItem.changeReason ? `<p><strong>Why:</strong> ${safe(planItem.changeReason)}</p>` : ""}
              ${planItem.sourceDeviationIds?.length ? `<p><strong>Source signals:</strong> ${planItem.sourceDeviationIds.length}</p>` : ""}
            </div>
          </article>
        `)}
      </section>

      ${renderIntegrityStatus()}

      <section class="overview-section">
        <p class="eyebrow">SAFETY BOUNDARY</p>
        <h3>Clinician remains the decision-maker</h3>
        <p>This prototype detects configured deviations and presents observed evidence for review. It does not diagnose, prescribe, change medication, or make autonomous clinical decisions.</p>
      </section>
    </section>
  `);
}


/* =========================================================
   TRENDS
   ========================================================= */

function trends() {
  const patient = appState.patientData;
  if (!patient) {
    empty("Trends", "Register a patient before viewing monitoring trends.", "⌁");
    return;
  }

  const deviations = getAllDeviations();
  const sessions = [...(appState.monitoringHistory || [])].sort((a, b) => a.day - b.day);
  const plans = [...(appState.carePlans || [])].sort((a, b) => a.version - b.version);

  content(`
    <section class="overview">
      <div class="dashboard-intro">
        <div>
          <p class="eyebrow">CLINICIAN TRENDS</p>
          <h2>Observed monitoring trends</h2>
          <p>Charts are generated only from data recorded by this prototype.</p>
        </div>
        <button class="secondary-button" data-nav="review">BACK TO REVIEW</button>
      </div>

      ${renderTemperatureChart()}

      <section class="overview-section">
        <p class="eyebrow">DEVIATION TIMELINE</p>
        <h3>Rule-based signals by day</h3>
        ${renderTimeline(deviations, "No deviations recorded.", deviation => `
          <article class="history-item">
            <div class="history-day"><span>DAY</span><strong>${deviation.day}</strong></div>
            <div class="history-content">
              <h3>${safe(deviation.severity)} · ${safe(deviation.status)}</h3>
              <p>${safe(deviation.ruleLabel)}</p>
              <p>${safe(deviation.evidence)}</p>
              <small>${safe(dateTime(deviation.createdAt))}</small>
            </div>
          </article>
        `)}
      </section>

      <section class="overview-section">
        <p class="eyebrow">CARE PLAN VERSION TIMELINE</p>
        <h3>Configuration changes</h3>
        ${renderTimeline(plans, "No care plans recorded.", plan => `
          <article class="history-item">
            <div class="history-day"><span>PLAN</span><strong>V${plan.version}</strong></div>
            <div class="history-content">
              <h3>${safe(getCarePlanChangeLabel(plan))}</h3>
              <p>${safe(plan.changeReason || "Initial configured monitoring plan.")}</p>
              <small>${safe(dateTime(plan.createdAt))}</small>
            </div>
          </article>
        `)}
      </section>

      <section class="overview-section">
        <p class="eyebrow">MONITORING COVERAGE</p>
        <h3>Session completion</h3>
        <p>${sessions.length} completed session${sessions.length === 1 ? "" : "s"} across ${getCompletedMonitoringDays().length} of 7 monitoring days.</p>
      </section>
    </section>
  `);
}


/* =========================================================
   FORM HELPERS
   ========================================================= */

function field(
  name,
  label,
  value,
  required = false,
  type = "text",
  attributes = ""
) {

  const control =
    type === "textarea"

      ? `

        <textarea
          id="${name}"
          name="${name}"
          ${
            required
              ? "required"
              : ""
          }
        >${esc(
          value || ""
        )}</textarea>

      `

      : `

        <input
          id="${name}"
          name="${name}"
          type="${type}"
          value="${esc(
            value ?? ""
          )}"
          ${
            required
              ? "required"
              : ""
          }
          ${attributes}
        >

      `;


  return `

    <div
      class="field"
      data-field="${name}"
    >

      <label
        for="${name}"
      >

        ${label}

        ${
          required
            ? '<span class="required">*</span>'
            : ""
        }

      </label>


      ${control}


      <span class="field-error"></span>

    </div>

  `;

}


function select(
  name,
  label,
  value,
  options,
  required = false
) {

  return `

    <div
      class="field"
      data-field="${name}"
    >

      <label
        for="${name}"
      >

        ${label}

        ${
          required
            ? '<span class="required">*</span>'
            : ""
        }

      </label>


      <select
        id="${name}"
        name="${name}"
        ${
          required
            ? "required"
            : ""
        }
      >

        <option value="">
          Select
        </option>


        ${options.map(
          option => `

            <option
              value="${esc(option)}"
              ${
                value === option
                  ? "selected"
                  : ""
              }
            >
              ${safe(option)}
            </option>

          `
        ).join("")}

      </select>


      <span class="field-error"></span>

    </div>

  `;

}


/* =========================================================
   STATUS / META
   ========================================================= */

function status(
  label,
  value
) {

  return `

    <article class="status-card">

      <p>
        ${label}
      </p>

      <strong>
        ${safe(value)}
      </strong>

    </article>

  `;

}


function meta(
  label,
  value
) {

  return `

    <div class="meta">

      <span>
        ${label}
      </span>

      <strong>
        ${safe(value)}
      </strong>

    </div>

  `;

}


function details(
  title,
  items
) {

  return `

    <section class="overview-section">

      <p class="eyebrow">
        ${title.toUpperCase()}
      </p>

      <h2>
        ${title}
      </h2>


      <dl class="detail-grid">

        ${items.map(
          ([label, value]) => `

            <div class="detail">

              <dt>
                ${safe(label)}
              </dt>

              <dd>
                ${safe(value)}
              </dd>

            </div>

          `
        ).join("")}

      </dl>

    </section>

  `;

}


/* =========================================================
   EMPTY PAGE
   ========================================================= */

function empty(
  title,
  message,
  icon
) {

  content(`

    <section class="empty-card">

      <div class="empty-icon">
        ${icon}
      </div>

      <p class="eyebrow">
        ${safe(title)}
      </p>

      <h2>
        ${safe(title)}
      </h2>

      <p>
        ${safe(message)}
      </p>

    </section>

  `);

}


/* =========================================================
   PATIENT DEFAULT
   ========================================================= */

function emptyPatient() {

  return {

    id: "",

    name: "",

    age: "",

    sex: "",

    transplant: {

      date: "",

      type: "Kidney",

      donorType: ""

    },

    discharge: {

      date: "",

      diagnosis: "",

      instructions: "",

      activityRestrictions: "",

      followUpInformation: "",

      transplantTeamContact: "",

      warningSigns: ""

    },

    primaryKidneyDisease: "",

    medications: [],

    monitoringParameters:
      Object.fromEntries(
        parameters.map(
          ([key, , enabled]) =>
            [key, enabled]
        )
      )

  };

}


/* =========================================================
   FORM DATA
   ========================================================= */

function readForm(form) {

  const get =
    name =>
      form.elements[name]
        ?.value
        ?.trim() || "";


  const checked =
    [
      ...form.querySelectorAll(
        '[name="monitoringParameters"]:checked'
      )
    ].map(
      input => input.value
    );


  const meds =
    [
      ...form.querySelectorAll(
        "[data-medication]"
      )
    ]

      .map(
        card => ({

          name:
            card.querySelector(
              '[name="medicationName"]'
            )?.value.trim() || "",

          dose:
            card.querySelector(
              '[name="medicationDose"]'
            )?.value.trim() || "",

          frequency:
            card.querySelector(
              '[name="medicationFrequency"]'
            )?.value.trim() || "",

          startDate:
            card.querySelector(
              '[name="medicationStartDate"]'
            )?.value || "",

          endDate:
            card.querySelector(
              '[name="medicationEndDate"]'
            )?.value || "",

          instructions:
            card.querySelector(
              '[name="medicationInstructions"]'
            )?.value.trim() || ""

        })
      )

      .filter(
        medication =>
          Object.values(
            medication
          ).some(Boolean)
      );


  return {

    id: get("id"),

    name: get("name"),

    age: Number(
      get("age")
    ),

    sex: get("sex"),


    transplant: {

      date:
        get("transplantDate"),

      type:
        get("transplantType"),

      donorType:
        get("donorType")

    },


    discharge: {

      date:
        get("dischargeDate"),

      diagnosis:
        get("dischargeDiagnosis"),

      instructions:
        get("dischargeInstructions"),

      activityRestrictions:
        get("activityRestrictions"),

      followUpInformation:
        get("followUpInformation"),

      transplantTeamContact:
        get("transplantTeamContact"),

      warningSigns:
        get("warningSigns")

    },


    primaryKidneyDisease:
      get("primaryKidneyDisease"),


    medications:
      meds,


    monitoringParameters:
      Object.fromEntries(
        parameters.map(
          ([key]) =>
            [
              key,
              checked.includes(key)
            ]
        )
      )

  };

}


/* =========================================================
   PATIENT VALIDATION
   ========================================================= */

function validatePatient(
  patient
) {

  const errors = {};


  const requiredFields = {

    name:
      patient.name,

    id:
      patient.id,

    transplantDate:
      patient.transplant.date,

    dischargeDate:
      patient.discharge.date,

    primaryKidneyDisease:
      patient.primaryKidneyDisease,

    dischargeDiagnosis:
      patient.discharge.diagnosis,

    dischargeInstructions:
      patient.discharge.instructions

  };


  Object.entries(
    requiredFields
  ).forEach(
    ([key, value]) => {

      if (!value) {

        errors[key] =
          "This field is required.";

      }

    }
  );


  if (
    !Number.isInteger(
      patient.age
    ) ||
    patient.age < 1 ||
    patient.age > 130
  ) {

    errors.age =
      "Enter an age from 1 to 130.";

  }


  if (
    patient.transplant.date &&
    patient.discharge.date &&
    patient.transplant.date >
      patient.discharge.date
  ) {

    errors.dischargeDate =
      "Discharge date must be on or after transplant date.";

  }


  if (
    !patient.transplant.type
  ) {

    errors.transplantType =
      "Select transplant type.";

  }


  if (
    !patient.transplant.donorType
  ) {

    errors.donorType =
      "Select donor type.";

  }


  return errors;

}


/* =========================================================
   SHOW FORM ERRORS
   ========================================================= */

function showErrors(
  errors
) {

  document
    .querySelectorAll(
      "[data-field]"
    )
    .forEach(
      fieldElement => {

        const key =
          fieldElement.dataset.field;


        const error =
          errors[key];


        const control =
          fieldElement.querySelector(
            "input, select, textarea"
          );


        fieldElement.classList.toggle(
          "invalid",
          Boolean(error)
        );


        fieldElement.querySelector(
          ".field-error"
        ).textContent =
          error || "";


        if (control) {

          control.setAttribute(
            "aria-invalid",
            Boolean(error)
          );

        }

      }
    );


  const firstError =
    Object.keys(errors)[0];


  if (firstError) {

    document
      .querySelector(
        `[name="${firstError}"]`
      )
      ?.focus();

  }

}


/* =========================================================
   SUBMIT PATIENT
   ========================================================= */

function submitPatient(
  event
) {

  event.preventDefault();


  const patient =
    readForm(
      event.currentTarget
    );


  const errors =
    validatePatient(
      patient
    );


  showErrors(
    errors
  );


  if (
    Object.keys(errors).length
  ) {

    return;

  }


  const wasEditing =
    editingPatient;


  const previousPatient =
    appState.patientData;


  const monitoringConfigChanged =
    wasEditing &&
    previousPatient &&
    JSON.stringify(
      previousPatient.monitoringParameters
    ) !==
    JSON.stringify(
      patient.monitoringParameters
    );


  /*
   * If patient identity changes,
   * clear monitoring-specific state.
   */

  const identityChanged =
    wasEditing &&
    previousPatient &&
    (
      previousPatient.id !==
        patient.id
      ||
      previousPatient.name !==
        patient.name
    );


  if (identityChanged) {

    appState.currentDay = 0;

    appState.currentMonitoringSession =
      null;

    appState.monitoringHistory = [];

    appState.deviations = [];

    appState.clinicianReviews = [];

    appState.monitoringStatus =
      "NOT_STARTED";

    appState.carePlans = [];

    appState.currentCarePlanVersion =
      0;

  }


  appState.patientData =
    patient;


  /*
   * New patient:
   * generate Care Plan V1.
   */

  if (
    !wasEditing &&
    !appState.carePlans.length
  ) {

    generatePlan();

  }


  saveState();


  editingPatient =
    false;


  updateHeader();


  overview();


  if (
    monitoringConfigChanged
  ) {

    toast(
      "Monitoring configuration changed. Regenerate the care plan when ready."
    );

  } else if (wasEditing) {

    toast(
      "Patient information updated successfully."
    );

  } else {

    toast(
      "Patient registered successfully. Care Plan V1 created."
    );

  }

}


/* =========================================================
   DATE
   ========================================================= */

function date(value) {

  if (!value) {

    return "Not provided";

  }


  const parts =
    value.split("-");


  if (
    parts.length !== 3
  ) {

    return value;

  }


  return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function esc(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>'"]/g,
    character => ({

      "&": "&amp;",

      "<": "&lt;",

      ">": "&gt;",

      "'": "&#39;",

      '"': "&quot;"

    })[character]
  );

}


function safe(value) {

  return esc(
    value
  ).replace(
    /\n/g,
    "<br>"
  );

}


/* =========================================================
   MONITORING STATUS
   ========================================================= */

function monitoringStatusLabel() {

  if (
    appState.monitoringStatus ===
    "COMPLETED"
  ) {

    return "Completed";

  }


  if (
    appState.monitoringStatus ===
      "IN_PROGRESS" &&
    appState.currentMonitoringSession
  ) {

    return `Day ${
      appState.currentMonitoringSession.day
    } of 7`;

  }


  if (
    appState.currentDay > 0
  ) {

    return `Ready for Day ${
      appState.currentDay + 1 > 7
        ? 7
        : appState.currentDay + 1
    }`;

  }


  return "Not started";

}


/* =========================================================
   HEADER
   ========================================================= */

function updateHeader() {

  const patient =
    appState.patientData;


  const header =
    document.getElementById(
      "header-title"
    );


  if (header) {

    header.textContent =
      titles[currentPage];

  }


  const patientStatus =
    document.getElementById(
      "patient-status"
    );


  if (patientStatus) {

    patientStatus.textContent =
      patient
        ? patient.name
        : "Not registered";

  }


  const monitoringStatus =
    document.getElementById(
      "monitoring-status"
    );


  if (monitoringStatus) {

    monitoringStatus.textContent =
      monitoringStatusLabel();

  }


  const carePlanStatus =
    document.getElementById(
      "care-plan-status"
    );


  if (carePlanStatus) {

    carePlanStatus.textContent =
      appState.currentCarePlanVersion
        ? `V${appState.currentCarePlanVersion}`
        : "Not created";

  }

}


/* =========================================================
   TOAST
   ========================================================= */

function toast(
  message
) {

  const toastElement =
    document.getElementById(
      "toast"
    );


  if (!toastElement) {

    return;

  }


  toastElement.textContent =
    message;


  toastElement.classList.add(
    "visible"
  );


  setTimeout(
    () => {

      toastElement.classList.remove(
        "visible"
      );

    },
    3600
  );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeApp() {

  /*
   * Explicitly keep the modal hidden.
   */

  const modal =
    document.getElementById(
      "new-patient-modal"
    );


  if (modal) {

    modal.hidden = true;

  }


  loadState();

  updateHeader();

  renderPage();


  /* =====================================
     CLICK HANDLERS
  ====================================== */

  document.addEventListener(
    "click",
    event => {


      const nav =
        event.target.closest(
          "[data-nav]"
        );


      if (nav) {

        navigateTo(
          nav.dataset.nav
        );

        return;

      }


      const go =
        event.target.closest(
          "[data-go]"
        );


      if (go) {

        navigateTo(
          go.dataset.go
        );

        return;

      }


      if (
        event.target.closest(
          "[data-edit]"
        )
      ) {

        currentPage =
          "patient";

        editingPatient =
          true;

        updateHeader();

        renderPage();

        return;

      }


      if (
        event.target.closest(
          "[data-cancel]"
        )
      ) {

        editingPatient =
          false;

        renderPage();

        return;

      }


      if (
        event.target.closest(
          "#add-medication"
        )
      ) {

        document
          .getElementById(
            "medication-list"
          )
          ?.insertAdjacentHTML(
            "beforeend",
            medCard()
          );

        return;

      }


      if (
        event.target.closest(
          "[data-remove]"
        )
      ) {

        event.target
          .closest(
            "[data-medication]"
          )
          ?.remove();

        return;

      }


      if (
        event.target.closest(
          "#new-patient-button"
        )
      ) {

        const newPatientModal =
          document.getElementById(
            "new-patient-modal"
          );


        if (newPatientModal) {

          newPatientModal.hidden =
            false;

        }

        return;

      }


      if (
        event.target.closest(
          "[data-close-modal]"
        )
      ) {

        const newPatientModal =
          document.getElementById(
            "new-patient-modal"
          );


        if (newPatientModal) {

          newPatientModal.hidden =
            true;

        }

        return;

      }


      if (
        event.target.closest(
          "#confirm-new-patient"
        )
      ) {

        const newPatientModal =
          document.getElementById(
            "new-patient-modal"
          );


        if (newPatientModal) {

          newPatientModal.hidden =
            true;

        }


        clearPatient();

        return;

      }


      if (
        event.target.closest(
          "[data-regenerate]"
        )
      ) {

        generatePlan();

        saveState();

        updateHeader();

        carePlan();

        toast(
          `Care Plan V${appState.currentCarePlanVersion} created.`
        );

        return;

      }


      if (
        event.target.closest(
          "[data-start-day]"
        )
      ) {

        const button =
          event.target.closest(
            "[data-start-day]"
          );


        startMonitoringDay(
          Number(
            button.dataset.startDay
          )
        );

        return;

      }


      if (
        event.target.closest(
          "[data-monitor-next]"
        )
      ) {

        moveMonitoringNext();

        return;

      }


      if (
        event.target.closest(
          "[data-monitor-back]"
        )
      ) {

        moveMonitoringBack();

        return;

      }


      if (
        event.target.closest(
          "[data-next-day]"
        )
      ) {

        const button =
          event.target.closest(
            "[data-next-day]"
          );


        advanceToNextDay(
          Number(
            button.dataset.nextDay
          )
        );

        return;

      }


      if (
        event.target.closest(
          "[data-finish-week]"
        )
      ) {

        finishWeek();

        return;

      }


      if (
        event.target.closest(
          "[data-review-deviation]"
        )
      ) {

        const button =
          event.target.closest(
            "[data-review-deviation]"
          );

        markDeviationReviewed(
          button.dataset.reviewDeviation
        );

        return;

      }


      if (
        event.target.closest(
          "[data-export-record]"
        )
      ) {

        exportPatientRecord();

        return;

      }


      if (
        event.target.closest(
          "[data-view-session]"
        )
      ) {

        const button =
          event.target.closest(
            "[data-view-session]"
          );


        viewMonitoringSession(
          button.dataset.viewSession
        );

      }

    }
  );


  /* =====================================
     FORM SUBMISSION
  ====================================== */

  document.addEventListener(
    "submit",
    event => {

      if (
        event.target.id ===
        "patient-form"
      ) {

        submitPatient(
          event
        );

      }

    }
  );


  /* =====================================
     RESET
  ====================================== */

  document
    .getElementById(
      "reset-button"
    )
    ?.addEventListener(
      "click",
      clearState
    );

}


/* =========================================================
   START APPLICATION
   ========================================================= */

window.addEventListener("error", event => {
  console.error("Second Discharge runtime error:", event.error || event.message);
  toast("A prototype error occurred. Check the browser console before continuing.");
});

window.addEventListener("unhandledrejection", event => {
  console.error("Second Discharge promise error:", event.reason);
  toast("A prototype operation failed. Check the browser console before continuing.");
});

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);