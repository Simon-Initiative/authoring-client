import { Map } from 'immutable';
import { LegacyTypes, ResourceId } from 'data/types';
import { QuestionRef } from 'types/questionRef';

export const addPluralS = (string: string, itemCount: number) =>
  itemCount === 1 ? string : `${string}s`;

const numPoolQuestionsWithSkill =
  (skillQuestionRefs: QuestionRef[], poolAssessmentId: ResourceId) =>
    skillQuestionRefs.filter(r =>
      r.assessmentType === LegacyTypes.assessment2_pool
      && r.assessmentId.eq(poolAssessmentId),
    ).length;

const numPoolQuestionsWithoutSkill = (
  skillQuestionRefs: QuestionRef[],
  questionCount: number,
  poolAssessmentId: ResourceId,
) => questionCount - numPoolQuestionsWithSkill(skillQuestionRefs, poolAssessmentId);

// Guaranteed pool question count = SUM g(x) for all x e {...pools} where
// g(x) = MIN( MAX(count - numDontHaveSkill(x), 0), numHaveSkill(x))
const guaranteedPoolQuestionCountMap = (skillQuestionRefs: QuestionRef[]): Map<string, number> =>
  skillQuestionRefs
    // filter out anything that is not a question pool
    .filter(ref => ref.assessmentType === LegacyTypes.assessment2_pool)
    // reduce a map of guaranteed pool question counts, memoize results to improve performance
    .reduce(
      (acc, poolRef) => poolRef.poolInfo.caseOf({
        just: poolInfo => acc.has(poolRef.assessmentId.value())
          // if we already calculated the guaranteed number for this pool,
          // just return the map. A repeat calculation will result in the same value
          ? acc
          // if we havent, perform the calculation and store in the map
          : acc.set(
            poolRef.assessmentId.value(),
            poolInfo.count === '*'
              ? numPoolQuestionsWithSkill(skillQuestionRefs, poolRef.assessmentId)
              : Math.min(
                Math.max(
                  (Number(poolInfo.count) || 0) - numPoolQuestionsWithoutSkill(
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
