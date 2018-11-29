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
  const toOption = (text, value) => <option key={text} value={value}>{text}</option>;

  const defaultOption = toOption('None', '');

  const opts = [defaultOption].concat(props.questions.map(q => toOption(q, q)));

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
