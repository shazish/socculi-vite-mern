import "./MatchListLine.scss";

export default function MatchListLine(
  { matchLine, userSubmissionAllowed }: 
  { matchLine: any, userSubmissionAllowed: boolean}) {
  // console.log("matchLine", matchLine);
  function handleChange(home: number | null, away: number | null) {
    console.log(home, away)
  }

  return (
    <div className="border-b border-gray-200">
      <div className="flex flex-row items-center py-2">
        <div className="team flex-1">
          <div>{matchLine["homeTeam"]?.["name"]}</div>
        </div>
       
        <div
          className={`flex-1 scoreline 
            ${(matchLine["status"] == "IN_PLAY") ? "scoreline-inplay" : ""}
          `}
        >
          <img className="crest" src={matchLine["homeTeam"]?.["crest"]}></img>
          {/* not started yet */}
          {matchLine["status"] == "TIMED" && (
            <>
              <input
                type="text"
                name={"home" + 2 + 2}
                onChange={handleChange}
                required
              />{" "}
              -
              <input
                type="text"
                name={"away" + 2 + 2}
                onChange={handleChange}
                required
              />
            </>
          )}

          {/* Match has ended - draw is inclusive here */}
          {matchLine["score"]?.["winner"] !== null &&
            matchLine["score"]?.["fullTime"]["home"] +
              " - " +
              matchLine["score"]?.["fullTime"]["away"]}

          <img className="crest" src={matchLine["awayTeam"]?.["crest"]}></img>
        </div>

        <div className="team flex-1">
          <span>{matchLine["awayTeam"]?.["name"]}</span>
        </div>
      </div>

      <div className="flex flex-row justify-center">
        <span className="text-xs self-center">Your prediction:&nbsp; </span>
        {userSubmissionAllowed && (
          <div className="input-container border border-gray-200">
            <input
              className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min={0}
              type="number"
              name={"home-input"}
              onChange={(e) => handleChange(Number(e.target.value), null)}
              required
            />
            -
            <input
              type="number"
              min={0}
              className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              name={"away-input"}
              onChange={(e) => handleChange(null, Number(e.target.value))}
              required
            />
          </div>
        )}
      </div>
    </div>
  );
}
