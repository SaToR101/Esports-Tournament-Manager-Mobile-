import { supabase } from './supabase';

// --- ИНТЕРФЕЙСЫ ---
export interface Game { id: number; name: string; }
export interface Format { id: number; name: string; }
export interface Sponsor { id: number; name: string; }
export interface Team { id: number; name: string; logo_url?: string; }

export interface Match {
  id: number;
  stage_name: string;
  team1: Team;
  team2: Team;
  best_of: number;
  start_time: string;
  team1_score: number;
  team2_score: number;
  status: string;
  stream_url?: string;
}

export interface Tournament {
  id?: number;
  title: string;
  description: string;
  date: string;
  image?: string | null;
  user_id?: string;
  game_id?: number | null;
  format_id?: number | null;
  sponsor_ids?: number[];
  team_ids?: number[];
}

export interface PlayerStats {
  id: number;
  nickname: string;
  first_name: string;
  last_name: string;
  role: string;
  avg_kills: number;
  avg_deaths: number;
  avg_rating: number;
}

export interface TeamProfile {
  id: number;
  name: string;
  logo_url: string;
  players: PlayerStats[];
}

export interface PlayerProfile extends PlayerStats {
  impact: number;
  hs_percent: number;
  adr: number;
}

export interface MapPlayed {
  id: number;
  map_name: string;
  team1_score: number;
  team2_score: number;
}


// --- СПРАВОЧНИКИ ---
export const getGames = async () => (await supabase.from('games').select('*').order('name')).data || [];
export const getFormats = async () => (await supabase.from('formats').select('*')).data || [];
export const getSponsors = async () => (await supabase.from('sponsors').select('*').order('name')).data || [];
export const getTeams = async () => (await supabase.from('teams').select('*').order('name')).data || [];
export const getAllMaps = async () => (await supabase.from('maps').select('*')).data || [];

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
const getOrCreateStage = async (tournamentId: number) => {
  let { data: stage } = await supabase.from('tournament_stages').select('id').eq('tournament_id', tournamentId).limit(1).maybeSingle();
  if (!stage) {
    const { data: newStage, error } = await supabase.from('tournament_stages').insert([{ tournament_id: tournamentId, name: 'Основной этап', type: 'playoffs' }]).select().single();
    if (error) throw error;
    return newStage.id;
  }
  return stage.id;
};

// --- МАТЧИ ---
export const getMatchesByTournament = async (tournamentId: number): Promise<Match[]> => {
  try {
    const { data, error } = await supabase.from('matches').select(`
            id, best_of, start_time, team1_score, team2_score, status,
            tournament_stages!inner(tournament_id, name),
            team1:teams!matches_team1_id_fkey(id, name, logo_url),
            team2:teams!matches_team2_id_fkey(id, name, logo_url),
            match_streams(url)
        `).eq('tournament_stages.tournament_id', tournamentId).order('start_time', { ascending: true });

    if (error) throw error;

    return data.map((m: any) => ({
      id: m.id,
      stage_name: m.tournament_stages.name,
      team1: m.team1,
      team2: m.team2,
      best_of: m.best_of,
      start_time: m.start_time,
      team1_score: m.team1_score,
      team2_score: m.team2_score,
      status: m.status,
      stream_url: m.match_streams?.[0]?.url || undefined
    }));
  } catch (error) {
    console.error("Error loading matches:", error);
    return [];
  }
};

export const saveMatch = async (tournamentId: number, matchData: any, matchId?: number) => {
  try {
    const stageId = await getOrCreateStage(tournamentId);
    const dbMatchData = {
      stage_id: stageId,
      team1_id: Number(matchData.team1_id),
      team2_id: Number(matchData.team2_id),
      team1_score: Number(matchData.team1_score),
      team2_score: Number(matchData.team2_score),
      best_of: Number(matchData.best_of),
      status: matchData.status,
      start_time: matchData.start_time || new Date().toISOString()
    };

    let resultMatch;
    if (matchId) {
      const { data, error } = await supabase.from('matches').update(dbMatchData).eq('id', matchId).select().single();
      if (error) throw error;
      resultMatch = data;
    } else {
      const { data, error } = await supabase.from('matches').insert([dbMatchData]).select().single();
      if (error) throw error;
      resultMatch = data;
    }

    // Сохранение стрима в отдельную таблицу
    if (resultMatch && matchData.stream_url) {
      await supabase.from('match_streams').delete().eq('match_id', resultMatch.id);
      await supabase.from('match_streams').insert([{
        match_id: resultMatch.id,
        url: matchData.stream_url,
        platform: matchData.stream_url.includes('youtube') ? 'YouTube' : 'Twitch'
      }]);
    }

    return resultMatch;
  } catch (error) {
    console.error("Save Match Error:", error);
    return null;
  }
};

