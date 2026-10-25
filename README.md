# form-actions-adv — OpinionBoard React Form Actions Recap

OpinionBoard is a small React 19 application for posting opinions and voting on them. It is a practical recap of form actions, pending UI, optimistic updates, Context, and communicating with a REST API.

## Run the project

Requirements: Node.js and npm.

Install the frontend dependencies from the project root and the backend dependencies in `backend`, then start both servers:

```bash
npm install
npm --prefix backend install
npm run dev
```

The Vite frontend runs on its usual local development URL, and the Express API listens on `http://localhost:3000`. The backend stores data in `backend/db.json`.

Useful scripts:

```bash
npm run dev       # Run frontend and backend together
npm run build     # Build the frontend for production
npm run lint      # Lint the project JavaScript and JSX
```

## What to review

### 1. Form actions and `useActionState`

In React 19, a function passed to a form's `action` prop can receive its `FormData` when the form is submitted. `useActionState` connects that action to component state and gives the form an action function to use:

```jsx
async function submitAction(previousState, formData) {
  const title = formData.get("title");

  if (!title?.trim()) {
    return { errors: ["Please enter a title."], enteredValues: { title } };
  }

  await saveOpinion({ title });
  return { errors: null };
}

const [formState, formAction, isPending] = useActionState(
  submitAction,
  { errors: null },
);

return <form action={formAction}>{/* fields and feedback */}</form>;
```

The action's returned value becomes the next `formState`. This makes it useful for validation messages and preserving entered values after an unsuccessful submission. The second argument is the initial state; pass it explicitly when calling `useActionState`.

In this project, `NewOpinion` reads `userName`, `title`, and `body` from `FormData`, checks that they are not blank, and calls the shared `addOpinion` function. Validation in the browser improves feedback, but an API must also validate incoming data because clients can bypass the UI.

### 2. Pending UI with `useFormStatus`

`useFormStatus` reports the status of the nearest parent form. The `Submit` component is rendered inside the form, so it can disable its button and show “Submitting...” while the action is running:

```jsx
const { pending } = useFormStatus();

return (
  <button type="submit" disabled={pending}>
    {pending ? "Submitting..." : "Submit"}
  </button>
);
```

This hook reads form status; it does not create or submit a form. Keep the component that calls it beneath the form it tracks.

### 3. Optimistic updates with `useOptimistic`

Voting should feel immediate even though the API takes time. `Opinion` uses `useOptimistic` to calculate a temporary vote count while the vote action is in progress:

```jsx
const [displayedVotes, setDisplayedVotes] = useOptimistic(
  votes,
  (currentVotes, direction) =>
    direction === "up" ? currentVotes + 1 : currentVotes - 1,
);
```

The vote action applies the optimistic value and then calls the API. When the request completes, the parent Context state receives the server result and the rendered count is based on that confirmed value. Optimistic UI is a temporary prediction, not a replacement for server persistence; production code should also handle failed requests and reconcile or explain a rejected change.

### 4. Shared state with Context

`OpinionsContextProvider` owns the opinions and exposes `addOpinion`, `upvoteOpinion`, and `downvoteOpinion`. `App` places both the form and opinion list inside the provider, so those components can access the same state without threading callbacks through every intermediate component.

The provider loads the initial list in an effect, then updates local state after successful API responses. `Opinions` reads the context and maps each opinion to an `Opinion` component. The opinion `id` is used as the React list key.

### 5. Frontend-to-backend data flow

The frontend sends requests to the Express API at `localhost:3000`:

| User action | Request |
| --- | --- |
| Load opinions | `GET /opinions` |
| Submit an opinion | `POST /opinions` with `userName`, `title`, and `body` |
| Upvote | `POST /opinions/:id/upvote` |
| Downvote | `POST /opinions/:id/downvote` |

The backend validates required submission fields, updates the JSON file, and returns the created or updated opinion. The one-second delay in the API makes pending and optimistic states easy to observe during practice.

## Component map

- `src/App.jsx` — App layout and Context provider boundary.
- `src/components/NewOpinion.jsx` — Form action, validation, and form state.
- `src/components/Submit.jsx` — Pending submit button using `useFormStatus`.
- `src/components/Opinions.jsx` — Reads shared state and renders the list.
- `src/components/Opinion.jsx` — Opinion display and optimistic voting actions.
- `src/store/opinions-context.jsx` — Shared opinion state and API requests.
- `backend/app.js` — Express routes and JSON-file persistence.
- `backend/db.json` — Local demo data.

## Interview quick recap

**What is a form action?**

A function a form invokes on submission. In React 19 it can work with `FormData`, and `useActionState` can connect its result to UI state.

**How are `useActionState` and `useFormStatus` different?**

`useActionState` runs an action and exposes its returned state and pending status. `useFormStatus` lets a nested component read the status of its parent form.

**What is an optimistic update?**

Showing the likely result before the server confirms it, then reconciling the UI with the confirmed result or handling failure.

**Why use Context here?**

The form and list both need access to shared opinion data and update functions. Context avoids passing those values through unrelated component layers.

**Why validate on both client and server?**

Client validation gives fast feedback; server validation is required because requests can be made without using the frontend.

**What would you improve before production?**

Use a real database, handle loading and request failures visibly, validate and constrain votes server-side, configure CORS for known origins, and move the API URL into environment-based configuration. The JSON-file backend is for learning and is not a concurrent, durable production database.
