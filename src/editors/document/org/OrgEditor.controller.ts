import { connect } from 'react-redux';
import OrgEditor from './OrgEditor';
import { AbstractEditorProps } from '../common/AbstractEditor';
import { OrganizationModel } from 'data/models';

interface StateProps {

}

interface DispatchProps {

}

interface OwnProps extends AbstractEditorProps<OrganizationModel> {}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch): DispatchProps => {
  return {};
};

const connected = connect<StateProps, DispatchProps, OwnProps>
(mapStateToProps, mapDispatchToProps)(OrgEditor);

export default connected ;
