/**
 * KairOS Monte Carlo Stochastic Disruption & Schedule Robustness Simulator
 * 
 * Simulates $N \ge 1,000$ stochastic disruption trials across:
 * - Meteorological shock (rain onset shifts)
 * - Vendor supplier tardiness and setup friction
 * - Guest transit & highway traffic congestion
 * 
 * Computes:
 * - Schedule Robustness Index ($\mathcal{R}_{\text{sched}} \in [0, 1]$)
 * - $P_{95}$ critical delay distribution
 * - Curfew and HACCP breach probabilities under uncertainty
 * - Mathematically recommended slack buffer (in minutes)
 * 
 * @module core/monte_carlo_engine
 */

import { EventConfig, TimelineMilestone, MonteCarloSimulationSummary, MonteCarloScenario } from './types';

/**
 * Pseudo-random Gaussian generator utilizing the Box-Muller transform.
 * 
 * @param mean - Mean parameter of normal distribution $\mu$.
 * @param stdev - Standard deviation parameter $\sigma$.
 * @param rng - Optional uniform PRNG returning $[0, 1)$.
 * @returns {number} Sample from $\mathcal{N}(\mu, \sigma^2)$ truncated to non-negative reals.
 */
export function randomGaussian(mean: number, stdev: number, rng: () => number = Math.random): number {
  const u = Math.max(1e-7, 1 - rng());
  const v = rng();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return Math.max(0, mean + z * stdev);
}

/**
 * Pseudo-random Exponential generator via inverse transform sampling.
 * 
 * @param rate - Rate parameter $\lambda > 0$.
 * @param rng - Optional uniform PRNG returning $[0, 1)$.
 * @returns {number} Sample from $\text{Exp}(\lambda)$.
 */
export function randomExponential(rate: number, rng: () => number = Math.random): number {
  return -Math.log(Math.max(1e-7, 1 - rng())) / rate;
}

/**
 * Executes a Monte Carlo stochastic perturbation simulation over the spatiotemporal schedule.
 * 
 * @param config - The event configuration with municipal and temporal boundaries.
 * @param milestones - The topologically ordered timeline milestones.
 * @param iterations - Total simulation trials to execute (default: 1,000).
 * @param rainProbability - Probability of outdoor weather disruption (default: 0.25).
 * @param vendorTardinessRisk - Probability of vendor delivery/setup tardiness (default: 0.20).
 * @param customRng - Optional deterministic PRNG function for test repeatability.
 * @returns {MonteCarloSimulationSummary} Comprehensive distribution metrics and robustness indices.
 * 
 * @complexity Time: $\mathcal{O}(N \cdot M)$ where $N$ is trial iterations and $M$ is milestone count.
 * @complexity Space: $\mathcal{O}(N)$ for critical delay distributions.
 */
export function runMonteCarloSimulation(
  config: EventConfig,
  milestones: TimelineMilestone[],
  iterations: number = 1000,
  rainProbability: number = 0.25,
  vendorTardinessRisk: number = 0.20,
  customRng?: () => number
): MonteCarloSimulationSummary {
  const rng = customRng || Math.random;
  const [startH, startM] = config.startTime.split(':').map(Number);
  const startMinutesFromMidnight = startH * 60 + startM;

  const [curfewH, curfewM] = config.municipalNoiseCurfewTime.split(':').map(Number);
  const curfewMinutesFromMidnight = curfewH * 60 + curfewM;

  const baseTotalDuration = Math.max(...milestones.map(m => m.earliestFinish), 0);
  const criticalMilestones = milestones.filter(m => m.isCritical);

  const scenarios: MonteCarloScenario[] = [];
  let curfewBreachesCount = 0;
  let haccpBreachesCount = 0;
  let totalCriticalDelaySum = 0;
  const criticalDelays: number[] = [];

  for (let i = 0; i < iterations; i++) {
    // 1. Weather shock: if rain occurs, add 15-45 min outdoor delay
    const hasRain = config.outdoorPortion && rng() < rainProbability;
    const rainDelay = hasRain ? Math.round(randomGaussian(25, 10, rng)) : 0;

    // 2. Vendor tardiness shock: setup or catering delivery delay
    const hasVendorDelay = rng() < vendorTardinessRisk;
    const vendorDelay = hasVendorDelay ? Math.round(randomExponential(1 / 20, rng)) : 0;

    // 3. Transit congestion shock: guest arrival delay
    const transitDelay = Math.round(randomGaussian(10, 5, rng));

    // Impact on critical path milestones
    let criticalDelay = 0;
    if (criticalMilestones.some(m => m.category === 'setup') && (rainDelay > 0 || vendorDelay > 0)) {
      criticalDelay += Math.max(rainDelay, vendorDelay);
    } else {
      criticalDelay += Math.round(vendorDelay * 0.6);
    }

    if (transitDelay > 15) {
      criticalDelay += Math.round((transitDelay - 15) * 0.5);
    }

    criticalDelays.push(criticalDelay);
    totalCriticalDelaySum += criticalDelay;

    // Evaluate curfew breach under perturbed schedule
    const perturbedEndMinutes = startMinutesFromMidnight + baseTotalDuration + criticalDelay;
    const curfewBreached = config.outdoorPortion && perturbedEndMinutes > curfewMinutesFromMidnight;
    if (curfewBreached) {curfewBreachesCount++;}

    // Evaluate HACCP thermal exposure breach
    let haccpBreached = false;
    milestones.forEach(m => {
      if (m.isTemperatureSensitive) {
        const perturbedDuration = m.durationMinutes + (m.isCritical ? criticalDelay : 0);
        if (perturbedDuration > 120) {
          haccpBreached = true;
        }
      }
    });
    if (haccpBreached) {haccpBreachesCount++;}

    // Retain first 20 scenarios for visual inspectability
    if (i < 20) {
      scenarios.push({
        scenarioId: `MC-SIM-${(i + 1).toString().padStart(4, '0')}`,
        iteration: i + 1,
        rainDelayMinutes: rainDelay,
        vendorTardinessMinutes: vendorDelay,
        transitTrafficMinutes: transitDelay,
        criticalPathDelay: criticalDelay,
        curfewBreached,
        haccpThermalBreached: haccpBreached,
      });
    }
  }

  // Statistical calculations
  criticalDelays.sort((a, b) => a - b);
  const meanCriticalDelay = Math.round(totalCriticalDelaySum / iterations);
  const p95Index = Math.floor(iterations * 0.95);
  const p95CriticalDelay = criticalDelays[p95Index] || 0;

  const curfewBreachProbability = Math.round((curfewBreachesCount / iterations) * 100) / 100;
  const thermalExposureProbability = Math.round((haccpBreachesCount / iterations) * 100) / 100;

  // Schedule Robustness Index (R_sched): Fraction of trials without fatal violations
  const fatalTrialCount = Math.max(curfewBreachesCount, haccpBreachesCount);
  const scheduleRobustnessIndex = Math.max(0, Math.round((1 - fatalTrialCount / iterations) * 100) / 100);

  // Recommended buffer slack is equal to P95 delay
  const recommendedSlackBufferMinutes = p95CriticalDelay;

  return {
    iterations,
    scheduleRobustnessIndex,
    meanCriticalDelayMinutes: meanCriticalDelay,
    p95CriticalDelayMinutes: p95CriticalDelay,
    curfewBreachProbability,
    thermalExposureProbability,
    scenarios,
    recommendedSlackBufferMinutes,
  };
}
