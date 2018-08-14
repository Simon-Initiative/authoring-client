import { List } from 'immutable';
import { configuration } from 'actions/utils/config';
import { Variables } from 'data/content/assessment/variable';

const fetch = (window as any).fetch;

export type Evaluation = {
  variable: string;
  result: string;
  errored: boolean;
};

export function evaluate(variables: Variables, count: number = 1): Promise<List<Evaluation[]>> {

  // Issue a POST at the sandboxed expression-eval service
  const body = {
    vars: variables.toArray().map(v => ({
      variable: v.name,
      expression: v.expression,
    })),
    count,
  };

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  return fetch(configuration.protocol + configuration.hostname + '/sandbox/', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }).then(result => result.json())
    .then(json => List(json));
}

