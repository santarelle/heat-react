export type Message = {
  id: string;
  created_at: Date;
  text: string;
  user: {
    avatar_url: string;
    github_id: number;
    login: string;
    name: string;
  };
};
