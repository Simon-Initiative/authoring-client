import { List, Map } from 'immutable';
import { Maybe } from 'tsmonad';

export enum Status {
  Pass,
  Fail,
}

export enum RequirementType {
  Can = 'can',
  Should = 'should',
  Must = 'must',
}

export interface ModelCheckerRule<T, K> {
  id: string;
  name: string;
  requirementType: RequirementType;
  requirement: string;
  isIssue: (data: T, aux?: K) => boolean;
}

export interface ModelCheckerResult<T, K> {
  rule: ModelCheckerRule<T, K>;
  description: string;
}

export interface ModelCheckerResults<T, K> {
  results: List<ModelCheckerResult<T, K>>;
  issues: Map<string, ModelCheckerResult<T, K>>;
  hasIssue: (id: string) => boolean;
  getIssue: (id: string) => Maybe<ModelCheckerResult<T, K>>;
}

export function checkModel<T, K>(
  data: T, rules: ModelCheckerRule<T, K>[], aux?: K): ModelCheckerResults<T, K> {
  const results = rules.reduce(
    (acc: ModelCheckerResults<T, K>, rule) => {
      const isIssue = rule.isIssue(data, aux);
      const result = {
        rule,
        description: isIssue
          ? `${rule.name} ${rule.requirementType} ${rule.requirement}`
          : '',
      };

      return {
        results: acc.results.push(result),
        issues: isIssue ? acc.issues.set(rule.id, result) : acc.issues,
      };
    },
    {
      results: List<ModelCheckerResult<T, K>>(),
      issues: Map<string, ModelCheckerResult<T, K>>(),
    },
  );

  return {
    results: results.results,
    issues: results.issues,
    hasIssue: (id: string) => results.issues.has(id),
    getIssue: (id: string) => results.issues.has(id)
      ? Maybe.just(results.issues.get(id))
      : Maybe.nothing(),
  };
}
