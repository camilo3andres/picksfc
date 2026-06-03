export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
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
