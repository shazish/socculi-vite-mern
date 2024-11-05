import "./MatchListLine.scss";

export default function MatchListLine({ matchLine }) {
  // console.log("matchLine", matchLine);
  function handleChange(data) {}

  return (
    <>
      <td className="team">
        <span>{matchLine["homeTeam"]?.["name"]}</span>
      </td>
      <td
        className={
          "scoreline " +
          (matchLine["status"] == "IN_PLAY" && "scoreline-inplay")
        }
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
        {matchLine["score"]?.["winner"] !== null &&
          matchLine["score"]?.["fullTime"]["home"] +
            " - " +
            matchLine["score"]?.["fullTime"]["away"]}

        <img className="crest" src={matchLine["awayTeam"]?.["crest"]}></img>
      </td>

      <td className="team">
        <span>{matchLine["awayTeam"]?.["name"]}</span>
      </td>
    </>
  );
}