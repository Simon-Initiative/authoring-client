import * as React from 'react';
import { Select } from './Select';
import { Maybe } from 'tsmonad';
import './BranchSelect.scss';

interface SharedBranchSelectProps {
  editMode: boolean;
  branch: string;
  onChange: (question: string) => void;
}

interface BranchSelectProps extends SharedBranchSelectProps {
  questions: number[];
}

interface ConditionalBranchSelectProps extends SharedBranchSelectProps {
  questions: Maybe<number[]>;
}

export const ConditionalBranchSelect = (props: ConditionalBranchSelectProps) => {
  return props.questions.caseOf({
    just: qs => <BranchSelect {...props} questions={qs} />,
    nothing: () => null,
  });
};

export const BranchSelect = (props: BranchSelectProps) => {

  const toOption = (text, value) => <option key={text} value={value}>{text}</option>;

  const defaultOption = toOption('None', '');

  return <div className="branchSelect">
    <div className="label">Branch to question: </div>
    <div className="select">
      <Select
        editMode={props.editMode}
        value={props.branch}
        onChange={n => props.onChange(n)}>
        {[defaultOption].concat(props.questions.map(q => toOption(q, q)))}
      </Select>
    </div>
  </div>;
};
