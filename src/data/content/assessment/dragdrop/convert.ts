import * as Immutable from 'immutable';
import { LegacyLayout } from './legacyLayout/legacy_layout';
import { TableTargetArea } from './htmlLayout/table/table_targetarea';
import { HTMLLayout } from 'data/content/assessment/dragdrop/htmlLayout/html_layout';
import { Row } from 'data/content/assessment/dragdrop/htmlLayout/table/row';
import { Maybe } from 'tsmonad';
import { Cell } from 'data/content/assessment/dragdrop/htmlLayout/table/cell';
import { Initiator } from 'data/content/assessment/dragdrop/htmlLayout/initiator';

export const convertLegacyToHtmlTable = (legacyLayout: LegacyLayout) => {
  return new HTMLLayout().with({
    initiators: legacyLayout.initiatorGroup.initiators.map(initiator =>
      new Initiator().with({
        inputVal: initiator.assessmentId,
        text: initiator.text,
      }),
    ).toList(),
    targetArea: Maybe.just(new TableTargetArea().with({
      rows: legacyLayout.targetGroup.rows.map(row =>
        new Row().with({
          cells: Immutable.List<Cell>(row.cols.toArray().map(col =>
            col.contentType === 'Target'
            ? (
              new Cell().with({
                target: Maybe.just(col.assessmentId),
              })
            )
            : (
              new Cell().with({
                text: col.text,
                target: Maybe.nothing(),
              })
            ),
          )),
        }),
      ).toList(),
    })),
  });
};
