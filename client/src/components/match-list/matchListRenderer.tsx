import MatchListLine from "./matchListLine";

export default function MatchListRender({ matchList, renderedMatchDay }) {

    return (
        <div>
          <h1>Week {renderedMatchDay}</h1>
          <form>
            <table>
              <thead>
                <tr>
                  <th>Home</th>
                  <th>Result</th>
                  <th>Away</th>
                </tr>
              </thead>
              <tbody>
                {matchList.map((matchLine, index) => {
                  // console.log("MatchListRender matchLine", matchLine)
                  return (
                    <tr key={index}>
                      <MatchListLine matchLine={matchLine} />
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* { isAnySubmittableMatch(matchList) && (<button type="submit">SUBMIT</button>)} */}
          </form>
        </div>
      );
}