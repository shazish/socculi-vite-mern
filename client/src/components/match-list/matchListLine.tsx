import "./MatchListLine.scss";

export default function MatchListLine({ matchLine }) {
  // console.log("matchLine", matchLine);
  function handleChange(data) {}

  function isSubmissionAllowed(): boolean {
    // Less than an hour since match started, means second half has not started
    return Date.now() - new Date(matchLine["utcDate"]) < 3600000;
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
        <span className="text-xs">Your selection:&nbsp; </span>
        {isSubmissionAllowed() && (
          <div className="input-container border border-gray-200">
            <input
              className="text-center"
              type="text"
              name={"home-input"}
              onChange={handleChange}
              required
            />
            -
            <input
              type="text"
              className="text-center"
              name={"away-input"}
              onChange={handleChange}
              required
            />
          </div>
        )}
      </div>
    </div>
  );
}
