import type { IRankingStrategy } from "../domain";
import { SimpleAverageStrategy } from "../strategies/SimpleAverageStrategy";
import { OlympicAverageStrategy } from "../strategies/OlympicAverageStrategy";

export type StrategyKey = "simple" | "olympic" | string;

export class RankingStrategyFactory {
    
    private static strategies = {
        simple: new SimpleAverageStrategy(),
        olympic: new OlympicAverageStrategy(),
    };

    public static create(key: StrategyKey): IRankingStrategy {
        const strategy = this.strategies[key as keyof typeof this.strategies];

        if (!strategy) {
            console.warn(`Estratégia desconhecida: '${key}'. Usando 'simple' como fallback.`);
            return this.strategies.simple;
        }

        return strategy;
    }
}