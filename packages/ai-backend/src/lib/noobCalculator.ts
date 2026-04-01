import type { ConversationAnswers } from '../types.js';

/**
 * Calculate a "noob score" from 1-10 based on conversation answers.
 *
 * Score interpretation:
 *   1-3: beginner — needs managed services, guided setup, minimal config
 *   4-6: intermediate — comfortable with some complexity, can handle moderate setup
 *   7-10: advanced — can handle raw infrastructure, complex configurations
 *
 * Algorithm weights:
 *   - Self-reported experience: 40%
 *   - Technical language complexity: 30%
 *   - Breadth of modality requests: 30%
 */
export function calculateNoobScore(answers: ConversationAnswers): number {
  const { selfReportedExperience, technicalLanguageComplexity, modalityBreadth } = answers;

  // Clamp all inputs to 1-10
  const clamp = (val: number): number => Math.max(1, Math.min(10, Math.round(val)));

  const experience = clamp(selfReportedExperience);
  const languageScore = clamp(technicalLanguageComplexity);
  const breadthScore = clamp(modalityBreadth);

  // Weighted average
  const raw = experience * 0.4 + languageScore * 0.3 + breadthScore * 0.3;

  // Round and clamp final result
  return clamp(Math.round(raw));
}

/**
 * Analyze user message text to estimate technical language complexity.
 * Returns a score from 1-10.
 */
export function analyzeLanguageComplexity(messages: string[]): number {
  const technicalTerms = [
    'api', 'rest', 'graphql', 'docker', 'kubernetes', 'k8s', 'ci/cd',
    'microservices', 'serverless', 'lambda', 'cdn', 'dns', 'ssl', 'tls',
    'oauth', 'jwt', 'websocket', 'grpc', 'terraform', 'nginx', 'redis',
    'postgresql', 'mongodb', 'elasticsearch', 'kafka', 'rabbitmq',
    'load balancer', 'reverse proxy', 'container', 'orchestration',
    'deployment', 'pipeline', 'repository', 'git', 'ssh', 'vpc',
    'subnet', 'firewall', 'ingress', 'egress', 'helm', 'yaml',
    'environment variable', 'env var', 'cli', 'sdk', 'webhook',
    'cron', 'daemon', 'process', 'thread', 'async', 'await',
    'typescript', 'node', 'react', 'vue', 'angular', 'svelte',
    'next.js', 'nuxt', 'express', 'fastify', 'prisma', 'drizzle',
  ];

  const allText = messages.join(' ').toLowerCase();
  const matchCount = technicalTerms.filter((term) => allText.includes(term)).length;

  // Scale: 0 matches = 1, 20+ matches = 10
  if (matchCount === 0) return 1;
  if (matchCount <= 2) return 2;
  if (matchCount <= 4) return 3;
  if (matchCount <= 6) return 4;
  if (matchCount <= 8) return 5;
  if (matchCount <= 10) return 6;
  if (matchCount <= 13) return 7;
  if (matchCount <= 16) return 8;
  if (matchCount <= 20) return 9;
  return 10;
}

/**
 * Estimate modality breadth from the list of requested modalities.
 * Returns a score from 1-10.
 */
export function analyzeModalityBreadth(modalities: string[]): number {
  const count = modalities.length;
  if (count <= 1) return 1;
  if (count === 2) return 3;
  if (count === 3) return 4;
  if (count === 4) return 5;
  if (count === 5) return 6;
  if (count === 6) return 7;
  if (count === 7) return 8;
  if (count >= 8) return 10;
  return 5;
}
