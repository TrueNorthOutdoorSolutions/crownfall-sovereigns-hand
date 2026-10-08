/** Printing metadata never enters match state or rules evaluation. */
export type CollectorTreatment = 'STANDARD' | 'RADIANT' | 'ASCENDED' | 'SOVEREIGN';
export interface CardPrinting {
  printingId: string;
  gameplayCardId: string;
  rulesVersion: string;
  setId: string;
  collectorNumber: string;
  edition: string;
  treatment: CollectorTreatment;
  artworkVariantId: string;
  foil: 'none' | 'foil' | 'etched';
  serialization?: string;
}
export const prototypePrinting = (gameplayCardId: string, collectorNumber: string): CardPrinting => ({
  printingId: `test-set-001:${gameplayCardId}:standard`, gameplayCardId,
  rulesVersion: '0.1', setId: 'test-set-001', collectorNumber, edition: 'Playtest',
  treatment: 'STANDARD', artworkVariantId: 'symbol-placeholder', foil: 'none',
});
