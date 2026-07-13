export type SessionUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

export type SessionDto = {
  user: SessionUser;
  session: {
    id: string;
    expiresAt: Date;
  };
};
