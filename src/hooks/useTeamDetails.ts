import { useState, useEffect, useCallback } from 'react';
import { fetchTeamDetails, TeamDetails } from '../services/api';

export const useTeamDetails = (teamId: number) => {
    const [team, setTeam] = useState<TeamDetails | null>(null);
    const [loading, setLoading] = useState(true);

    const loadTeam = useCallback(async () => {
        setLoading(true);
        const data = await fetchTeamDetails(teamId);
        setTeam(data);
        setLoading(false);
    }, [teamId]);

    useEffect(() => {
        loadTeam();
    }, [loadTeam]);

    return { team, loading };
};