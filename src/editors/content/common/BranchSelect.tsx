import * as React from 'react';
import { Select } from './Select';
import './BranchSelect.scss';

export type BranchSelectProps = {
  editMode: boolean;
  onChange: (question: string) => void;
  questions: number[];
  value: string
};

export const BranchSelect = (props: BranchSelectProps) => {

  const opts = props.questions.map(
    q => <option key={q} value={q}>{q}</option>);

  return (
    <div className="branchSelect">
      <div className="label">Branch to question: </div>
      <div className="select">
        <Select
          editMode={props.editMode}
          value={props.value}
          onChange={n => props.onChange(n)}>
          {opts}
        </Select>
      </div>
    </div>
  );
};
