import * as React from 'react';
import { Select } from './Select';
import './BranchSelect.scss';
import { Maybe } from 'tsmonad';

export type BranchSelectProps = {
  editMode: boolean;
  branch: string;
  onChange: (question: string) => void;
  questions: Maybe<number[]>;
};

export const BranchSelect = (props: BranchSelectProps) => {

  const toOption = (text, value) => <option key={text} value={value}>{text}</option>;

  const defaultOption = toOption('None', '');

  return props.questions.caseOf({
    just: qs => <div className="branchSelect">
      <div className="label">Branch to question: </div>
      <div className="select">
        <Select
          editMode={props.editMode}
          value={props.branch}
          onChange={n => props.onChange(n)}>
          {[defaultOption].concat(qs.map(q => toOption(q, q)))}
        </Select>
      </div>
    </div>,
    nothing: () => null,
  });
};
