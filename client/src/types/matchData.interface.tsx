export interface FootballDataResponse {
    filters: {
        season: string;
        matchday: string;
    };
    resultSet: {
        count: number;
        first: string;
        last: string;
        played: number;
    };
    competition: Competition;
    matches: Match[];
}

export interface Competition {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
}

export interface Area {
    id: number;
    name: string;
    code: string;
    flag: string;
}

export interface Season {
    id: number;
    startDate: string;
    endDate: string;
    currentMatchday: number;
    winner: string | null;
}

export interface Team {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
}

export interface Score {
    winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;
    duration: 'REGULAR' | string;
    fullTime: {
        home: number | null;
        away: number | null;
    };
    halfTime: {
        home: number | null;
        away: number | null;
    };
}

export interface Odds {
    msg: string;
}

export interface Referee {
    id: number;
    name: string;
    type: string;
    nationality: string;
}

export interface Match {
    area: Area;
    competition: Competition;
    season: Season;
    id: number;
    utcDate: string;
    status: 'FINISHED' | 'IN_PLAY' | 'TIMED' | 'SCHEDULED' | string;
    matchday: number;
    stage: string;
    group: string | null;
    lastUpdated: string;
    homeTeam: Team;
    awayTeam: Team;
    score: Score;
    odds: Odds;
    referees: Referee[];
}

export interface UserSubmission {
    matchDay: number;
    userId: string;
    predictions: Record<string, string>;
    timestamp: number;
}

export interface PredictionData {
    homeScore: number;
    awayScore: number;
    timestamp: number;
    impact: number;
}

export interface SubmissionResponse {
    success: boolean;
    message?: string;
    data?: Record<string, unknown>;
}

export interface FormattedImpact {
    percentage: string;
    numeric: string;
}

export interface MatchListLineProps {
    index: number;
    matchLine: Match;
    submissionDeadlineStatus: string;
    homePrediction?: string | null;
    awayPrediction?: string | null;
    homeOpPrediction?: string | null;
    awayOpPrediction?: string | null;
    predictionImpact?: string;
    vsop?: boolean;
    broadcastChangeToParent: (value: number | null, isHome: boolean, index: number) => void;
}

export interface MatchListRendererProps {
    vsop?: boolean;
    matchList: Match[];
    renderedMatchDay: number;
    existingSubmissions: string;
    existingOpSubmissions: string;
    broadcastSubmissionToParent: (data: string) => Promise<boolean>;
}

export interface AppState {
    renderMatchDay: number;
    matchList: Match[];
    appLoaded: boolean;
    existingSubmissions: string;
    existingOpSubmissions: string;
    errorLoadingMatches: string;
}