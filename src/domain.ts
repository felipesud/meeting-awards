export interface FirebaseMeetingData {
  name: string;
  total_score: number;
  vote_count: number;
}

export interface FirebaseData {
  settings?: {
    isVotingOpen: boolean;
    rankingAlgorithm?: string;
  };
  meetings?: {
    [key: string]: FirebaseMeetingData; 
  };
}

export interface Meeting {
  id: string;
  name: string;
  total_score: number;
  vote_count: number;
  average: number;
  hasVoted: boolean; 
}

export interface LocalVotes {
  [key: string]: boolean;
}

export interface IRankingStrategy {
    calculateRanking(meetings: Meeting[]): Meeting[];
}