export const deleteMatch = async (matchId: number) => {
  try {
    const { error } = await supabase.from('matches').delete().eq('id', matchId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Ошибка удаления матча:", error);
    return false;
  }
};

// --- ТУРНИРЫ ---
export const getTournaments = async (): Promise<Tournament[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from('tournaments').select(`*, tournament_sponsors(sponsor_id), tournament_participants(team_id)`).eq('user_id', user.id).order('start_date', { ascending: false });
  if (error) return [];
  return data.map(item => ({
    id: item.id, title: item.title, description: item.description, date: item.start_date, image: item.image_base64,
    game_id: item.game_id, format_id: item.format_id,
    sponsor_ids: item.tournament_sponsors.map((s: any) => s.sponsor_id),
    team_ids: item.tournament_participants.map((p: any) => p.team_id)
  }));
};

export const saveTournament = async (tournament: Tournament): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const dbData = { title: tournament.title, description: tournament.description, start_date: tournament.date, image_base64: tournament.image || null, user_id: user.id, game_id: tournament.game_id || null, format_id: tournament.format_id || null };
  let tId = tournament.id;
  if (tId) {
    await supabase.from('tournaments').update(dbData).eq('id', tId);
    await supabase.from('tournament_sponsors').delete().eq('tournament_id', tId);
    await supabase.from('tournament_participants').delete().eq('tournament_id', tId);
  } else {
    const { data, error } = await supabase.from('tournaments').insert([dbData]).select().single();
    if (error) return;
    tId = data.id;
  }
  if (tournament.sponsor_ids?.length) await supabase.from('tournament_sponsors').insert(tournament.sponsor_ids.map(id => ({ tournament_id: tId, sponsor_id: id })));
  if (tournament.team_ids?.length) await supabase.from('tournament_participants').insert(tournament.team_ids.map(id => ({ tournament_id: tId, team_id: id })));
};

export const getTournamentById = async (id: string | number): Promise<Tournament | null> => {
  const { data, error } = await supabase.from('tournaments').select(`*, tournament_sponsors(sponsor_id), tournament_participants(team_id)`).eq('id', Number(id)).single();
  if (error || !data) return null;
  return { id: data.id, title: data.title, description: data.description, date: data.start_date, image: data.image_base64, game_id: data.game_id, format_id: data.format_id, sponsor_ids: data.tournament_sponsors.map((s: any) => s.sponsor_id), team_ids: data.tournament_participants.map((p: any) => p.team_id) };
};

export const deleteTournament = async (id: string | number) => { await supabase.from('tournaments').delete().eq('id', Number(id)); };

// --- ПРОФИЛИ И КОМАНДЫ ---
export const getTeamProfile = async (teamId: number): Promise<TeamProfile | null> => {
  try {
    const { data: teamData, error: teamErr } = await supabase.from('teams').select('*').eq('id', teamId).single();
    if (teamErr) throw teamErr;
    const { data: rosterData, error: rosterErr } = await supabase.from('team_rosters').select(`role, players (id, nickname, first_name, last_name, player_map_stats (kills, deaths, hltv_rating))`).eq('team_id', teamId).is('leave_date', null);
    if (rosterErr) throw rosterErr;
    const players: PlayerStats[] = (rosterData as any[]).map((roster: any) => {
      const p = roster.players;
      const statsArray = p.player_map_stats || [];
      if (statsArray.length === 0) return { id: p.id, nickname: p.nickname, first_name: p.first_name, last_name: p.last_name, role: roster.role, avg_kills: 0, avg_deaths: 0, avg_rating: 0 };
      const avgKills = statsArray.reduce((sum: number, s: any) => sum + (s.kills || 0), 0) / statsArray.length;
      const avgDeaths = statsArray.reduce((sum: number, s: any) => sum + (s.deaths || 0), 0) / statsArray.length;
      const avgRating = statsArray.reduce((sum: number, s: any) => sum + (s.hltv_rating || 0), 0) / statsArray.length;
      return { id: p.id, nickname: p.nickname, first_name: p.first_name, last_name: p.last_name, role: roster.role, avg_kills: Math.round(avgKills), avg_deaths: Math.round(avgDeaths), avg_rating: Number(avgRating.toFixed(2)) };
    });
    players.sort((a, b) => b.avg_rating - a.avg_rating);
    return { id: teamData.id, name: teamData.name, logo_url: teamData.logo_url, players };
  } catch (error) { return null; }
};

