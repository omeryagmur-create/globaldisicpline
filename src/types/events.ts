export type RealtimeEvent =
    | { type: 'FocusSessionStart', payload: { sessionId: string, duration: number, subject?: string } }
    | { type: 'FocusSessionEnd', payload: { sessionId: string, success: boolean, xpEarned: number } }
    | { type: 'XPUpdated', payload: { totalXp: number, change: number, reason: string } }
    | { type: 'RestrictionTriggered', payload: { reason: string, severity: 'low' | 'medium' | 'high' | 'extreme', feature?: string } }
    | { type: 'RankChanged', payload: { oldRank: string, newRank: string } }
    | { type: 'LeaguePromotion', payload: { league: string } }
    | { type: 'LeagueDemotion', payload: { league: string } };

export interface EventBus {
    publish: (event: RealtimeEvent) => Promise<void>;
    subscribe: (callback: (event: RealtimeEvent) => void) => () => void;
}
