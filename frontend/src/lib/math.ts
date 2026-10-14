/**
 * Pure deterministic supply chain mathematical models
 * Implemented strictly according to enterprise operations research standards
 * without LLM approximation.
 */

import { Asset } from '../types/asset';
import { AIMRMResult, HistoricalEpisode } from '../types/audit';

export const Z_ALPHA_95 = 1.645; // 95% Confidence Level for normal distribution

/**
 * 1. Dynamic Safe Stock (S_safe):
 *    S_safe = z_alpha * sigma_d * sqrt(L + 1)
 *    z_alpha = 1.645 (95% confidence level), L = 1.0 (lead time).
 *    If sigma_d <= 0, fallback to sigma_d = max(1.0, mu * 0.25).
 */
export function calculateSafeStock(
  stdDev: number,
  leadTime: number = 1.0,
  meanDemand: number = 10
): { safeStock: number; effectiveSigma: number } {
  let effectiveSigma = stdDev;
  if (!effectiveSigma || effectiveSigma <= 0) {
    effectiveSigma = Math.max(1.0, meanDemand * 0.25);
  }
  const L = leadTime > 0 ? leadTime : 1.0;
  const rawSafeStock = Z_ALPHA_95 * effectiveSigma * Math.sqrt(L + 1);
  return {
    safeStock: Math.ceil(rawSafeStock),
    effectiveSigma,
  };
}

/**
 * 2. Episodic Similarity Score:
 *    Similarity = 1 / (1 + (|Requested - Past| / max(1, Past)))
 *    Output is bounded in (0, 1]
 */
export function calculateEpisodicSimilarity(requested: number, past: number): number {
  const diff = Math.abs(requested - past);
  const denom = Math.max(1, past);
  const similarity = 1 / (1 + diff / denom);
  return Number(similarity.toFixed(4));
}

/**
 * 3. Statistical Anomaly Z-Score:
 *    Z = (Requested - mu) / max(0.5, sigma)
 *    Z > 2.0 triggers warning badge: BẤT THƯỜNG (>2σ)
 */
export function calculateZScore(
  requested: number,
  mean: number,
  stdDev: number
): number {
  const effectiveSigma = stdDev > 0 ? stdDev : Math.max(1.0, mean * 0.25);
  const denom = Math.max(0.5, effectiveSigma);
  const z = (requested - mean) / denom;
  return Number(z.toFixed(2));
}

/**
 * Full deterministic evaluation of an allocation request against an asset
 */
export function evaluateAIMRM(
  asset: Asset,
  requestedQuantity: number
): AIMRMResult {
  const mean = asset.meanMonthlyDemand || 10;
  const leadTime = asset.leadTimeWeeks || 1.0;
  const { safeStock, effectiveSigma } = calculateSafeStock(
    asset.stdDevDemand,
    leadTime,
    mean
  );
  const zScore = calculateZScore(requestedQuantity, mean, effectiveSigma);
  const projectedStock = asset.currentStock - requestedQuantity;
  const isAnomaly = zScore > 2.0;
  const isNegativeStock = requestedQuantity > asset.currentStock;
  const isBelowSafeStock = projectedStock < safeStock && !isNegativeStock;

  let status: AIMRMResult['status'] = 'RECOMMENDED_APPROVAL';
  let statusLabel = 'ĐỀ XUẤT DUYỆT';

  if (isNegativeStock) {
    status = 'REJECTED_OUT_OF_STOCK';
    statusLabel = 'TỪ CHỐI DO ÂM KHO';
  } else if (isAnomaly || isBelowSafeStock) {
    status = 'EXCEEDED_NORM_WARNING';
    statusLabel = isAnomaly
      ? 'CẢNH BÁO: BẤT THƯỜNG (>2σ)'
      : 'CẢNH BÁO: VƯỢT DƯỚI AN TOÀN';
  }

  return {
    safeStock,
    zScore,
    projectedStock,
    isAnomaly,
    isNegativeStock,
    isBelowSafeStock,
    status,
    statusLabel,
    confidenceScore: 0.95,
    formulaBreakdown: {
      zAlpha: Z_ALPHA_95,
      sigmaD: effectiveSigma,
      leadTime,
      meanDemand: mean,
      currentStock: asset.currentStock,
      requestedQuantity,
    },
  };
}

/**
 * Rank episodes by similarity to current request
 */
export function rankEpisodesBySimilarity(
  episodes: HistoricalEpisode[],
  assetId: string,
  requestedQuantity: number
): HistoricalEpisode[] {
  return episodes
    .filter((ep) => ep.assetId === assetId)
    .map((ep) => ({
      ...ep,
      similarityScore: calculateEpisodicSimilarity(requestedQuantity, ep.pastQuantity),
    }))
    .sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0))
    .slice(0, 3);
}
