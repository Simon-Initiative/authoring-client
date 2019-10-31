import ModalSelection from 'utils/selection/ModalSelection';
import * as React from 'react';

export const ImportObjSkillsModal = ({ dismissModal }) => <ModalSelection
  title="Import Objectives and Skills from Excel (.xlsx)"
  onCancel={dismissModal}
  onInsert={() => { }}
  okLabel="Import"
  disableInsert={false}>
  <React.Fragment>
    <HowDoesThisWork />
    <ImportForm />
  </React.Fragment>
</ModalSelection>;

const HowDoesThisWork = () => <div className="card">
  <a className=""
    data-toggle="collapse"
    href="#collapseHowDoesThisWork"
    role="button"
    aria-expanded="false"
    aria-controls="collapseHowDoesThisWork">
    <div className="card-header">
      How does this work?
      </div>
  </a>
  <div className="collapse multi-collapse" id="collapseHowDoesThisWork">
    <div className="card-body">
      <div style={{ margin: 20 }}>
        <h4>Skills model creation</h4>
        <ul>
          <li>
            An OLI skills model consists of a definition of
            learning objectives and a mapping to
            corresponding, more-granular, skills.
            </li>
          <li>
            {`The utility expects to have uploaded to it
              a Microsoft Excel workbook file in ${<code>xlsx</code>} format
              and will produce a zip file containing both a learning objectives
              XML file and a skills XML file.`}
          </li>
          <li>
            This utility expects the first tab in the sheet to contain the definition of
            the course's skills.
            </li>
          <li>
            Column <code>A</code> should define the
              skill id, and column <code>B</code> defines
the title of the skill.
            </li>
        </ul>
        <h4>Skill sheet format</h4>
        <p>The following example illustrates the expected format of the skills sheet:</p>
        <table className="table table-bordered table-sm">
          <tbody>
            <tr>
              <td>my-first-skill-id</td>
              <td>This is the text of the first skill</td>
            </tr>
            <tr>
              <td>my-second-skill-id</td>
              <td>This is the text of the second skill</td>
            </tr>
            <tr>
              <td>my-third-skill-id</td>
              <td>This is the text of the third skill</td>
            </tr>
          </tbody>
        </table>
        <h5>Notes</h5>
        <ul>
          <li>
            This utility will create a parent learning objective for each defined skill
            </li>
        </ul>
      </div>
    </div>
  </div>
</div>;

const ImportForm = () => <form id="uploadForm" encType="multipart/form-data">
  <div className="form-group import-skills">
    <label htmlFor="file">
      <h4>Skills File</h4>
      <input type="file" className="form-control"
        id="file" aria-describedby="fileHelp" name="xlsx"
        placeholder="XLSX File" />
    </label>
    <small id="fileHelp" className="form-text text-muted">
      The .xlsx file containing the skills definitions.
      </small>
  </div>
</form>;
