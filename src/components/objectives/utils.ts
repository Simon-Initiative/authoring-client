import { Maybe } from 'tsmonad';
import { LegacyTypes } from 'data/types';

export interface QuestionRef {
  key: string;
  id: string;
  title: Maybe<string>;
  type: string;
  assessmentType: LegacyTypes;
  assessmentId: string;
}

export const addPluralS = (string: string, itemCount: number) =>
itemCount === 1 ? string : `${string}s`;

export const getReadableTitleFromType = (type: string) => {
  switch (type) {
    case 'essay':
      return 'Essay';
    case 'short_answer':
      return 'Short Answer';
    case 'fill_in_the_blank':
      return 'Fill in the Blank';
    case 'image_hotspot':
      return 'Image Hotspot';
    case 'multiple_choice':
      return 'Multiple Choice';
    case 'numeric':
      return 'Numeric';
    case 'ordering':
      return 'Ordering';
    case 'question':
    default:
      return 'Question';
  }
};
