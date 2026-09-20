import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// In-memory persistent demo database representing the PHP Backend & MySQL DB
let currentUser = {
  id: 1,
  name: "Alex 'Viper' Chen",
  email: "alex.viper@esports.gg",
  gamerTag: "ViperGG",
  avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
  phone: "+91 98765 43210",
  joinedAt: "2024-01-15T10:30:00Z",
  accountStatus: "verified",
  inGameIds: {
    bgmi: "5128947219",
    valorant: "Viper#SEA",
    freefire: "88219401",
    cs2: "76561198012345678"
  },
  stats: {
    tournamentsJoined: 28,
    wins: 9,
    winRate: 32.1,
    totalWinnings: 24500,
    kdRatio: 3.42,
    rank: "Diamond III"
  }
};

let wallet = {
  balance: 1250,
  currency: "₹",
  totalDeposited: 5000,
  totalWithdrawn: 3000,
  totalWon: 24500
};

let transactions = [
  {
    id: "tx-1001",
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: "Tournament Prize",
    amount: 3500,
    status: "Completed",
    reference: "REF-BGMI-WIN-89",
    description: "1st Place Winner - BGMI Weekend Scrims Vol. 4"
  },
  {
    id: "tx-1002",
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    type: "Tournament Entry",
    amount: -150,
    status: "Completed",
    reference: "REF-VAL-ENT-42",
    description: "Entry fee - Valorant Tactical Clash #12"
  },
  {
    id: "tx-1003",
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    type: "Deposit",
    amount: 1000,
    status: "Completed",
    reference: "UPI-4819283741",
    description: "Instant Deposit via UPI (PhonePe)"
  },
  {
    id: "tx-1004",
    date: new Date(Date.now() - 3600000 * 72).toISOString(),
    type: "Withdrawal",
    amount: -2500,
    status: "Completed",
    reference: "WDR-992104",
    description: "Bank Transfer payout to HDFC Bank A/c **4102"
  },
  {
    id: "tx-1005",
    date: new Date(Date.now() - 3600000 * 96).toISOString(),
    type: "Tournament Entry",
    amount: -50,
    status: "Completed",
    reference: "REF-BGMI-ENT-11",
    description: "Entry fee - BGMI Daily Showdown"
  },
  {
    id: "tx-1006",
    date: new Date(Date.now() - 3600000 * 120).toISOString(),
    type: "Refund",
    amount: 50,
    status: "Completed",
    reference: "REF-CANCEL-09",
    description: "Tournament rescheduled - Entry refunded"
  }
];

