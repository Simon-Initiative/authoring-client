// tslint:disable: max-line-length

import ModalSelection from 'utils/selection/ModalSelection';
import { Fragment, useState, useEffect } from 'react';
import { processPage, Context as WbpContext } from './import-workbook';
import * as persistence from 'data/persistence';
import * as Immutable from 'immutable';
import { WorkbookPageModel } from 'data/models/workbook';
import { Head } from 'data/content/workbook/head';
import { Title } from 'data/contentTypes';
import { ContentElements, BODY_ELEMENTS } from 'data/content/common/elements';
import { WB_BODY_EXTENSIONS } from 'data/content/workbook/types';
import { Resource } from 'data/content/resource';
import { CourseModel } from 'data/models/course';

async function setupGapi(): Promise<any> {
  // simondevbot@gmail.com account
  const apiKey = 'AIzaSyA2MzZdstadaU6tLyv-Sx9X_XH28pc0TTY';
  const clientId = '1059942708763-22elsdmhjgl3ul0kcqsah3e36fuuictr.apps.googleusercontent.com';
  const discoveryDocs = [
    'https://docs.googleapis.com/$discovery/rest?version=v1&key=' + apiKey,
  ];
  const scope = 'https://www.googleapis.com/auth/documents.readonly';

  const gapi = (window as any).gapi;

  gapi.client.init({
    apiKey,
    clientId,
    discoveryDocs,
    scope,
  });
  return gapi;
}

async function googleSignin(gapi): Promise<void> {
  return gapi.auth2.getAuthInstance().signIn();
}

async function googleSignout(gapi): Promise<void> {
  return gapi.auth2.getAuthInstance().signOut();
}

async function downloadImages(images, course) {
  return Promise.all(images.map((img => retrieveImage(img, course))));
}

async function retrieveImage(image: { href: string, name: string }, course: CourseModel): Promise<string> {
  const response = await fetch(image.href);
  return persistence.createWebContent(
    course.guid,
    blobToFile(await response.blob(), image.name));
}

function blobToFile(theBlob: Blob, fileName: string): File {
  return new File([theBlob], fileName);
}

async function retrieveDocument(gapi, documentId): Promise<any> {
  const gapiResponse = await gapi.client.docs.documents.get({ documentId });
  return gapiResponse.result;
}

function parseWorkbookPage(context): WorkbookPageModel {
  return WorkbookPageModel.createNew(context.id, context.title, '').with({
    head: new Head().with({
      title: Title.fromText(context.title),
      objrefs: Immutable.List(context.objrefs),
    }),
    body: parseBody(context.lines),
  });
}

function parseBody(lines: any[]): ContentElements {
  const WB_ELEMENTS = [...BODY_ELEMENTS, ...WB_BODY_EXTENSIONS];
  return ContentElements.fromPersistence(
    // Create a DTO from ContentElements (for text) or the specific ContentElement
    // added from the importer
    lines.reduce(
      (acc, curr) => {
        if (curr instanceof ContentElements) {
          // For text blocks, `import-workbook` creates ContentElements wrappers
          // with a single wrapped item
          acc['#array'].push(curr.content.first().toPersistence()[0]);
        } else {
          // Otherwise it's some other ContentElement wrapper
          acc['#array'].push(curr.toPersistence());
        }
        return acc;
      },
      { '#array': [] },
    ), '', WB_ELEMENTS, null, () => { });
}

async function createWorkbookPage(context: WbpContext, course: CourseModel): Promise<Resource> {
  const wbp = parseWorkbookPage(context);
  await downloadImages(context.imagesToFetch, course);
  const r = await persistence.createDocument(course.idvers, wbp) as any;
  return r.model.resource;
}

function doUpdateCourseResources(newResource: Resource, updateCourseResources) {
  const updated = Immutable.OrderedMap([[newResource.guid, newResource]]);
  updateCourseResources(updated);
}

export const ImportWbpModal = ({ dismissModal, updateCourseResources, course }) => {
  const [documentId, setDocumentId] = useState('');
  const [disableInsert, setDisableInsert] = useState(true);
  const [errors, setErrors] = useState([]);
  const [gapi, setGapi] = useState();

  useEffect(() => {
    setDisableInsert(!documentId || !gapi);
  });

  useEffect(() => {
    setupGapi().then(setGapi);
  }, []);

  async function onInsert() {
    setErrors([]);
    try {
      await googleSignin(gapi);
    } catch (e) {
      setErrors([
        new Error('You\'ll need to sign in through a Google account that has access to the page to allow OLI to import it.'),
      ]);
    }

    try {
      const document = await retrieveDocument(gapi, documentId);
      const context = processPage(document);
      setErrors(context.errors);

      try {
        const workbookPage = await createWorkbookPage(context, course);
        doUpdateCourseResources(workbookPage, updateCourseResources);
        if (context.errors.length === 0) {
          dismissModal();
        }
      } catch (e) {
        setErrors([
          new Error('There was a problem creating the workbook page in OLI after it was processed. Please give it another try.'),
        ]);
      }
    } catch (e) {
      setErrors([
        new Error('There was a problem retrieving that document ID. Make sure the ID is correct and try again.'),
      ]);
    }
    try {
      await googleSignout(gapi);
    } catch (e) {
      // Google signout error. Not really a problem.
    }
  }

  return (
    <ModalSelection
      title="Import Workbook Page from Google Docs"
      onCancel={dismissModal}
      onInsert={onInsert}
      okLabel={gapi ? 'Import' : 'Connecting...'}
      disableInsert={disableInsert}>
      <Fragment>
        <Errors
          errors={errors}
        />
        <HowDoesThisWork />
        <ImportForm
          documentId={documentId}
          setDocumentId={setDocumentId}
        />
      </Fragment>
    </ModalSelection>
  );
};

