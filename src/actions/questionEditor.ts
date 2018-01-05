export type TOGGLE_ADV_SCORING = 'questionEditor/TOGGLE_SCORING';
export const TOGGLE_ADV_SCORING: TOGGLE_ADV_SCORING = 'questionEditor/TOGGLE_SCORING';

export type ToggleAdvancedScoring = {
  type: TOGGLE_ADV_SCORING,
  id: string,
  value: boolean,
};

/**
 * Toggle advanced scoring options for the question with given id.
 * Set to a specified value if provided.
 */
export const toggleAdvancedScoring = (id: string, value?: boolean): ToggleAdvancedScoring => ({
  type: TOGGLE_ADV_SCORING,
  id,
  value,
});
