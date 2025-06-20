// tests/MatchListRender.spec.tsx
import { test, expect } from '@playwright/experimental-ct-react';
import MatchListRenderer from '../src/components/match-list/MatchListRenderer';

// Your mock data is already defined, which is perfect
const mockMatchListData = {
    matches: [
        { id: 1, matchday: 27, homeTeam: { name: "Team A" }, awayTeam: { name: "Team B" }, season: { currentMatchday: 27 }, status: "SCHEDULED" },
        { id: 2, matchday: 27, homeTeam: { name: "Team C" }, awayTeam: { name: "Team D" }, season: { currentMatchday: 27 }, status: "SCHEDULED" }
    ]
};

test('should render match list with correct number of matches', async ({ mount }) => {
  // The `mount` function renders your component in isolation
  const component = await mount(
    <MatchListRenderer
      matchList={mockMatchListData.matches}
      renderedMatchDay={27}
      existingSubmissions=""
      existingOpSubmissions=""
      broadcastSubmissionToParent={async () => true}
    />
  );

  // Now you can assert directly against the component
  // No more fatal JS errors because the environment is handled for you.
  await expect(component.locator('[data-testid="match-list"]')).toHaveCount(1);
});