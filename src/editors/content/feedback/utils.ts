import * as Immutable from 'immutable';
import guid from 'utils/guid';
import { LikertLabel } from 'data/content/feedback/likert_label';
import { TEXT_ELEMENTS, ContentElements } from 'data/content/common/elements';
import { LikertScale } from 'data/content/feedback/likert_scale';
import { ContentElement } from 'data/content/common/interfaces';

export function onEditScaleSize(
  scaleSize: string, scale: LikertScale,
  onEditScale: (scale: LikertScale, src: ContentElement) => void) {

  const newSize = Number.parseInt(scaleSize);
  const oldSize = Number.parseInt(scale.scaleSize);

  // A scale's labels have a `value` attribute which corresponds to its position.
  // Whenever we change the scale size, we need to relabel the labels with
  // new values, keeping in mine they're 1-indexed
  const labelsWithIncorrectValues = newSize > oldSize
    ? scale.labels.concat(newLabels(newSize - oldSize))
    : scale.labels.take(newSize);
  const labels = Immutable.OrderedMap<string, LikertLabel>(
    labelsWithIncorrectValues.toArray()
      .map((label, i) => label.with({ value: (i + 1).toString() }))
      .map(label => [label.guid, label]),
  );

  onEditScale(
    scale.with({
      scaleSize,
      scaleCenter: String(Math.ceil(newSize / 2)),
      labels,
    }),
    scale);
}

function newLabels(size: number): Immutable.OrderedMap<string, LikertLabel> {
  const label = (i: number) => new LikertLabel({
    text: ContentElements.fromText('Scale Label', guid(), TEXT_ELEMENTS),
    value: i.toString(),
  });
  const labels: LikertLabel[] = [];
  // values are 1-indexed!
  for (let i = 1; i <= size; i += 1) {
    labels.push(label(i));
  }
  return Immutable.OrderedMap<string, LikertLabel>(labels.map(label => [label.guid, label]));
}

