import MatchListLine from "./matchListLine";

export default function MatchListRender({ matchList, renderedMatchDay }) {

  function isSubmissionAllowed(matchDate: string): boolean {
    // Less than an hour since match started, means second half has not started
    return Date.now() - new Date(matchDate).getTime() < 3600000;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Week {renderedMatchDay}</h1>
      <form>
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-row items-center font-semibold">
            <div className="flex-1 text-left">Home</div>
            <div className="w-32 text-center">Result</div>
            <div className="flex-1 text-right">Away</div>
          </div>
          
          {/* Match List */}
          <div className="flex flex-col gap-2">
            {matchList.map((matchLine, index) => (
              <div key={index}>
                <MatchListLine 
                  matchLine={matchLine}
                  userSubmissionAllowed={ isSubmissionAllowed( matchLine["utcDate"] ) }
                
                />
              </div>
            ))}
          </div>


        </div>
      </form>
    </div>
  );

}