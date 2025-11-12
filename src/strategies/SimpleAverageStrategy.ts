import type { Meeting, IRankingStrategy } from "../domain";
export class SimpleAverageStrategy implements IRankingStrategy {
    
    public calculateRanking(meetings: Meeting[]): Meeting[] {
        console.log("Calculando o ranking com a 'Estratégia de Média Simples'...");
        return [...meetings].sort((a, b) => b.average - a.average);
    }
}