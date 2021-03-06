import * as Immutable from 'immutable';
import * as contentTypes from '../contentTypes';
import createGuid from '../../utils/guid';
import { getKey } from '../common';
import { LegacyTypes } from '../types';
import { Maybe } from 'tsmonad';
import { isArray } from 'util';
import { augment, ensureIdGuidPresent } from 'data/content/common';
import { Asset } from 'data/content/embedactivity/asset';
import {
  renderLayoutHtml, renderDefaultStylesCss, renderDefaultControlsHtml,
  renderQuestionsXml, renderSolutionsXml, EXAMPLE_PROMPT_HTML, EXAMPLE_CODE,
  createExampleQuestion, createExampleSolution,
} from 'editors/content/learning/repl/repl_assets';
import { caseOf } from 'utils/utils';

export enum ActivityType {
  REPL = 'REPL',
}

// oli_feedback_1_2.dtd
export type EmbedActivityModelParams = {
  resource?: contentTypes.Resource,
  guid?: string,
  type?: LegacyTypes.embed_activity,
  lock?: contentTypes.Lock,
  id?: string,
  width?: Maybe<string>,
  height?: Maybe<string>,
  maxAttempts?: Maybe<string>,
  activityType?: Maybe<string>,
  title?: string,
  source?: string,
  assets?: Immutable.List<Asset>,
};

const defaultEmbedActivityModelParams = {
  modelType: 'EmbedActivityModel',
  resource: new contentTypes.Resource(),
  guid: '',
  type: LegacyTypes.embed_activity,
  lock: new contentTypes.Lock(),
  id: '',
  width: Maybe.nothing<string>(),
  height: Maybe.nothing<string>(),
  maxAttempts: Maybe.nothing<string>(),
  activityType: Maybe.nothing<string>(),
  title: 'New REPL Activity',
  source: '',
  assets: Immutable.List<Asset>(),
};

export class EmbedActivityModel extends Immutable.Record(defaultEmbedActivityModelParams) {
  modelType: 'EmbedActivityModel';
  resource: contentTypes.Resource;
  guid: string;
  type: LegacyTypes.embed_activity;
  lock: contentTypes.Lock;
  id: string;
  width: Maybe<string>;
  height: Maybe<string>;
  maxAttempts: Maybe<string>;
  activityType: Maybe<string>;
  title: string;
  source: string;
  assets: Immutable.List<Asset>;

  constructor(params?: EmbedActivityModelParams) {
    super(augment(params));
  }

  with(values: EmbedActivityModelParams): EmbedActivityModel {
    return this.merge(values) as this;
  }

  clone(): EmbedActivityModel {
    return ensureIdGuidPresent(this.with({
      assets: this.assets.map(asset => asset.clone()).toList(),
    }));
  }

  static createNew(id: string, title?: string, activityType?: ActivityType) {
    return caseOf<EmbedActivityModel>(activityType)({
      [ActivityType.REPL]: new EmbedActivityModel({
        id,
        title: title || 'New REPL Activity',
        activityType: Maybe.just('REPL'),
        width: Maybe.just('670'),
        height: Maybe.just('600'),
        source: 'webcontent/repl/repl.js',
        assets: Immutable.List([
          new contentTypes.Asset({
            name: 'layout',
            src: `webcontent/repl/${id}/layout.html`,
            content: Maybe.just(renderLayoutHtml({
              prompt: EXAMPLE_PROMPT_HTML,
              showCodeEditor: true,
              isGraded: true,
            })),
          }),
          new contentTypes.Asset({
            name: 'emstyles',
            src: 'webcontent/repl/emstyles.css',
            content: Maybe.just(renderDefaultStylesCss()),
          }),
          new contentTypes.Asset({
            name: 'controls',
            src: 'webcontent/repl/controls.html',
            content: Maybe.just(renderDefaultControlsHtml()),
          }),
          new contentTypes.Asset({
            name: 'questions',
            src: `webcontent/repl/${id}/questions.xml`,
            content: Maybe.just(renderQuestionsXml({
              questions: [createExampleQuestion()],
            })),
          }),
          new contentTypes.Asset({
            name: 'solutions',
            src: `webcontent/repl/${id}/solutions.xml`,
            content: Maybe.just(renderSolutionsXml({
              solutions: [createExampleSolution()],
            })),
          }),
        ]),
      }),
    })(new EmbedActivityModel());
  }

  static fromPersistence(json: any, notify: () => void = () => null): EmbedActivityModel {

    let model = new EmbedActivityModel();

    const o = (json as any);
    model = model.with({ resource: contentTypes.Resource.fromPersistence(o) });
    model = model.with({ guid: o.guid });
    model = model.with({ type: o.type });
    if (o.lock !== undefined && o.lock !== null) {
      model = model.with({ lock: contentTypes.Lock.fromPersistence(o.lock) });
    }

    let embedActivity = null;
    if (isArray(o.doc)) {
      embedActivity = o.doc[0].embed_activity;
    } else {
      embedActivity = o.doc.embed_activity;
    }

    model = model.with({ id: embedActivity['@id'] });
    model = model.with({ width: Maybe.maybe<string>(embedActivity['@width']) });
    model = model.with({ height: Maybe.maybe<string>(embedActivity['@height']) });
    model = model.with({ maxAttempts: Maybe.maybe<string>(embedActivity['@max_attempts']) });
    model = model.with({ activityType: Maybe.maybe<string>(embedActivity['@activity_type']) });

    embedActivity['#array'].forEach((item) => {

      const key = getKey(item);
      const id = createGuid();

      switch (key) {
        case 'title':
          model = model.with({ title: item['title']['#text'] });
          break;
        case 'source':
          model = model.with({ source: item['source']['#text'] });
          break;
        case 'assets':
          model = model.with({ assets: item['assets']['#array'].map(asset =>
            Asset.fromPersistence(asset, id, notify)) });
          break;
        default:
          break;
      }
    });

    return model;
  }

  toPersistence(): Object {

    const children = [
      {
        title: {
          '#text': this.title,
        },
      },
      {
        source: {
          '#text': this.source,
        },
      },
      {
        assets: {
          '#array': this.assets.map(a => a.toPersistence()).toArray(),
        },
      },
    ];

    const doc = [{
      embed_activity: {
        '@id': this.id ? this.id : createGuid(),
        ...this.height.caseOf({
          just: height => ({ '@height': height }),
          nothing: () => ({}),
        }),
        ...this.width.caseOf({
          just: width => ({ '@width': width }),
          nothing: () => ({}),
        }),
        ...this.maxAttempts.caseOf({
          just: maxAttempts => ({ '@max_attempts': maxAttempts }),
          nothing: () => ({}),
        }),
        ...this.activityType.caseOf({
          just: activityType => ({ '@activity_type': activityType }),
          nothing: () => ({}),
        }),
        '#array': children,
      },
    }];

    const root = {
      doc,
    };

    return Object.assign({}, this.resource, root, this.lock.toPersistence());
  }
}
