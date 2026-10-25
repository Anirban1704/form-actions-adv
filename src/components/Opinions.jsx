import { use } from 'react';

import { Opinion } from './Opinion';
import { OpinionsContext } from '../store/opinions-context';

export function Opinions() {
  const { opinions, upvoteOpinion, downvoteOpinion } = use(OpinionsContext);
  
  return (
    <div id="opinions">
      <h2>User Opinions</h2>
      {opinions && (
        <ul>
          {opinions.map((o) => (
            <li key={o.id}>
              <Opinion opinion={o} upvoteOpinion={upvoteOpinion} downvoteOpinion={downvoteOpinion}/>
            </li>
          ))}
        </ul>
      )}
      {!opinions && (
        <p>No opinions found. Maybe share your opinion on something?</p>
      )}
    </div>
  );
}
