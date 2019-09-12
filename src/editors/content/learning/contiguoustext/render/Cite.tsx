import * as React from 'react';
import * as Immutable from 'immutable';
import { Cite as CiteData } from 'data/content/learning/cite';
import { connect } from 'react-redux';
import { InlineDisplayProps } from './common';

import './styles.scss';

interface CiteProps extends InlineDisplayProps {
  orderedIds: Immutable.Map<string, number>;
  isSelected: boolean;
}

interface CiteState {

}

class CiteDisplay extends React.PureComponent<CiteProps, CiteState> {

  constructor(props) {
    super(props);
  }

  render(): JSX.Element {

    const { children, orderedIds, attrs, onClick, isSelected } = this.props;

    const data = this.props.node.data.get('value') as CiteData;
    const entry = data.entry;

    let toDisplay = (
      <span
        {...attrs}
        onClick={onClick}
        className="oli-cite">
        {children}
      </span>
    );

    if (entry !== '') {

      let position = orderedIds !== undefined && orderedIds.has(entry)
        ? orderedIds.get(entry) + 1
        : '  ';
      if ((position + '').length === 1) {
        position = ' ' + position;
      }

      const cls = isSelected
        ? 'oli-cite-entry-active'
        : 'oli-cite-entry';

      toDisplay = (
        <span
          {...attrs}
          onClick={onClick}
          className={cls}>
          {position}
        </span>
      );
    }

    return toDisplay;
  }
}


interface StateProps {
  orderedIds: Immutable.Map<string, number>;
  isSelected: boolean;
}

interface DispatchProps {

}

interface OwnProps extends InlineDisplayProps {

}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {

  const isSelected = state.activeContext.activeInline.caseOf({
    just: i => i.key === ownProps.node.key,
    nothing: () => false,
  });
  return {
    orderedIds: state.orderedIds,
    isSelected,
  };
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {};
};

export const controller = connect<StateProps, DispatchProps, OwnProps>
  (mapStateToProps, mapDispatchToProps)(CiteDisplay);

export { controller as CiteDisplay };
