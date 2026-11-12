# Studyroom UI/UX audit and redesign

Scope: student dashboard, subject library, progress, friends, footer navigation, sign-in, admin, notes and planner. Three independent agent reviews covered visual hierarchy, interaction/accessibility and admin workflows. This is a source-based review; rendered screens were not inspected because browser access was previously declined. The supplied library reference guided the subject-card and resource-list composition.

## Findings addressed

| Finding | Change |
| --- | --- |
| Welcome artwork displaced studying on mobile | Focus session becomes the primary home card; illustration supports a compact daily goal card. |
| Footer hid destinations behind horizontal scrolling | Four primary destinations plus a clearly labelled More dialog containing all other tools. Native focus trap, Escape and focus restoration. |
| Section selection was lost on refresh and Back | URL query tracks selected section and subject; Back restores the appropriate view. |
| Subject choice also changed library filtering | Timer subject and library controls now have independent state. |
| Library was a flat file dump | Illustrated subject collections show actual resource counts and completion. Each opens a PDF/video resource list with Save and Done controls. |
| Running timer disappeared on secondary pages | Persistent focus status above the footer provides subject, elapsed duration and Pause & save. |
| Progress chart appeared to change period but remained weekly | Selected-period total and subject breakdown are separate from an explicitly labelled calendar-week chart. |
| Admin detail buried publishing | Students and Materials sections are separate; long histories use collapsed disclosure panels. |
| File and link inputs competed; progress was hidden | Explicit source selection, file details, upload progress, disabled submission fields and nearby feedback. |
| Small targets and false empty states | Larger planner controls, visible delete action, proper notes/planner loading states and search-no-results feedback. |
| Conflicting typography, branding, color and CSS layers | Unified wordmark, Apfel/Absans type, semantic sage/lavender/peach surfaces, one workspace stylesheet and matching shared cards/forms. |
| Saved dark theme made sign-in fields unreadable | Authentication fields use consistent scoped light surfaces; workspace surfaces follow theme variables. |

## Small additions

- Editable daily focus goal, saved to the account and validated on the server (15–720 minutes).
- Saved resources filter inside the library.
- Clear feedback after copying a friend invitation.

## Checks and limits

Core time/permission behavior is covered by the existing unit tests and local API integration script. TypeScript and targeted ESLint checks cover the changed components. Exact check results are reported in the chat after execution.

No claims of human usability testing, screen-reader testing or pixel-accurate visual QA are made. Those require rendered review and student feedback. The app remains a local emulator demo; production persistence and deployment are a separate step.
