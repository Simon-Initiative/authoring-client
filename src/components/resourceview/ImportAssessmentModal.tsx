import ModalSelection from 'utils/selection/ModalSelection';
import * as React from 'react';

export const ImportAssessmentModal = ({ dismissModal }) => <ModalSelection
  title="Import Assessment from Excel (.xlsx)"
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
        <h4>Assessment creation</h4>
        <ul>
          <li>
            Formative assessments, summative assessments and question pools can be
            created using this utility.
</li>
          <li>
            The utility expects to have uploaded to it
  a Microsoft Excel workbook file in <code>xlsx</code> format.
</li>
          <li>
            To keep a Google Drive Spreadsheet as your source of truth, simply
  download the Google spreadsheet as a <code>Microsoft Excel (.xlsx)</code>
            prior to using this utility.
</li>
          <li>
            Each sheet in the workbook is expected to contain the definition of
            either a question or a pool reference.
</li>
        </ul>
        <h4>Question sheet format</h4>

        <p>The following example illustrates the expected format of a question sheet:</p>

        <table className="table table-bordered table-sm">
          <tbody>
            <tr>
              <td>Question ID</td>
              <td><i>my-question-1</i></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Question Type</td>
              <td><i>MCQ</i></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Question Text</td>
              <td><i>Which of the following is an animal?</i></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Question Hint</td>
              <td><i>Which of these could bite you?</i></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Skill ID</td>
              <td><i>animal-identification</i></td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Choice</td>
              <td><i>Table</i></td>
              <td></td>
              <td>><i>Incorrect. Tables do not bite.</i></td>
            </tr>
            <tr>
              <td>Choice</td>
              <td><i>Dog</i></td>
              <td><i>Correct</i></td>
              <td><i>Yes, a dog can bite you.</i></td>
            </tr>
            <tr>
              <td>Choice</td>
              <td><i>Shoe</i></td>
              <td></td>
              <td><i>Shoes cannot bite. </i></td>
            </tr>
            <tr>
              <td>Choice</td>
              <td><i>Idea</i></td>
              <td></td>
              <td><i>Usually ideas cannot bite.</i></td>
            </tr>
          </tbody>
        </table>

        <h5>Notes</h5>

        <ul>
          <li><code>MCQ</code> is currently the only supported question type</li>
          <li>There can be zero or more hints</li>
          <li>There can be zero or more skills</li>
          <li>There must be at least two choices</li>
          <li>There must be exactly one choice marked <code>Correct</code></li>
          <li>Feeback must be present for each choice</li>
          <li>Assessment, question and skill IDs cannot contain spaces</li>
          <li>
            The utility stops processsing a sheet at the first blank row that it encounters
      </li>
        </ul>

        <h4>Pool reference sheet format</h4>

        <p>The following example illustrates the expected format of a pool reference:</p>

        <table className="table table-bordered table-sm">
          <tbody>
            <tr>
              <td>Pool ID</td>
              <td><i>my-pool-1</i></td>
            </tr>
            <tr>
              <td>Count</td>
              <td><i>3</i></td>
            </tr>
            <tr>
              <td>Strategy</td>
              <td><i>random</i></td>
            </tr>
            <tr>
              <td>Exhaustion</td>
              <td><i>reuse</i></td>
            </tr>
          </tbody>
        </table>
        <h5>Notes</h5>
        <ul>
          <li>Only the <code>Pool ID</code> field is required</li>
          <li>The possible values for <code>Count</code> is a positive integer or the value <code>
            *</code> which
  represents to select all questions from the pool. The <code>
              *</code> value is the default value.
</li>
          <li>The possible values for <code>Strategy</code> are <code>random</code>,
  <code>random_with_replace</code>
            or <code>ordered</code>. The default value is <code>random</code>.</li>
          <li>The possible values for <code>Exhaustion</code> are <code>
            reuse</code>, <code>skip</code>,
  <code>fail</code>. The default is <code>reuse</code>.</li>
          <li>The utility stops processsing a sheet at the first blank row that it encounters</li>
        </ul>
      </div>
    </div>
  </div>
</div>;

const ImportForm = () => <div style={{ margin: 20 }}>
  <form id="uploadForm" encType="multipart/form-data">
    <div className="form-group">
      <label htmlFor="title">Title
  <input type="text" className="form-control" id="title"
          aria-describedby="titleHelp" placeholder="Enter title" />
      </label>
      <small id="titleHelp" className="form-text text-muted">
        The student facing title of the assessment.
  </small>
    </div>
    <div className="form-group">
      <label htmlFor="id">ID
    <input type="text" className="form-control" id="id"
          aria-describedby="idHelp" placeholder="Unique ID" />
      </label>
      <small id="idHelp" className="form-text text-muted">
        Assessment ID, cannot contain spaces.
  </small>
    </div>
    <div className="form-group">
      <label htmlFor="type">Resource Type
    <select className="form-control" id="type">
          <option value="summative">Summative Assessment</option>
          <option value="formative">Formative Assessment</option>
          <option value="pool">Question Pool</option>
        </select>
      </label>
      <small id="typeHelp" className="form-text text-muted">
        The type of the OLI resource to create
  </small>
    </div>
    <div className="form-group">
      <label htmlFor="file">Question File
    <input type="file" className="form-control" id="file"
          aria-describedby="fileHelp" name="xlsx"
          placeholder="XLSX File" />
      </label>
      <small id="fileHelp" className="form-text text-muted">
        The .xlsx file containing the resource content.
  </small>
    </div>
  </form>
</div>;
