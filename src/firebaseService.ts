import { firebaseConfig } from './firebaseConfig.js';
import type { FirebaseData, LocalVotes } from './domain.ts';
declare const firebase: any;

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const VOTOS_KEY = 'meusVotosDasMeetings';

export const firebaseService = {

    addMeeting: (meetingName: string): Promise<void> => {
        if (!meetingName) return Promise.reject(new Error('Nome da meeting está vazio'));

        return database.ref('meetings').push({
            name: meetingName,
            total_score: 0,
            vote_count: 0
        });
    },

    submitVote: (
        meetingId: string,
        currentTotalScore: number,
        currentVoteCount: number,
        nota: number
    ): Promise<void> => {
        const meusVotos: LocalVotes = JSON.parse(localStorage.getItem(VOTOS_KEY) || '{}');
        if (meusVotos[meetingId]) {
            alert('Você já votou nesta meeting!');
            return Promise.reject(new Error('Voto duplicado'));
        }

        meusVotos[meetingId] = true;
        localStorage.setItem(VOTOS_KEY, JSON.stringify(meusVotos));

        const meetingRef = database.ref('meetings/' + meetingId);
        const newTotalScore = currentTotalScore + nota;
        const newVoteCount = currentVoteCount + 1;

        return meetingRef.update({
            total_score: newTotalScore,
            vote_count: newVoteCount
        }).catch((error: Error) => {
            console.error("Erro ao votar: ", error);
            delete meusVotos[meetingId];
            localStorage.setItem(VOTOS_KEY, JSON.stringify(meusVotos));
            throw error;
        });
    },

    onDataChange: (callback: (data: FirebaseData, votes: LocalVotes) => void): void => {
        database.ref().on('value', (snapshot: any) => {
            const data: FirebaseData = snapshot.val();
            const meusVotos: LocalVotes = JSON.parse(localStorage.getItem(VOTOS_KEY) || '{}');
            callback(data, meusVotos);
        });
    },

    setVotingStatus: (isOpen: boolean): Promise<void> => {
        return database.ref('settings').update({
            isVotingOpen: isOpen
        });
    },
    setRankingAlgorithm: (algorithmKey: string): Promise<void> => {
        return database.ref('settings').update({
            rankingAlgorithm: algorithmKey
        });
    }
};