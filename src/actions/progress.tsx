import * as modal from './modal';
import { ModalProgress } from 'components/copypaste/ModalProgress';
import { ParsedContent } from 'data/parsers/common/types';

export function resolveWithProgressUI(
  dispatch: any,
  parsedContent: ParsedContent,
  courseId: string,
  resourcePath: string,
  onComplete: (e) => void,
) {

  const progressUI = (
    <ModalProgress
      parsedContent={parsedContent}
      courseId={courseId}
      resourcePath={resourcePath}
      onComplete={(elements) => {
        dispatch(modal.modalActions.dismiss());
        onComplete(elements);
      }}
    />
  );

  dispatch(modal.modalActions.display(progressUI));
}
