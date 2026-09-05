/**
 * Génère un numéro de commande au format SEN-YYYY-XXXXXX.
 * `sequence` doit provenir d'un compteur atomique côté base de données
 * (ex: séquence PostgreSQL par année) pour garantir l'unicité — ne jamais
 * utiliser Math.random() ou un timestamp seul en production.
 */
export function formatOrderNumber(year: number, sequence: number): string {
  const paddedSequence = String(sequence).padStart(6, "0");
  return `SEN-${year}-${paddedSequence}`;
}
