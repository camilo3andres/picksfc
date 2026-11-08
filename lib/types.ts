export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  instagram: string | null;
  tiktok: string | null;
  twitter: string | null;
  telegram: string | null;
  total_picks: number;
  correct_picks: number;
  is_verified: boolean;
  created_at: string;
};

export type Pick = {
  id: string;
  user_id: string;
  home_team: string;
  away_team: string;
  league: string;
  prediction: "home" | "draw" | "away" | "home_draw" | "away_draw";
  reasoning: string | null;
  match_date: string;
  status: "pending" | "correct" | "incorrect";
  likes_count: number;
  comments_count: number;
  home_team_logo: string | null;
  away_team_logo: string | null;
  home_score: number | null;
  away_score: number | null;
  created_at: string;
  profiles?: Profile;
};

// Pick con el username de su autor (lo que trae .select("*, profiles(username)"))
export type PickWithAuthor = Pick & { profiles: { username: string; is_verified?: boolean } };

// Partido terminado con marcador final (ver /api/football/results y /team-last)
export type FinishedMatch = {
  home: string;
  away: string;
  date: string; // YYYY-MM-DD
  homeScore: number;
  awayScore: number;
};

export type Like = {
  id: string;
  pick_id: string;
  user_id: string;
  created_at: string;
};

export type Comment = {
  id: string;
  pick_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: { username: string };
};