let tournaments: any[] = [
  {
    id: 1,
    title: "BGMI Pro Championship: Season 5",
    slug: "bgmi-pro-championship-season-5",
    game: "BGMI",
    gameIcon: "crosshair",
    banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
    entryFee: 50,
    prizePool: 10000,
    maxPlayers: 100,
    participants: 84,
    startAt: new Date(Date.now() + 1000 * 60 * 150).toISOString(), // ~2.5 hrs
    status: "upcoming",
    format: "Squad (TPP) - Erangel & Miramar",
    mode: "Battle Royale",
    round: "Quarter Finals",
    description: "The ultimate Battlegrounds Mobile India showdown. Top 16 squads from qualifying lobbies will advance to the grand finale broadcasted live on YouTube.",
    rules: [
      "No emulators or iPads allowed. Pure mobile devices only.",
      "Room ID and Password will be displayed 15 minutes prior to match time in Tournament Details.",
      "All squad members must take screenshots of end match stats screen.",
      "Use of hacks, third-party GFX tools, or teaming results in instant ban and forfeiture of wallet balance."
    ],
    prizeBreakdown: [
      { rank: "1st Place", prize: "₹5,000 + Champion Badge" },
      { rank: "2nd Place", prize: "₹2,500" },
      { rank: "3rd Place", prize: "₹1,500" },
      { rank: "Top Fragger", prize: "₹1,000" }
    ],
    registeredUsers: [1], // current user is registered
    featured: true,
    streamUrl: "https://youtube.com/live/demo"
  },
  {
    id: 2,
    title: "Valorant Radiant Arena - 5v5 Cup",
    slug: "valorant-radiant-arena-5v5",
    game: "Valorant",
    gameIcon: "shield",
    banner: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
    entryFee: 200,
    prizePool: 25000,
    maxPlayers: 32,
    participants: 32,
    startAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // currently LIVE
    status: "live",
    format: "5v5 Single Elimination Bracket",
    mode: "Competitive (Ascent / Haven / Bind)",
    round: "Semi-Finals (Match 2)",
    liveScore: "Team Liquid (11) vs Fnatic (9) - Map 2",
    description: "High-stakes tactical FPS tournament. Custom server hosted on Mumbai AWS cluster (Ping < 20ms). Official Riot Vanguard anti-cheat strictly mandated.",
    rules: [
      "Custom game mode: Tournament Mode ON with Overtime Win by 2.",
      "Map veto conducted via Discord tournament bot 10 minutes prior.",
      "Coaches allowed in designated tactical timeouts only."
    ],
    prizeBreakdown: [
      { rank: "1st Place", prize: "₹15,000" },
      { rank: "2nd Place", prize: "₹7,000" },
      { rank: "3rd-4th Place", prize: "₹1,500 each" }
    ],
    registeredUsers: [2, 3, 4],
    featured: true
  },
  {
    id: 3,
    title: "Free Fire Max Clash Squad Blitz",
    slug: "free-fire-max-clash-squad-blitz",
    game: "Free Fire",
    gameIcon: "zap",
    banner: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80",
    entryFee: 20,
    prizePool: 5000,
    maxPlayers: 64,
    participants: 41,
    startAt: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    status: "upcoming",
    format: "4v4 Clash Squad (Bermuda)",
    mode: "Clash Squad",
    round: "Round 1",
    description: "Fast-paced 4v4 action with custom room weapon settings and high-adrenaline rounds.",
    rules: [
      "Standard competitive weapon store limitations apply.",
      "Character skills enabled. Gun attributes disabled for fair play."
    ],
    prizeBreakdown: [
      { rank: "1st Place", prize: "₹2,500" },
      { rank: "2nd Place", prize: "₹1,500" },
      { rank: "3rd Place", prize: "₹1,000" }
    ],
    registeredUsers: [],
    featured: true
  },
  {
    id: 4,
    title: "CS2 Mumbai Premier Cup",
    slug: "cs2-mumbai-premier-cup",
    game: "CS2",
    gameIcon: "swords",
    banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    entryFee: 150,
    prizePool: 20000,
    maxPlayers: 16,
    participants: 16,
    startAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "completed",
    format: "5v5 MR12 Standard Bracket",
    mode: "Bomb Defusal",
    round: "Grand Finals (Finished)",
    winner: "Velocity Gaming",
    description: "128-tick equivalent subtick tournament. Full stats tracking and replay demos available for download.",
    rules: [
      "Active Duty competitive map pool.",
      "VAC clean accounts required with 500+ hours playtime."
    ],
    prizeBreakdown: [
      { rank: "1st Place", prize: "₹12,000" },
      { rank: "2nd Place", prize: "₹5,000" },
      { rank: "3rd Place", prize: "₹3,000" }
    ],
    registeredUsers: [1],
    featured: false
  },
  {
    id: 5,
    title: "COD Mobile Battle Royale Solo Rush",
    slug: "cod-mobile-solo-rush",
    game: "COD Mobile",
    gameIcon: "target",
    banner: "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1200&auto=format&fit=crop&q=80",
    entryFee: 0,
    prizePool: 3000,
    maxPlayers: 100,
    participants: 76,
    startAt: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
    status: "upcoming",
    format: "Solo Isolated Map",
    mode: "Free-to-Play Community Cup",
    round: "Qualifiers",
    description: "Free entry sponsored community cup! Practice your solo clutch skills and win real cash rewards into your wallet.",
    rules: [
      "No teaming or soft cheating.",
      "Record your device screen if you place in the top 3."
    ],
    prizeBreakdown: [
      { rank: "1st Place", prize: "₹1,500" },
      { rank: "2nd Place", prize: "₹900" },
      { rank: "3rd Place", prize: "₹600" }
    ],
    registeredUsers: [],
    featured: false
  }
];

