import type { Meeting, IRankingStrategy } from "../domain";
export class OlympicAverageStrategy implements IRankingStrategy {
    
    public calculateRanking(meetings: Meeting[]): Meeting[] {
        console.log("Calculando o ranking com a 'Estratégia Olímpica de Sinergia'...");
        
        const meetingsWithOlympicAverage = meetings.map(meeting => {
            if (meeting.vote_count < 3) {
                return meeting; 
            }

            const simulatedScore = meeting.total_score - 10 - 0;
            const simulatedCount = meeting.vote_count - 2;
            
            const olympicAverage = (simulatedCount > 0) 
                ? (simulatedScore / simulatedCount) 
                : meeting.average;

            return {
                ...meeting,
                average: olympicAverage 
            };
        });

        return meetingsWithOlympicAverage.sort((a, b) => b.average - a.average);
    }
}