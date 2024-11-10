import MatchListLine from "./matchListLine";

export default function MatchListRender({ matchList, renderedMatchDay }) {

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
              <div key={index} className="flex flex-row items-center py-2 border-b border-gray-200">
                <MatchListLine matchLine={matchLine} />
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );

}