let team = {
  id: 101,
  name: "Shadow Warriors",
  tag: "SHDW",
  logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
  description: "Elite tier esports squad competing in BGMI and Valorant tournaments across South Asia.",
  ownerId: 1,
  captainName: "Alex 'Viper' Chen",
  createdAt: "2024-02-10T14:00:00Z",
  stats: {
    matchesPlayed: 45,
    wins: 19,
    trophies: 4
  },
  members: [
    { id: 1, name: "Alex 'Viper' Chen", gamerTag: "ViperGG", role: "Captain", avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80", status: "online" },
    { id: 2, name: "Rohan 'Apex' Joshi", gamerTag: "ApexShot", role: "Co-Captain", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80", status: "in-game" },
    { id: 3, name: "Marcus 'Ghost' Vance", gamerTag: "GhostSniper", role: "Member", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80", status: "offline" },
    { id: 4, name: "Kavya 'Phoenix' Roy", gamerTag: "PhoenixFire", role: "Member", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", status: "online" },
    { id: 5, name: "Dev 'Kratos' Patel", gamerTag: "KratosEntry", role: "Member", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", status: "offline" }
  ],
  invitations: [
    { id: 201, teamName: "Neon Cyber Legion", teamTag: "NCL", invitedBy: "CyberKing", invitedAt: "Yesterday at 6:45 PM", status: "pending" }
  ]
};

let notifications = [
  {
    id: "notif-1",
    title: "Tournament starts in 2.5 hours",
    message: "BGMI Pro Championship room details will unlock 15 minutes before match time.",
    type: "tournament",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString()
  },
  {
    id: "notif-2",
    title: "Tournament registration confirmed",
    message: "You successfully enrolled in BGMI Pro Championship: Season 5. Entry fee ₹50 deducted.",
    type: "tournament",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: "notif-3",
    title: "Team invitation received",
    message: "Neon Cyber Legion invited you to join their squad roster.",
    type: "team",
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
  },
  {
    id: "notif-4",
    title: "Wallet deposit completed",
    message: "₹1,000 has been credited to your tournament balance via UPI reference UPI-4819283741.",
    type: "wallet",
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  }
];

// WebSocket Server initialization
const wss = new WebSocketServer({ server, path: "/ws" });

const broadcast = (event: string, data: any) => {
  const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

wss.on("connection", (ws) => {
  // Send welcome ping and connection confirmation
  ws.send(JSON.stringify({ event: "connection.established", data: { status: "connected", clientId: Math.random().toString(36).substring(7) } }));

  ws.on("message", (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.action === "ping") {
        ws.send(JSON.stringify({ event: "pong", timestamp: new Date().toISOString() }));
      }
    } catch {
      // ignore
    }
  });
});

// REST API Endpoints matching PHP Backend architecture

// Auth endpoints
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: "error", message: "Email and password are required" });
  }
  // Simulate successful JWT session token
  const token = "jwt-mock-esports-user-token-" + Date.now();
  return res.json({
    status: "success",
    message: "Login successful",
    token,
    user: currentUser
  });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, gamerTag } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ status: "error", message: "Please fill in all mandatory fields" });
  }
  currentUser = {
    ...currentUser,
    name,
    email,
    gamerTag: gamerTag || name.replace(/\s+/g, ""),
    accountStatus: "pending_verification"
  };
  const token = "jwt-mock-esports-user-token-" + Date.now();
  return res.json({
    status: "success",
    message: "Registration successful. Please verify your email.",
    token,
    user: currentUser,
    requireVerification: true
  });
});

app.get("/api/auth/me", (req, res) => {
  return res.json({ status: "success", user: currentUser });
});

app.post("/api/auth/verify-email", (req, res) => {
  const { code } = req.body;
  if (!code || code.length !== 6) {
    return res.status(400).json({ status: "error", message: "Invalid 6-digit verification code" });
  }
  currentUser.accountStatus = "verified";
  return res.json({ status: "success", message: "Email successfully verified!" });
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ status: "error", message: "Email is required" });
  }
  return res.json({ status: "success", message: "Password reset instructions have been sent to your email." });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { token, newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ status: "error", message: "Password must be at least 8 characters long" });
  }
  return res.json({ status: "success", message: "Password updated successfully! Please log in." });
});

app.post("/api/auth/logout", (req, res) => {
  return res.json({ status: "success", message: "Logged out successfully" });
});