export const getFullPlayerProfile = async (playerId: number) => {
  const { data, error } = await supabase.from('player_map_stats').select('*').eq('player_id', playerId);

  if (error || !data || data.length === 0) return null;

  const count = data.length;
  // Считаем общие суммы для K/D
  const totalKills = data.reduce((sum, row) => sum + (row.kills || 0), 0);
  const totalDeaths = data.reduce((sum, row) => sum + (row.deaths || 0), 0);

  // Считаем средние значения для остальных метрик
  const avgRating = data.reduce((sum, row) => sum + (row.hltv_rating || 0), 0) / count;
  const avgAdr = data.reduce((sum, row) => sum + (row.adr || 0), 0) / count;
  const avgImpact = data.reduce((sum, row) => sum + (row.impact || 0), 0) / count;
  const avgHs = data.reduce((sum, row) => sum + (row.hs_percent || 0), 0) / count;

  return {
    rating: avgRating.toFixed(2),
    adr: avgAdr.toFixed(1),
    kd: (totalKills / (totalDeaths || 1)).toFixed(2),
    impact: avgImpact.toFixed(2),
    hs: avgHs.toFixed(1),
  };
};

// --- КАРТЫ И СКОРБОРД ---
export const getMatchMaps = async (matchId: number): Promise<MapPlayed[]> => {
  const { data, error } = await supabase.from('match_maps_played').select(`id, team1_score, team2_score, map_id, maps(name)`).eq('match_id', matchId);
  if (error) return [];
  return data.map((m: any) => ({ id: m.id, map_id: m.map_id, map_name: m.maps.name, team1_score: m.team1_score, team2_score: m.team2_score }));
};

export const getMapScoreboard = async (mapPlayedId: number) => {
  const { data, error } = await supabase.from('player_map_stats').select(`*, players(id, nickname, team_rosters(team_id))`).eq('map_played_id', mapPlayedId);
  return error ? [] : data;
};

export const saveMatchMap = async (mapData: any) => {
  const dbMapData = { id: mapData.id || undefined, match_id: mapData.match_id, map_id: mapData.map_id, team1_score: Number(mapData.team1_score), team2_score: Number(mapData.team2_score) };
  const { data, error } = await supabase.from('match_maps_played').upsert(dbMapData).select().single();
  if (error) throw error;
  return data;
};

export const savePlayerMapStats = async (stats: any) => {
  try {
    const { error } = await supabase.from('player_map_stats').upsert({
      map_played_id: stats.map_played_id,
      player_id: stats.player_id,
      kills: Number(stats.kills) || 0,
      deaths: Number(stats.deaths) || 0,
      assists: Number(stats.assists) || 0, // Добавили ассисты
      hltv_rating: Number(stats.hltv_rating) || 0,
      adr: Number(stats.adr) || 0,         // Добавили ADR
      impact: Number(stats.impact) || 0,   // Добавили Impact
      hs_percent: Number(stats.hs_percent) || 0 // Добавили HS%
    }, {
      onConflict: 'map_played_id,player_id'
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Ошибка сохранения статы:", error);
    return false;
  }
};

export const deleteMatchMap = async (mapId: number) => {
  await supabase.from('match_maps_played').delete().eq('id', mapId);
};

// --- ПАРСЕР ---
export const fetchAndSaveTeamsFromAPI = async () => {
  try {
    const API_KEY = 'Fga12TTcwWPX8XnU1Toq8mfZ5dMKIi7cCHlPJaLr7iTX70pCMpU';
    const res = await fetch(`https://api.pandascore.co/csgo/tournaments?filter[tier]=s,a&per_page=3&sort=-begin_at`, { headers: { Authorization: `Bearer ${API_KEY}` } });
    const data = await res.json();
    let all: any[] = [];
    data.forEach((t: any) => { if (t.teams) all = [...all, ...t.teams]; });
    const unique = Array.from(new Map(all.map(item => [item.id, item])).values()).filter((t: any) => t.image_url);
    await supabase.from('teams').delete().neq('id', 0);
    await supabase.from('teams').insert(unique.map((team: any) => ({ name: team.name, logo_url: team.image_url })));
  } catch (e) { console.error(e); }
};