import { MediaManager } from 'editors/content/media/manager/MediaManager.controller';
import { MIMETYPE_FILTERS, SELECTION_TYPES } from 'editors/content/media/manager/MediaManager';
import { adjustPath } from 'editors/content/media/utils';
import ModalSelection from 'utils/selection/ModalSelection';

export function selectFile(
  initialSrc, resourcePath, courseModel, display, dismiss) : Promise<string> {

  return new Promise((resolve, reject) => {

    const selected = { src: initialSrc };

    const mediaLibrary =
      <ModalSelection title="Select a source file"
        onInsert={() => { dismiss(); resolve(selected.src); }}
        onCancel={() => dismiss()}>
        <MediaManager model={null}
          resourcePath={resourcePath}
          courseModel={courseModel}
          onEdit={() => {}}
          mimeFilter={MIMETYPE_FILTERS.ALL}
          selectionType={SELECTION_TYPES.SINGLE}
          initialSelectionPaths={[initialSrc]}
          onSelectionChange={(file) => {
            selected.src =
             adjustPath(file[0].pathTo, resourcePath);
          }} />
      </ModalSelection>;

    display(mediaLibrary);
  });
}
