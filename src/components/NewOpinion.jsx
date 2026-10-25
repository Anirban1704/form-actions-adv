import { useActionState, useContext } from "react";
import { OpinionsContext } from "../store/opinions-context";
import Submit from "./Submit";

function isNotEmpty(value) {
  return value.trim() !== "";
}

export function NewOpinion() {
  const { addOpinion } = useContext(OpinionsContext);

  async function submitAction(prevFormState, formData) {
    const userName = formData.get("userName");
    const title = formData.get("title");
    const opinion = formData.get("body");

    let errors = [];

    if (!isNotEmpty(userName)) {
      errors.push("Please enter user name.");
    }
    if (!isNotEmpty(title)) {
      errors.push("Please enter title of your opinion.");
    }
    if (!isNotEmpty(opinion)) {
      errors.push("Please describe your opinion.");
    }

    if (errors.length > 0) {
      return {
        errors,
        enteredValues: {
          userName,
          title,
          opinion,
        },
      };
    }
    await addOpinion({
      userName,
      title,
      body: opinion,
    });

    return {
      errors: null,
    };
  }
  const [formState, formAction] = useActionState(submitAction, {
    errors: null,
  });

  return (
    <div id="new-opinion">
      <h2>Share your opinion!</h2>
      <form action={formAction}>
        <div className="control-row">
          <p className="control">
            <label htmlFor="userName">Your Name</label>
            <input
              type="text"
              id="userName"
              name="userName"
              defaultValue={formState.enteredValues?.userName}
            />
          </p>

          <p className="control">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={formState.enteredValues?.title}
            />
          </p>
        </div>
        <p className="control">
          <label htmlFor="body">Your Opinion</label>
          <textarea
            id="body"
            name="body"
            rows={5}
            defaultValue={formState.enteredValues?.opinion}
          ></textarea>
        </p>

        {formState.errors && (
          <ul className="errors">
            {formState.errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}

        <Submit />

        {/* <p className="actions">
          <button type="submit">Submit</button>
        </p> */}
      </form>
    </div>
  );
}
