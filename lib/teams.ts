export type Team = {
  id: string;
  name: string;
  logo: string;
  league: string;
  sportsdbName?: string; // nombre alternativo para buscar en TheSportsDB
};

const BASE = "https://crests.football-data.org";

export const TEAMS: Team[] = [
  // ========== PREMIER LEAGUE ==========
  { id: "57",   name: "Arsenal",             logo: `${BASE}/57.png`,   league: "Premier League" },
  { id: "58",   name: "Aston Villa",         logo: `${BASE}/58.png`,   league: "Premier League" },
  { id: "1044", name: "Bournemouth",         logo: `${BASE}/1044.png`, league: "Premier League" },
  { id: "402",  name: "Brentford",           logo: `${BASE}/402.png`,  league: "Premier League" },
  { id: "397",  name: "Brighton",            logo: `${BASE}/397.png`,  league: "Premier League" },
  { id: "61",   name: "Chelsea",             logo: `${BASE}/61.png`,   league: "Premier League" },
  { id: "354",  name: "Crystal Palace",      logo: `${BASE}/354.png`,  league: "Premier League" },
  { id: "62",   name: "Everton",             logo: `${BASE}/62.png`,   league: "Premier League" },
  { id: "63",   name: "Fulham",              logo: `${BASE}/63.png`,   league: "Premier League" },
  { id: "64",   name: "Liverpool",           logo: `${BASE}/64.png`,   league: "Premier League" },
  { id: "65",   name: "Manchester City",     logo: `${BASE}/65.png`,   league: "Premier League" },
  { id: "66",   name: "Manchester United",   logo: `${BASE}/66.png`,   league: "Premier League" },
  { id: "67",   name: "Newcastle United",    logo: `${BASE}/67.png`,   league: "Premier League" },
  { id: "351",  name: "Nottingham Forest",   logo: `${BASE}/351.png`,  league: "Premier League" },
  { id: "73",   name: "Tottenham Hotspur",   logo: `${BASE}/73.png`,   league: "Premier League" },
  { id: "563",  name: "West Ham United",     logo: `${BASE}/563.png`,  league: "Premier League" },
  { id: "76",   name: "Wolverhampton",       logo: `${BASE}/76.png`,   league: "Premier League" },
  { id: "71",   name: "Sunderland",          logo: `${BASE}/71.png`,   league: "Premier League" },
  { id: "328",  name: "Burnley FC",          logo: `${BASE}/328.png`,  league: "Premier League" },
  { id: "341",  name: "Leeds United",        logo: `${BASE}/341.png`,  league: "Premier League" },

  // ========== LA LIGA ==========
  { id: "263",  name: "Deportivo Alavés",    logo: `${BASE}/263.png`,  league: "La Liga" },
  { id: "77",   name: "Athletic Club",       logo: `${BASE}/77.png`,   league: "La Liga" },
  { id: "78",   name: "Atletico Madrid",     logo: `${BASE}/78.png`,   league: "La Liga" },
  { id: "81",   name: "Barcelona",           logo: `${BASE}/81.png`,   league: "La Liga" },
  { id: "558",  name: "Celta Vigo",          logo: `${BASE}/558.png`,  league: "La Liga" },
  { id: "80",   name: "Espanyol",            logo: `${BASE}/80.png`,   league: "La Liga" },
  { id: "82",   name: "Getafe",              logo: `${BASE}/82.png`,   league: "La Liga" },
  { id: "298",  name: "Girona",              logo: `${BASE}/298.png`,  league: "La Liga" },
  { id: "89",   name: "Mallorca",            logo: `${BASE}/89.png`,   league: "La Liga" },
  { id: "79",   name: "Osasuna",             logo: `${BASE}/79.png`,   league: "La Liga" },
  { id: "87",   name: "Rayo Vallecano",      logo: `${BASE}/87.png`,   league: "La Liga" },
  { id: "90",   name: "Real Betis",          logo: `${BASE}/90.png`,   league: "La Liga" },
  { id: "86",   name: "Real Madrid",         logo: `${BASE}/86.png`,   league: "La Liga" },
  { id: "92",   name: "Real Sociedad",       logo: `${BASE}/92.png`,   league: "La Liga" },
  { id: "559",  name: "Sevilla",             logo: `${BASE}/559.png`,  league: "La Liga" },
  { id: "88",   name: "Levante UD",          logo: `${BASE}/88.png`,   league: "La Liga" },
  { id: "285",  name: "Elche CF",            logo: `${BASE}/285.png`,  league: "La Liga" },
  { id: "1048", name: "Real Oviedo",         logo: `${BASE}/1048.png`, league: "La Liga" },
  { id: "95",   name: "Valencia",            logo: `${BASE}/95.png`,   league: "La Liga" },
  { id: "94",   name: "Villarreal",          logo: `${BASE}/94.png`,   league: "La Liga" },

  // ========== BUNDESLIGA ==========
  { id: "16",   name: "FC Augsburg",         logo: `${BASE}/16.png`,   league: "Bundesliga" },
  { id: "3",    name: "Bayer Leverkusen",    logo: `${BASE}/3.png`,    league: "Bundesliga" },
  { id: "5",    name: "Bayern Munich",       logo: `${BASE}/5.png`,    league: "Bundesliga" },
  { id: "4",    name: "Borussia Dortmund",   logo: `${BASE}/4.png`,    league: "Bundesliga" },
  { id: "18",   name: "Borussia Mönchengladbach", logo: `${BASE}/18.png`, league: "Bundesliga" },
  { id: "7",    name: "Hamburgo SV",         logo: `${BASE}/7.png`,    league: "Bundesliga" },
  { id: "1",    name: "FC Colonia",           logo: `${BASE}/1.png`,    league: "Bundesliga" },
  { id: "19",   name: "Eintracht Frankfurt", logo: `${BASE}/19.png`,   league: "Bundesliga" },
  { id: "17",   name: "SC Freiburg",         logo: `${BASE}/17.png`,   league: "Bundesliga" },
  { id: "44",   name: "Heidenheim",          logo: `${BASE}/44.png`,   league: "Bundesliga" },
  { id: "2",    name: "Hoffenheim",          logo: `${BASE}/2.png`,    league: "Bundesliga" },
  { id: "15",   name: "Mainz 05",            logo: `${BASE}/15.png`,   league: "Bundesliga" },
  { id: "721",  name: "RB Leipzig",          logo: `${BASE}/721.png`,  league: "Bundesliga" },
  { id: "20",   name: "FC St. Pauli",        logo: `${BASE}/20.png`,   league: "Bundesliga" },
  { id: "10",   name: "VfB Stuttgart",       logo: `${BASE}/10.png`,   league: "Bundesliga" },
  { id: "28",   name: "Union Berlin",        logo: `${BASE}/28.png`,   league: "Bundesliga" },
  { id: "12",   name: "Werder Bremen",       logo: `${BASE}/12.png`,   league: "Bundesliga" },
  { id: "11",   name: "VfL Wolfsburg",       logo: `${BASE}/11.png`,   league: "Bundesliga" },

  // ========== SERIE A ==========
  { id: "98",   name: "AC Milan",            logo: `${BASE}/98.png`,   league: "Serie A" },
  { id: "102",  name: "Atalanta",            logo: `${BASE}/102.png`,  league: "Serie A" },
  { id: "103",  name: "Bologna",             logo: `${BASE}/103.png`,  league: "Serie A" },
  { id: "471",  name: "Sassuolo",            logo: `${BASE}/471.png`,  league: "Serie A" },
  { id: "104",  name: "Cagliari",            logo: `${BASE}/104.png`,  league: "Serie A" },
  { id: "7397", name: "Como",                logo: `${BASE}/7397.png`, league: "Serie A" },
  { id: "99",   name: "Fiorentina",          logo: `${BASE}/99.png`,   league: "Serie A" },
  { id: "107",  name: "Genoa",               logo: `${BASE}/107.png`,  league: "Serie A" },
  { id: "108",  name: "Inter Milan",         logo: `${BASE}/108.png`,  league: "Serie A" },
  { id: "109",  name: "Juventus",            logo: `${BASE}/109.png`,  league: "Serie A" },
  { id: "110",  name: "Lazio",               logo: `${BASE}/110.png`,  league: "Serie A" },
  { id: "5890", name: "Lecce",               logo: `${BASE}/5890.png`, league: "Serie A" },
  { id: "457",  name: "Cremonese",           logo: `${BASE}/457.png`,  league: "Serie A" },
  { id: "113",  name: "Napoli",              logo: `${BASE}/113.png`,  league: "Serie A" },
  { id: "112",  name: "Parma",               logo: `${BASE}/112.png`,  league: "Serie A" },
  { id: "100",  name: "Roma",                logo: `${BASE}/100.png`,  league: "Serie A" },
  { id: "586",  name: "Torino",              logo: `${BASE}/586.png`,  league: "Serie A" },
  { id: "115",  name: "Udinese",             logo: `${BASE}/115.png`,  league: "Serie A" },
  { id: "450",  name: "Hellas Verona",       logo: `${BASE}/450.png`,  league: "Serie A" },
  { id: "487",  name: "Pisa",               logo: `${BASE}/487.png`,  league: "Serie A" },

  // ========== LIGUE 1 ==========
  { id: "532",  name: "Angers",              logo: `${BASE}/532.png`,  league: "Ligue 1" },
  { id: "512",  name: "Stade Brestois",      logo: `${BASE}/512.png`,  league: "Ligue 1" },
  { id: "533",  name: "Le Havre",            logo: `${BASE}/533.png`,  league: "Ligue 1" },
  { id: "546",  name: "Lens",                logo: `${BASE}/546.png`,  league: "Ligue 1" },
  { id: "521",  name: "Lille",               logo: `${BASE}/521.png`,  league: "Ligue 1" },
  { id: "523",  name: "Lyon",                logo: `${BASE}/523.png`,  league: "Ligue 1" },
  { id: "516",  name: "Marsella",            logo: `${BASE}/516.png`,  league: "Ligue 1" },
  { id: "548",  name: "Monaco",              logo: `${BASE}/548.png`,  league: "Ligue 1" },
  { id: "543",  name: "Nantes",              logo: `${BASE}/543.png`,  league: "Ligue 1" },
  { id: "545",  name: "Metz",               logo: `${BASE}/545.png`,  league: "Ligue 1" },
  { id: "522",  name: "Niza",                logo: `${BASE}/522.png`,  league: "Ligue 1" },
  { id: "524",  name: "Paris Saint-Germain", logo: `${BASE}/524.png`,  league: "Ligue 1", sportsdbName: "Paris SG" },
  { id: "529",  name: "Rennes",              logo: `${BASE}/529.png`,  league: "Ligue 1" },
  { id: "576",  name: "Racing de Estrasburgo", logo: `${BASE}/576.png`, league: "Ligue 1" },
  { id: "525",  name: "Lorient",              logo: `${BASE}/525.png`,  league: "Ligue 1" },
  { id: "511",  name: "Toulouse",            logo: `${BASE}/511.png`,  league: "Ligue 1" },
  { id: "1045", name: "Paris FC",            logo: `${BASE}/1045.png`, league: "Ligue 1" },
  { id: "519",  name: "Auxerre",             logo: `${BASE}/519.png`,  league: "Ligue 1" },

  // ========== LIGA DIMAYOR (COLOMBIA) ==========
  { id: "137607", name: "Atlético Nacional",     logo: "https://r2.thesportsdb.com/images/media/team/badge/efl4o41576157720.png", league: "Liga Dimayor" },
  { id: "137617", name: "Millonarios FC",         logo: "https://r2.thesportsdb.com/images/media/team/badge/mc73ix1629122587.png", league: "Liga Dimayor" },
  { id: "137615", name: "Junior FC",              logo: "https://r2.thesportsdb.com/images/media/team/badge/zzarls1576161686.png", league: "Liga Dimayor" },
  { id: "137609", name: "Deportes Tolima",        logo: "https://r2.thesportsdb.com/images/media/team/badge/4bscjt1766423328.png", league: "Liga Dimayor" },
  { id: "137606", name: "Atlético Bucaramanga",   logo: "https://r2.thesportsdb.com/images/media/team/badge/rtjs411576157184.png", league: "Liga Dimayor" },
  { id: "137623", name: "Deportivo Pereira",      logo: "https://r2.thesportsdb.com/images/media/team/badge/elw7as1629122545.png", league: "Liga Dimayor" },
  { id: "137621", name: "Independiente Santa Fe", logo: "https://r2.thesportsdb.com/images/media/team/badge/16vs771629122765.png", league: "Liga Dimayor" },
  { id: "137608", name: "América de Cali",        logo: "https://r2.thesportsdb.com/images/media/team/badge/lwxcn71576156105.png", league: "Liga Dimayor" },
  { id: "137613", name: "Independiente Medellín", logo: "https://r2.thesportsdb.com/images/media/team/badge/f50g3b1678411414.png", league: "Liga Dimayor" },
  { id: "137618", name: "Once Caldas",            logo: "https://www.thesportsdb.com/images/media/team/badge/nuh9kd1778085916.png", league: "Liga Dimayor" },
  { id: "137622", name: "Boyacá Chicó",           logo: "https://r2.thesportsdb.com/images/media/team/badge/boe8tv1677602771.png", league: "Liga Dimayor" },
  { id: "137605", name: "Alianza FC",             logo: "https://r2.thesportsdb.com/images/media/team/badge/efldut1715066310.png", league: "Liga Dimayor" },
  { id: "137610", name: "Deportivo Cali",         logo: "https://r2.thesportsdb.com/images/media/team/badge/isc2yu1580833286.png", league: "Liga Dimayor" },
  { id: "137611", name: "Deportivo Pasto",        logo: "https://r2.thesportsdb.com/images/media/team/badge/zlmyh31576159327.png", league: "Liga Dimayor" },
  { id: "137614", name: "Jaguares de Córdoba",    logo: "https://r2.thesportsdb.com/images/media/team/badge/7ypl1y1629122579.png", league: "Liga Dimayor" },
  { id: "col-int", name: "Internacional de Bogotá", logo: "https://r2.thesportsdb.com/images/media/team/badge/jujchi1767716318.png", league: "Liga Dimayor" },
  { id: "col-agu", name: "Águilas Doradas",         logo: "https://r2.thesportsdb.com/images/media/team/badge/6d7qas1703002070.png", league: "Liga Dimayor" },
  { id: "col-for", name: "Fortaleza FC",            logo: "https://r2.thesportsdb.com/images/media/team/badge/w1c6ix1769101721.png", league: "Liga Dimayor" },
  { id: "col-cuc", name: "Cúcuta Deportivo",        logo: "https://www.thesportsdb.com/images/media/team/badge/petg3h1778087075.png/medium", league: "Liga Dimayor" },
  { id: "137616", name: "Llaneros FC",            logo: "https://r2.thesportsdb.com/images/media/team/badge/q1w56m1615832197.png", league: "Liga Dimayor" },
];

function normalize(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function searchTeams(query: string): Team[] {
  if (query.length < 2) return [];
  const q = normalize(query.trim());
  return TEAMS.filter((t) => normalize(t.name).includes(q)).slice(0, 7);
}
