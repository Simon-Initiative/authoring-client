import { Map } from 'immutable';
import { Maybe } from 'tsmonad';
import { LegacyTypes } from 'data/types';

export interface PoolInfo {
  questionCount?: number;
  count?: number;
  exhaustion?: string;
  strategy?: string;
}

export interface QuestionRef {
  key: string;
  id: string;
  title: Maybe<string>;
  type: string;
  assessmentType: LegacyTypes;
  assessmentId: string;
  poolInfo: Maybe<PoolInfo>;
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

const numPoolQuestionsWithSkill = (skillQuestionRefs: QuestionRef[], poolAssessmentId: string) =>
  skillQuestionRefs.filter(r =>
    r.assessmentType === LegacyTypes.assessment2_pool
    && r.assessmentId === poolAssessmentId,
  ).length;

const numPoolQuestionsWithoutSkill = (
  skillQuestionRefs: QuestionRef[],
  questionCount: number,
  poolAssessmentId: string,
) => questionCount - numPoolQuestionsWithSkill(skillQuestionRefs, poolAssessmentId);

// Guaranteed pool question count = SUM g(x) for all x e {...pools} where
// g(x) = MIN( MAX(count - numDontHaveSkill(x), 0), numHaveSkill(x))
const guaranteedPoolQuestionCountMap = (skillQuestionRefs: QuestionRef[]) =>
  skillQuestionRefs
    .filter(ref => ref.assessmentType === LegacyTypes.assessment2_pool)
    .reduce(
      (acc, poolRef) => poolRef.poolInfo.caseOf({
        just: poolInfo => acc.has(poolRef.assessmentId)
          // if we already calculated the guaranteed number for this pool,
          // just return the map. A repeat calculation will result in the same value
          ? acc
          // if we havent, perform the calculation and store in the map
          : acc.set(
            poolRef.assessmentId,
            Math.min(
              Math.max(
                poolInfo.count - numPoolQuestionsWithoutSkill(
                  skillQuestionRefs,
                  poolInfo.questionCount, poolRef.assessmentId),
                0,
              ),
              numPoolQuestionsWithSkill(skillQuestionRefs, poolRef.assessmentId),
            ),
          ),
        nothing: () => acc,
      }),
      Map<string, number>(),
    );

const guaranteedPoolQuestionCount = (skillQuestionRefs: QuestionRef[]) =>
  guaranteedPoolQuestionCountMap(skillQuestionRefs).reduce(
    (sum, val) => sum + val,
    0,
  );

export const calculateGuaranteedSummativeCount = (
  skillQuestionRefs: QuestionRef[], summativeCount: number,
) => guaranteedPoolQuestionCount(skillQuestionRefs) + summativeCount;
