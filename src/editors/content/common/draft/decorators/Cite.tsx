import * as React from 'react';
import * as Immutable from 'immutable';
import { byType, Decorator } from './common';
import { EntityTypes } from '../../../../../data/content/learning/common';
import { Cite as CiteData } from 'data/content/learning/cite';
import { connect, Dispatch } from 'react-redux';
import { State } from 'reducers';

import './styles.scss';



class Cite extends React.Component<{ orderedIds, entityKey, offsetKey, contentState }, any> {

  constructor(props) {
    super(props);
  }

  render(): JSX.Element {
    const data = this.props.contentState.getEntity(this.props.entityKey).getData();

    const entry = (data as CiteData).entry;
    let position = this.props.orderedIds.has(entry)
      ? this.props.orderedIds.get(entry) + 1
      : '  ';
    if ((position + '').length === 1) {
      position = ' ' + position;
    }
    const cite = <span className="cite">{position}</span>;

    return (
      <span data-offset-key={this.props.offsetKey}>{cite}</span>
    );
  }
}


interface StateProps {
  orderedIds: Immutable.Map<string, number>;
}

interface DispatchProps {

}

interface OwnProps { }

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {

  const { orderedIds } = state;

  return {
    orderedIds,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<State>, ownProps: OwnProps): DispatchProps => {
  return {};
};

const CiteController = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(Cite);

export default function (props: Object): Decorator {
  return {
    strategy: byType.bind(undefined, EntityTypes.cite),
    component: CiteController,
    props,
  };
}


