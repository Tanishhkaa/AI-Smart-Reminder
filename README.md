# AI Smart Reminder

AI Smart Reminder is a browser-based productivity companion prototype for students, professionals, and entrepreneurs who need more than passive notifications. It transforms commitments into an actionable priority queue and coaching plan so users know what to do next before deadlines are missed.

## What it demonstrates

- **Intelligent task prioritization** using a transparent score based on deadline urgency, impact, effort, and context.
- **AI-style scheduling assistance** that recommends focused work blocks for the highest-risk task.
- **Personalized productivity recommendations** that identify quick wins and high-impact next steps.
- **Context-aware reminders** that explain why a task matters and prompt immediate action.
- **Goal-oriented execution support** through concise next-best-action guidance.
- **No backend required**: tasks are stored in the browser with `localStorage`, so the prototype works as a simple static app.
- **Autopilot focus plans** that break the highest-priority task into context-aware steps and export the plan as an `.ics` calendar block.
- **Energy-aware recommendations** that adapt priority, suggested effort, and next steps based on whether the user has deep focus, normal energy, or low energy.
- **Optional Gemini coaching**: paste a Gemini API key in the app to enhance the Autopilot plan with live AI suggestions. The key is not stored in this repository; it is saved only in the user's browser.

## Run locally

Open `index.html` in a modern browser, or serve the directory with any static server:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Project structure

- `index.html` — application markup and content sections.
- `styles.css` — responsive visual design and component styling.
- `app.js` — prioritization, scheduling recommendations, and interactive task rendering.

## Gemini and calendar troubleshooting

- Gemini enhancement requires a valid Gemini API key from Google AI Studio. The key is entered in the UI and saved only in the current browser.
- If the Gemini button is disabled, save a key and add or load at least one active task first.
- Calendar export does not require Gemini; it downloads the currently visible Autopilot plan as an `.ics` file.
