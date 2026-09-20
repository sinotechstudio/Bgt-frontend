export type User = {
  id: number;
  name: string;
  email: string;
  gamerTag: string;
  avatar?: string;
  phone?: string;
  joinedAt: string;
  accountStatus: 'verified' | 'pending_verification' | 'suspended';
  inGameIds?: {
    bgmi?: string;
    valorant?: string;
    freefire?: string;
    cs2?: string;
    [key: string]: string | undefined;
  };
  stats?: {
    tournamentsJoined: number;
    wins: number;
    winRate: number;
    totalWinnings: number;
    kdRatio?: number;
    rank?: string;
  };
};

export type TournamentStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';

export type PrizeBreakdownItem = {
  rank: string;
  prize: string;
};

export type BracketMatch = {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  winner: string | null;
  status: 'scheduled' | 'live' | 'completed';
};

export type BracketRound = {
  title: string;
  matches: BracketMatch[];
};

export type Participant = {
  id: number;
  name: string;
  gamerTag: string;
  avatar?: string;
  teamName?: string;
  joinedAt?: string;
};

export type Tournament = {
  id: number;
  title: string;
  slug: string;
  game: string;
  gameIcon?: string;
  banner: string;
  entryFee: number;
  prizePool: number;
  maxPlayers: number;
  participants: number;
  startAt: string;
  status: TournamentStatus;
  format?: string;
  mode?: string;
  round?: string;
  liveScore?: string;
  description?: string;
  rules?: string[];
  prizeBreakdown?: PrizeBreakdownItem[];
  isJoined?: boolean;
  registeredUsers?: number[];
  featured?: boolean;
  isFeatured?: boolean;
  platform?: string;
  map?: string;
  roomId?: string;
  roomPassword?: string;
  streamUrl?: string;
  bracket?: {
    rounds: BracketRound[];
  };
  schedule?: Array<{
    time: string;
    title: string;
    status: 'scheduled' | 'live' | 'completed';
  }>;
  participantsList?: Array<{
    id: number;
    name: string;
    team: string;
    avatar: string;
    seed: number;
    isCurrentUser?: boolean;
  }>;
};

export type Wallet = {
  balance: number;
  currency: string;
  totalDeposited: number;
  totalWithdrawn: number;
  totalWon: number;
};

export type TransactionType = 'Deposit' | 'Withdrawal' | 'Tournament Entry' | 'Tournament Prize' | 'Refund';
export type TransactionStatus = 'Pending' | 'Completed' | 'Failed' | 'Cancelled';

export type Transaction = {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  reference: string;
  description: string;
};

export type TeamMemberRole = 'Captain' | 'Co-Captain' | 'Member';

export type TeamMember = {
  id: number;
  name: string;
  gamerTag: string;
  role: TeamMemberRole;
  avatar: string;
  status: 'online' | 'in-game' | 'offline';
};

export type TeamInvitation = {
  id: number;
  teamName: string;
  teamTag: string;
  invitedBy: string;
  invitedAt: string;
  status: 'pending' | 'accepted' | 'declined';
};

export type Team = {
  id: number;
  name: string;
  tag: string;
  logo?: string;
  description?: string;
  ownerId: number;
  captainName: string;
  createdAt: string;
  stats: {
    matchesPlayed: number;
    wins: number;
    trophies: number;
  };
  members: TeamMember[];
  invitations?: TeamInvitation[];
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: 'tournament' | 'wallet' | 'team' | 'system';
  read: boolean;
  timestamp: string;
  link?: string;
};

export type WebSocketEvent =
  | 'tournament.created'
  | 'tournament.updated'
  | 'tournament.started'
  | 'tournament.completed'
  | 'tournament.participant_joined'
  | 'wallet.updated'
  | 'team.created'
  | 'team.updated'
  | 'team.member_added'
  | 'team.invitation_received'
  | 'notification.created'
  | 'connection.established'
  | 'pong';