// Tournament endpoints
app.get("/api/tournaments", (req, res) => {
  const { game, status, search, sort, maxEntryFee } = req.query;
  let filtered = [...tournaments];

  if (game && game !== "All") {
    filtered = filtered.filter(t => t.game.toLowerCase() === (game as string).toLowerCase());
  }

  if (status && status !== "All") {
    filtered = filtered.filter(t => t.status.toLowerCase() === (status as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || t.game.toLowerCase().includes(q));
  }

  if (maxEntryFee) {
    const maxFee = Number(maxEntryFee);
    if (!isNaN(maxFee)) {
      filtered = filtered.filter(t => t.entryFee <= maxFee);
    }
  }

  if (sort === "prize-high") {
    filtered.sort((a, b) => b.prizePool - a.prizePool);
  } else if (sort === "fee-low") {
    filtered.sort((a, b) => a.entryFee - b.entryFee);
  } else if (sort === "participants") {
    filtered.sort((a, b) => b.participants - a.participants);
  }

  return res.json({
    status: "success",
    data: filtered,
    total: filtered.length
  });
});

app.get("/api/tournaments/:id", (req, res) => {
  const id = Number(req.params.id);
  const tournament = tournaments.find(t => t.id === id);
  if (!tournament) {
    return res.status(404).json({ status: "error", message: "Tournament not found" });
  }

  // Generate realistic bracket & schedule data
  const bracket = {
    rounds: [
      {
        title: "Quarter Finals",
        matches: [
          { id: "M1", teamA: "Shadow Warriors", teamB: "GodLike Clan", scoreA: 16, scoreB: 12, winner: "Shadow Warriors", status: "completed" },
          { id: "M2", teamA: "Reckoning Esports", teamB: "Global Esports", scoreA: 9, scoreB: 16, winner: "Global Esports", status: "completed" },
          { id: "M3", teamA: "Soul Army", teamB: "Team Insane", scoreA: 16, scoreB: 14, winner: "Soul Army", status: "completed" },
          { id: "M4", teamA: "Entity Gaming", teamB: "True Rippers", scoreA: 11, scoreB: 16, winner: "True Rippers", status: "completed" },
        ]
      },
      {
        title: "Semi Finals",
        matches: [
          { id: "M5", teamA: "Shadow Warriors", teamB: "Global Esports", scoreA: 13, scoreB: 11, winner: null, status: tournament.status === "live" ? "live" : "scheduled" },
          { id: "M6", teamA: "Soul Army", teamB: "True Rippers", scoreA: 0, scoreB: 0, winner: null, status: "scheduled" },
        ]
      },
      {
        title: "Grand Finals",
        matches: [
          { id: "M7", teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0, winner: null, status: "scheduled" }
        ]
      }
    ]
  };

  const schedule = [
    { time: "16:00 IST", title: "Lobby Opening & Ping Test", status: "completed" },
    { time: "16:30 IST", title: "Quarter Finals - Match 1 to 4", status: "completed" },
    { time: "18:00 IST", title: "Semi Finals Broadcast", status: tournament.status === "live" ? "live" : "scheduled" },
    { time: "20:00 IST", title: "Grand Finale (Bo3)", status: "scheduled" },
    { time: "22:00 IST", title: "Prize Distribution & Leaderboard", status: "scheduled" }
  ];

  const participantsList = [
    { id: 1, name: currentUser.name, team: team.name, avatar: currentUser.avatar, seed: 1, isCurrentUser: true },
    { id: 2, name: "Jonathan 'JON' Amaral", team: "GodLike", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80", seed: 2 },
    { id: 3, name: "Harsh 'Goblin' Paudwal", team: "Soul Army", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80", seed: 3 },
    { id: 4, name: "Tanmay 'Scout' Singh", team: "Team XSpark", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", seed: 4 },
    { id: 5, name: "Mortal 'Naman' Mathur", team: "Soul Originals", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", seed: 5 }
  ];

  return res.json({
    status: "success",
    data: {
      ...tournament,
      isJoined: tournament.registeredUsers.includes(currentUser.id),
      bracket,
      schedule,
      participantsList
    }
  });
});

// Join Tournament (Backend Authoritative financial check)
app.post("/api/tournaments/:id/join", (req, res) => {
  const id = Number(req.params.id);
  const tournament = tournaments.find(t => t.id === id);

  if (!tournament) {
    return res.status(404).json({ status: "error", message: "Tournament does not exist" });
  }

  if (tournament.status === "completed") {
    return res.status(400).json({ status: "error", message: "This tournament has already ended" });
  }

  if (tournament.participants >= tournament.maxPlayers) {
    return res.status(400).json({ status: "error", message: "Tournament is already at full capacity" });
  }

  if (tournament.registeredUsers.includes(currentUser.id)) {
    return res.status(400).json({ status: "error", message: "You are already registered in this tournament" });
  }

  if (wallet.balance < tournament.entryFee) {
    return res.status(400).json({
      status: "error",
      message: `Insufficient wallet balance. Required: ₹${tournament.entryFee}, Available: ₹${wallet.balance}`,
      code: "INSUFFICIENT_BALANCE"
    });
  }

  // Deduct fee and record participation
  wallet.balance -= tournament.entryFee;
  tournament.participants += 1;
  tournament.registeredUsers.push(currentUser.id);
  currentUser.stats.tournamentsJoined += 1;

  const newTx = {
    id: "tx-" + Date.now(),
    date: new Date().toISOString(),
    type: "Tournament Entry",
    amount: -tournament.entryFee,
    status: "Completed",
    reference: `REF-JOIN-${tournament.id}-${Date.now().toString().slice(-4)}`,
    description: `Entry fee - ${tournament.title}`
  };
  transactions.unshift(newTx);

  const newNotif = {
    id: "notif-" + Date.now(),
    title: "Tournament Entry Confirmed",
    message: `You successfully joined ${tournament.title}. Entry fee ₹${tournament.entryFee} deducted.`,
    type: "tournament",
    read: false,
    timestamp: new Date().toISOString()
  };
  notifications.unshift(newNotif);

  // Broadcast WebSocket Events
  broadcast("tournament.participant_joined", {
    tournamentId: tournament.id,
    participants: tournament.participants,
    maxPlayers: tournament.maxPlayers,
    user: { id: currentUser.id, name: currentUser.name }
  });

  broadcast("wallet.updated", {
    balance: wallet.balance,
    currency: wallet.currency
  });

  broadcast("notification.created", newNotif);

  return res.json({
    status: "success",
    message: "Successfully joined tournament!",
    data: {
      tournamentId: tournament.id,
      remainingBalance: wallet.balance,
      participants: tournament.participants
    }
  });
});

// Wallet Endpoints
app.get("/api/wallet", (req, res) => {
  return res.json({
    status: "success",
    data: {
      ...wallet,
      stats: {
        totalDeposited: wallet.totalDeposited,
        totalWithdrawn: wallet.totalWithdrawn,
        totalWon: wallet.totalWon
      }
    }
  });
});

app.get("/api/wallet/transactions", (req, res) => {
  const { type, status, search } = req.query;
  let list = [...transactions];

  if (type && type !== "All") {
    list = list.filter(t => t.type.toLowerCase() === (type as string).toLowerCase());
  }

  if (status && status !== "All") {
    list = list.filter(t => t.status.toLowerCase() === (status as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(t => t.description.toLowerCase().includes(q) || t.reference.toLowerCase().includes(q));
  }

  return res.json({
    status: "success",
    data: list,
    total: list.length
  });
});

app.post("/api/wallet/deposit", (req, res) => {
  const { amount, method, referenceId } = req.body;
  const numAmount = Number(amount);

  if (!numAmount || numAmount < 10) {
    return res.status(400).json({ status: "error", message: "Minimum deposit amount is ₹10" });
  }

  wallet.balance += numAmount;
  wallet.totalDeposited += numAmount;

  const newTx = {
    id: "tx-" + Date.now(),
    date: new Date().toISOString(),
    type: "Deposit",
    amount: numAmount,
    status: "Completed",
    reference: referenceId || `DEP-UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    description: `Instant deposit via ${method || "UPI"}`
  };
  transactions.unshift(newTx);

  const notif = {
    id: "notif-" + Date.now(),
    title: "Wallet Deposit Credited",
    message: `₹${numAmount} successfully added to your wallet.`,
    type: "wallet",
    read: false,
    timestamp: new Date().toISOString()
  };
  notifications.unshift(notif);

  broadcast("wallet.updated", {
    balance: wallet.balance,
    currency: wallet.currency
  });
  broadcast("notification.created", notif);

  return res.json({
    status: "success",
    message: `₹${numAmount} deposited successfully!`,
    data: {
      balance: wallet.balance,
      transaction: newTx
    }
  });
});

app.post("/api/wallet/withdraw", (req, res) => {
  const { amount, method, accountDetails } = req.body;
  const numAmount = Number(amount);

  if (!numAmount || numAmount < 100) {
    return res.status(400).json({ status: "error", message: "Minimum withdrawal amount is ₹100" });
  }

  if (wallet.balance < numAmount) {
    return res.status(400).json({ status: "error", message: "Withdrawal amount exceeds available balance" });
  }

  wallet.balance -= numAmount;
  wallet.totalWithdrawn += numAmount;

  const newTx = {
    id: "tx-" + Date.now(),
    date: new Date().toISOString(),
    type: "Withdrawal",
    amount: -numAmount,
    status: "Pending",
    reference: `WDR-${Date.now().toString().slice(-6)}`,
    description: `Withdrawal to ${method} (${accountDetails || "Verified Account"})`
  };
  transactions.unshift(newTx);

  const notif = {
    id: "notif-" + Date.now(),
    title: "Withdrawal Requested",
    message: `Withdrawal of ₹${numAmount} is under processing. Payout will be completed within 2 hours.`,
    type: "wallet",
    read: false,
    timestamp: new Date().toISOString()
  };
  notifications.unshift(notif);

  broadcast("wallet.updated", {
    balance: wallet.balance,
    currency: wallet.currency
  });
  broadcast("notification.created", notif);

  return res.json({
    status: "success",
    message: `Withdrawal request for ₹${numAmount} submitted successfully.`,
    data: {
      balance: wallet.balance,
      transaction: newTx
    }
  });
});

// Team Endpoints
app.get("/api/team", (req, res) => {
  return res.json({
    status: "success",
    data: team
  });
});

app.post("/api/team/create", (req, res) => {
  const { name, tag, description, logo } = req.body;
  if (!name || !tag) {
    return res.status(400).json({ status: "error", message: "Team name and tag are required" });
  }

  team = {
    id: Math.floor(100 + Math.random() * 900),
    name,
    tag: tag.toUpperCase(),
    logo: logo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    description: description || "Competitive esports team.",
    ownerId: currentUser.id,
    captainName: currentUser.name,
    createdAt: new Date().toISOString(),
    stats: { matchesPlayed: 0, wins: 0, trophies: 0 },
    members: [
      {
        id: currentUser.id,
        name: currentUser.name,
        gamerTag: currentUser.gamerTag,
        role: "Captain",
        avatar: currentUser.avatar,
        status: "online"
      }
    ],
    invitations: []
  };

  broadcast("team.created", team);

  return res.json({ status: "success", message: "Team created successfully!", data: team });
});

app.post("/api/team/invite", (req, res) => {
  const { gamerTag, role } = req.body;
  if (!gamerTag) {
    return res.status(400).json({ status: "error", message: "Player GamerTag or ID is required" });
  }

  const newMember = {
    id: Math.floor(1000 + Math.random() * 9000),
    name: gamerTag,
    gamerTag: gamerTag,
    role: role || "Member",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "offline"
  };

  team.members.push(newMember);

  broadcast("team.member_added", {
    teamId: team.id,
    member: newMember
  });

  return res.json({
    status: "success",
    message: `Invitation sent to ${gamerTag} successfully!`,
    data: newMember
  });
});

app.post("/api/team/members/:id/remove", (req, res) => {
  const memberId = Number(req.params.id);
  if (memberId === currentUser.id) {
    return res.status(400).json({ status: "error", message: "Captain cannot remove themselves. Please transfer ownership or disband." });
  }

  team.members = team.members.filter(m => m.id !== memberId);
  broadcast("team.updated", team);

  return res.json({ status: "success", message: "Member removed from team" });
});

app.post("/api/team/invitations/:id/accept", (req, res) => {
  const invId = Number(req.params.id);
  team.invitations = team.invitations.filter(i => i.id !== invId);
  return res.json({ status: "success", message: "Team invitation accepted!" });
});

app.post("/api/team/invitations/:id/decline", (req, res) => {
  const invId = Number(req.params.id);
  team.invitations = team.invitations.filter(i => i.id !== invId);
  return res.json({ status: "success", message: "Team invitation declined" });
});

// Profile Endpoints
app.get("/api/profile", (req, res) => {
  return res.json({ status: "success", data: currentUser });
});

app.post("/api/profile", (req, res) => {
  const { name, gamerTag, phone, inGameIds, avatar } = req.body;
  currentUser = {
    ...currentUser,
    name: name || currentUser.name,
    gamerTag: gamerTag || currentUser.gamerTag,
    phone: phone || currentUser.phone,
    avatar: avatar || currentUser.avatar,
    inGameIds: {
      ...currentUser.inGameIds,
      ...(inGameIds || {})
    }
  };
  return res.json({ status: "success", message: "Profile updated successfully!", data: currentUser });
});

// Notifications
app.get("/api/notifications", (req, res) => {
  return res.json({
    status: "success",
    data: notifications,
    unreadCount: notifications.filter(n => !n.read).length
  });
});

app.post("/api/notifications/:id/read", (req, res) => {
  const id = req.params.id;
  notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  return res.json({ status: "success" });
});

app.post("/api/notifications/read-all", (req, res) => {
  notifications = notifications.map(n => ({ ...n, read: true }));
  return res.json({ status: "success", message: "All notifications marked as read" });
});

// Dev/Reviewer Simulator Endpoint: Trigger arbitrary real-time events for inspection!
app.post("/api/realtime/simulate", (req, res) => {
  const { type } = req.body;

  if (type === "join_event") {
    const t = tournaments[0];
    t.participants = Math.min(t.maxPlayers, t.participants + 1);
    broadcast("tournament.participant_joined", {
      tournamentId: t.id,
      participants: t.participants,
      maxPlayers: t.maxPlayers,
      user: { id: 999, name: "Player_" + Math.floor(Math.random() * 999) }
    });
    return res.json({ status: "success", message: "Triggered live participant joined" });
  }

  if (type === "live_score") {
    const t = tournaments[1]; // live tournament
    const scoreA = Math.floor(10 + Math.random() * 5);
    const scoreB = Math.floor(8 + Math.random() * 5);
    t.liveScore = `Team Liquid (${scoreA}) vs Fnatic (${scoreB}) - Map 2 (Round ${scoreA + scoreB})`;
    broadcast("tournament.updated", t);
    return res.json({ status: "success", message: "Triggered live match score update", score: t.liveScore });
  }

  if (type === "deposit_received") {
    const amt = 500;
    wallet.balance += amt;
    const notif = {
      id: "notif-" + Date.now(),
      title: "Wallet Deposit Received",
      message: `₹${amt} received via instant UPI settlement.`,
      type: "wallet",
      read: false,
      timestamp: new Date().toISOString()
    };
    notifications.unshift(notif);
    broadcast("wallet.updated", { balance: wallet.balance, currency: wallet.currency });
    broadcast("notification.created", notif);
    return res.json({ status: "success", message: "Triggered deposit event", newBalance: wallet.balance });
  }

  if (type === "new_tournament") {
    const newTournament = {
      id: 100 + tournaments.length,
      title: "Apex Legends Trios Blitz #" + (tournaments.length + 1),
      slug: "apex-trios-" + Date.now(),
      game: "Apex Legends",
      gameIcon: "zap",
      banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
      entryFee: 40,
      prizePool: 8000,
      maxPlayers: 60,
      participants: 12,
      startAt: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
      status: "upcoming",
      format: "Trios (Olympus)",
      mode: "Battle Royale",
      round: "Qualifiers",
      description: "Fast-paced Apex Legends tournament. Points per kill + placement multiplier.",
      rules: ["No glitch exploitation.", "Must submit final placement screenshots."],
      prizeBreakdown: [{ rank: "1st", prize: "₹4,000" }, { rank: "2nd", prize: "₹2,500" }],
      registeredUsers: [],
      featured: false
    };
    tournaments.unshift(newTournament);
    broadcast("tournament.created", newTournament);
    return res.json({ status: "success", message: "Broadcasted tournament.created", tournament: newTournament });
  }

  return res.status(400).json({ status: "error", message: "Unknown simulation type" });
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Esports Tournament Hub server listening on http://localhost:${PORT}`);
  });
}

start();