const HowDoesThisWork = () =>
  <div className="card">
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
          <p>OLI supports importing existing workbook page content from <a target="_blank" href="https://docs.google.com/document/u/0/">Google Docs.</a></p>
          <p>
            To use the importer, add a Google document ID below and import. Importing will prompt you to sign in with the Google account that has access to edit the document.
          </p>
        </div>
      </div>
    </div>
    <a className=""
      data-toggle="collapse"
      href="#collapseSupportedElements"
      role="button"
      aria-expanded="false"
      aria-controls="collapseSupportedElements">
      <div className="card-header">
        What elements are supported?
</div>
    </a>
    <div className="collapse multi-collapse" id="collapseSupportedElements">
      <div className="card-body">
        <div style={{ margin: 20 }}>
          <p>To see a sample doc with content that demonstrates the basics,
check out <a target="_blank" href="https://docs.google.com/document/d/1URR7Ii4LFQwhHllqYtV3sHaU7tQMeIUzG0iU6qm27Z0/edit?usp=sharing">
              the example OLI Google Doc
        </a>.</p>
          <h5>Supported Elements</h5>
          <ul>
            <li>Paragraphs</li>
            <li>Text formats including bold and italic</li>
            <li>Hyperlinks</li>
            <li>Tables</li>
            <li>Images</li>
            <li>Ordered and bulleted lists</li>
          </ul>
          <h5>Custom Element Support</h5>
          <p>This tool also supports importing non-native Google Docs elements
through a <code>CustomElement</code> table that the author of the doc inserts.
    </p>
          <h6>YouTube Video</h6>

          <table className="table table-bordered table-sm">
            <tbody>
              <tr>
                <td>CustomElement</td>
                <td>youtube</td>
              </tr>
              <tr>
                <td>src</td>
                <td><i>the video id</i></td>
              </tr>
              <tr>
                <td>caption</td>
                <td><i>optional - the video caption</i></td>
              </tr>
              <tr>
                <td>height</td>
                <td><i>optional - height in pixel</i></td>
              </tr>
              <tr>
                <td>width</td>
                <td><i>optional - width in pixels</i></td>
              </tr>
            </tbody>
          </table>

          <h6>Formative assessment</h6>

          <table className="table table-bordered table-sm">
            <tbody>
              <tr>
                <td>CustomElement</td>
                <td>formative</td>
              </tr>
              <tr>
                <td>idref</td>
                <td><i>the resource id of the formative assessment</i></td>
              </tr>
            </tbody>
          </table>
          <h6>Summative assessment</h6>

          <table className="table table-bordered table-sm">
            <tbody>
              <tr>
                <td>CustomElement</td>
                <td>summative</td>
              </tr>
              <tr>
                <td>idref</td>
                <td><i>the resource id of the formative assessment</i></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>;

const ImportForm = ({ documentId, setDocumentId }) => {

  // https://stackoverflow.com/questions/16840038/easiest-way-to-get-file-id-from-url-on-google-apps-script
  function getIdFromUrl(url: string) {
    return url.match(/[-\w]{25,}/);
  }

  const parseDocumentId = (text: string) => {
    if (getIdFromUrl(text)) {
      return getIdFromUrl(text)[0];
    }
    return text;
  };

  return (
    <div style={{ margin: 20 }}>
      <form id="convert">
        <div className="form-group">
          <label htmlFor="id" style={{ width: '100%' }}>Document ID
    <input type="text" className="form-control" id="id" aria-describedby="idHelp" placeholder="1URR7Ii4LFQwhHllqYtV3sHaU7tQMeIUzG0iU6qm27Z0"
              value={documentId}
              onChange={e => setDocumentId(parseDocumentId(e.target.value))} />
          </label>
          <small id="idHelp" className="form-text text-muted">This portion of a link:
    https://docs.google.com/document/d/<b>1URR7Ii4LFQwhHllqYtV3sHaU7tQMeIUzG0iU6qm27Z0</b>/edit</small>
        </div>
      </form>
    </div>
  );
};

const Errors = ({ errors }: { errors: Error[] }) => {
  if (errors.length === 0) {
    return null;
  }

  const Error = (error: Error) => (
    <li className="list-group-item" style={{ display: 'list-item' }}>
      {error.message}
    </li>
  );

  return (
    <div className="card alert alert-danger" role="info" style={{ marginBottom: 10 }}>
      <div className="card-header" style={{ background: 'white' }}>
        <h5 className="card-title">Errors</h5>
        <h6 className="card-subtitle text-muted">
          <span style={{ display: 'inline-block' }}>There were some errors with the document you imported.</span>
          <span style={{ display: 'inline-block' }}>If you need some guidance, please reach out to us with the link under the account dropdown menu.</span>
        </h6>
      </div>
      <ul className="list-group list-group-flush" style={{ listStyle: 'decimal inside' }}>
        {errors.map(Error)}
      </ul>
    </div>
  );
};
