import * as Immutable from 'immutable';
import { Maybe } from 'tsmonad';
import { augment, ensureIdGuidPresent } from 'data/content/common';
import { ActivityReportTypes } from 'data/content/org/types';


export type ActivityReportParams = {
  id?: string,
  guid?: string,
  idref?: string,
  type?: Maybe<string>,
};

const defaultContent = {
  contentType: 'ActivityReport',
  elementType: 'activity_report',
  id: '',
  guid: '',
  idref: '',
  type: Maybe.just(ActivityReportTypes.LikertBar),
};

export class ActivityReport extends Immutable.Record(defaultContent) {
  contentType: 'ActivityReport';
  elementType: 'activity_report';
  id: string;
  guid: string;
  idref: string;
  type: Maybe<string>;

  constructor(params?: ActivityReportParams) {
    super(augment(params));
  }

  with(values: ActivityReportParams) {
    return this.merge(values) as this;
  }

  clone() : ActivityReport {
    return ensureIdGuidPresent(this);
  }

  static fromPersistence(root: Object, guid: string, notify: () => void) : ActivityReport {
    const t = (root as any).activity_report;

    let model = new ActivityReport({ id: guid, guid });

    if (t['@idref'] !== undefined) {
      model = model.with({ idref: t['@idref'] });
    }
    if (t['@type'] !== undefined) {
      model = model.with({ type: Maybe.just(t['@type']) });
    }

    return model;
  }

  toPersistence() : Object {
    const activityReport = {
      activity_report: {
        '@id': this.id,
        '@idref': this.idref,
      },
    };
    this.type.lift(t => activityReport.activity_report['@type'] = t);
    return activityReport;
  }
}
