import * as contentTypes from 'data/contentTypes';
import {
  AbstractContentEditor, AbstractContentEditorProps,
} from 'editors/content/common/AbstractContentEditor';
import { ToolbarGroup, ToolbarLayout } from 'components/toolbar/ContextAwareToolbar';
import { StyledComponentProps } from 'types/component';
import { styles } from 'editors/content/learning/ActivityReport.styles';
import { withStyles, classNames } from 'styles/jss';
import { CONTENT_COLORS } from '../utils/content';
import { ToolbarButton, ToolbarButtonSize } from 'components/toolbar/ToolbarButton';
import { SidebarContent } from 'components/sidebar/ContextAwareSidebar.controller';
import { SidebarGroup } from 'components/sidebar/ContextAwareSidebar';
import { Select } from '../common/Select';
import { ResourceState } from 'data/content/resource';
import { LegacyTypes } from 'data/types';
import { Maybe } from 'tsmonad';

export interface ActivityReportEditorProps extends
                AbstractContentEditorProps<contentTypes.ActivityReport> {
  onShowSidebar:() => void;
}

export interface ActivityReportEditorState {

}

// An activity report is a data report about a student's prior activity, e.g. their score on an
// assessment or their previous responses to a survey.
// Note that this current functionality only supports Surveys, so we will only expose that
// functionality to the user by naming it "Survey Report". In future iterations, we will rename
// it to "Activity Report".
class ActivityReportEditor
  extends AbstractContentEditor<contentTypes.ActivityReport,
  StyledComponentProps<ActivityReportEditorProps, typeof styles>, ActivityReportEditorState> {

  constructor(props) {
    super(props);

    this.onReferenceChange = this.onReferenceChange.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  shouldComponentUpdate(nextProps: ActivityReportEditorProps): boolean {
    return this.props.model !== nextProps.model;
  }

  // Reference to Survey (or other Activity) changes.
  onReferenceChange(idref): void {
    const model = this.props.model.with({ idref });
    this.props.onEdit(model, model);
  }

  // Calls .viewDocument instead of a direct link via href
  onClick(): void {
    this.props.services.viewDocument(
      this.props.model.idref,
      this.props.context.courseModel.idvers,
      Maybe.just(this.props.context.orgId),
    );
  }

  // Can change the Survey referenced by changing idref
  renderSidebar() {
    const resources = (type: LegacyTypes) => this.props.context.courseModel.resources
      .toArray()
      .filter(r => r.type === type && r.resourceState !== ResourceState.DELETED)
      .map(r => <option key={r.id} value={r.id}>{r.title}</option>);

    const feedbacks = resources(LegacyTypes.feedback);

    const idRefLabel = 'Survey'; // Future iteration: should support multiple activity types.
    const activitySelect = options => <SidebarGroup label={idRefLabel}>
      <Select
        editMode={this.props.editMode}
        value={this.props.model.idref}
        onChange={this.onReferenceChange}>
          {options}
      </Select>
    </SidebarGroup>;

    const title = 'Survey Report'; // Future iteration: 'Activity Report';
    return <SidebarContent title={title}>
      {activitySelect(feedbacks)}
    </SidebarContent>;
  }

  renderToolbar() {
    const { onShowSidebar } = this.props;
    return (
      <ToolbarGroup label="Report"
        highlightColor={CONTENT_COLORS.ActivityReport} columns={3}>

          <ToolbarLayout.Column>
            <ToolbarButton onClick={onShowSidebar} size={ToolbarButtonSize.Large}>
              <div><i className="fas fa-sliders-h" /></div>
              <div>Details</div>
            </ToolbarButton>
          </ToolbarLayout.Column>

      </ToolbarGroup>

    );
  }

  renderMain() {
    const { classes } = this.props;

    const resource = this.props.context.courseModel.resourcesById.get(this.props.model.idref);
    // KEVIN-1951 OOO should say "Report of: "

    const refTitleOrPlaceholder = resource !== undefined
      ? resource.title // Future: handle many activity types.
      : 'Loading...';

    const iconStyle = { color: CONTENT_COLORS.ActivityReport };

    const activityIcon = 'fas fa-clipboard-check';

    // KEVIN-1951 OOO should make new class*/}
    return (
      <div className={classNames(['ActivityReportEditor', classes.activityReport])}>
        <h5>
          <i className={activityIcon} style={iconStyle} />
          {' '}Survey Report{/* Future: Activity Report */}
        </h5>
        <div className={classes.padded}>
          A report for the survey{/* Future: handle many activity types */}:{' '}
          <a className="text-link"
            href="#" // the text-link style class is overridden w/o href
            onClick={(e) => {
              e.preventDefault();
              this.onClick();
            }}
            >{refTitleOrPlaceholder}
          </a>
        </div>
      </div>
    );
  }


}

const StyledActivityReportEditor =
  withStyles<ActivityReportEditorProps>(styles)(ActivityReportEditor);
export default StyledActivityReportEditor;
