import * as React from 'react';
import { StyledComponentProps } from 'types/component';
import { injectSheet, classNames } from 'styles/jss';
import * as persistence from 'data/persistence';
import * as models from 'data/models';
import guid from 'utils/guid';
import { Button } from 'editors/content/common/Button';
import * as Immutable from 'immutable';

import styles from './SkillsIngestion.style';

export interface SkillFiles {
  learningObjectives: File;
  problems: File;
  skills: File;
}

export type SkillFileName = 'los.tsv' | 'problems.tsv' | 'skills.tsv';

export interface SkillsIngestionProps {
  className?: string;
  model: models.CourseModel;
}

export interface SkillsIngestionState {
  skillFiles: SkillFiles;
  hasInvalidFile: boolean;
}

/**
 * SkillsIngestion React Component
 */
@injectSheet(styles)
export class SkillsIngestion
    extends React.Component<StyledComponentProps<SkillsIngestionProps>,
    SkillsIngestionState> {

  inputID: string;

  constructor(props) {
    super(props);

    this.state = {
      skillFiles: {
        learningObjectives: undefined,
        problems: undefined,
        skills: undefined,
      },
      hasInvalidFile: false,
    };
  }

  componentWillMount() {
    this.inputID = guid();
  }

  onFileSelect({ target : { files } }) {
    const { skillFiles } = this.state;
    const fileList = {
      ...skillFiles,
    };

    [...files].forEach((file) => {
      const ending = file.name.split('-').reverse()[0].toLowerCase();
      // How to compare against SkillFileName type?
      switch (ending) {
        case 'los.tsv': {
          fileList.learningObjectives = file;
          break;
          // return this.setState({ skillFiles: { ...skillFiles, learningObjectives: file } });
        }
        case 'problems.tsv': {
          fileList.problems = file;
          break;
          // return this.setState({ skillFiles: { ...skillFiles, problems: file } });
        }
        case 'skills.tsv': {
          fileList.skills = file;
          break;
          // return this.setState({ skillFiles: { ...skillFiles, skills: file } });
        }
        default: {
          this.setState({ hasInvalidFile: true });
        }
      }
      this.setState({ skillFiles: fileList });

      const { learningObjectives, problems, skills } = fileList;
      if (learningObjectives && problems && skills) {
        this.setState({ hasInvalidFile: false });
      }
    });
  }

  triggerFileInput(id: string) {
    (window as any).$('#' + id).trigger('click');
  }

  uploadFiles(e) {
    e.preventDefault();
    const { model } = this.props;
    const courseId = model.guid;

    persistence.skillsUpload(courseId, this.state.skillFiles);

    this.setState({
      skillFiles: {
        learningObjectives: undefined,
        problems: undefined,
        skills: undefined,
      },
    });
  }

  renderSkillsIngestion() {
    const { className, classes } = this.props;
    const { hasInvalidFile, skillFiles: { learningObjectives, problems, skills } } = this.state;

    return (
      <div className="row">
        <div className="col-9">
          Upload Skill Files
          <form className={classes.uploader}>
            <label htmlFor={this.inputID}>
              <div>
                {learningObjectives
                  ? <span><i className="fa fa-check-circle" /> {learningObjectives.name}</span>
                  : <span><i className="fa fa-circle-thin" /> ...-LOs.tsv</span>
                }
              </div>
              <div>
                {skills
                  ? <span><i className="fa fa-check-circle" /> {skills.name}</span>
                  : <span><i className="fa fa-circle-thin" /> ...-Skills.tsv</span>
                }
              </div>
              <div>
                {problems
                  ? <span><i className="fa fa-check-circle" /> {problems.name}</span>
                  : <span><i className="fa fa-circle-thin" /> ...-Problems.tsv</span>
                }
              </div>
              {/* How to extend bottom to include another div? */}
              {hasInvalidFile
                ? <div className={classes.error}>
                  Filenames must end in '-LOs.tsv', '-Skills.tsv', and '-Problems.tsv'
                </div>
                : null
              }
            </label>
            <input
              id={this.inputID}
              style={{ display: 'none' }}
              accept={'.tsv'}
              multiple={true}
              onChange={e => this.onFileSelect(e)}
              type="file" />

            <input
              type="submit"
              value="Upload"
              disabled={!(learningObjectives && problems && skills)}
              onClick={e => this.uploadFiles(e)} />
          </form>
        </div>
        <div className="col-3">
        {/* What to do with promise received? How do actually 'download' files to host? */}
          <Button
            editMode
            onClick={() => persistence.skillsDownload(this.props.model.guid)}>
            <i className="fa fa-download" />&nbsp;Download
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const { className, classes } = this.props;

    return (
      <div className={classNames([classes.SkillsIngestion, className])}>
        <div className="row">
          <div className="col-3">Skills</div>
          <div className="col-9">{this.renderSkillsIngestion()}</div>
        </div>
      </div>
    );
  }
}
