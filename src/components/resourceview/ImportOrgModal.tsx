import ModalSelection from 'utils/selection/ModalSelection';
import * as React from 'react';

export const ImportOrgModal = ({ dismissModal }) => <ModalSelection
  title="Import Organization from Excel (.xlsx)"
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
        <h4>Org creation</h4>
        <ul>
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
            The tool expects the first tab in the workbook to contain
            the definition of an organization.
    </li>
        </ul>
        <h4>Organization sheet format</h4>
        <p>The following example illustrates the expected format of a question sheet:</p>
        <table className="table table-bordered table-sm">
          <tbody>
            <tr>
              <td>Sequence</td>
              <td>sequence-id</td>
              <td>The Sequence Title</td>
              <td></td>
            </tr>
            <tr>
              <td>Unit</td>
              <td>unit-1</td>
              <td>The First Unit</td>
              <td></td>
            </tr>
            <tr>
              <td>Module</td>
              <td>module-id</td>
              <td>The First Module</td>

              <td></td>
            </tr>
            <tr>
              <td>Item</td>
              <td>the-item-id</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Item</td>
              <td>another-item-id</td>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td>Section</td>
              <td>section-id</td>
              <td>The Section Title</td>
              <td></td>
            </tr>
            <tr>
              <td>Item</td>
              <td>yet-another-id</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <h5>Notes</h5>
        <ul>
          <li><code>Sequence</code>, <code>Unit</code>, <code>Module</code>, <code>
            Section</code> and
      <code>Item</code> are
      the available options in column <code>A</code></li>
          <li>All types must specify an id in column <code>B</code></li>
          <li>All types except <code>Item</code> must define a title</li>
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
        The student facing title of the org.
          </small>
    </div>
    <div className="form-group">
      <label htmlFor="id">ID
        <input type="text" className="form-control" id="id"
          aria-describedby="idHelp" placeholder="Unique ID" />
      </label>
      <small id="idHelp" className="form-text text-muted">
        Org ID, cannot contain spaces.
        </small>
    </div>
    <div className="form-group">
      <label htmlFor="file">Org File
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
