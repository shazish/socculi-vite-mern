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
    status: 'FINISHED' | 'IN_PLAY' | 'TIMED' | string;
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