
export type LockDetails = {
  lockedBy: string;
  lockedAt: number;
};

export function renderLocked(lockDetails: LockDetails) {

  const message = lockDetails === null
    ? 'The time limit of your exclusive access for editing this page has expired.\n\n'
      + 'Reload this page to attempt to continue editing'
    : 'The contents of this page is being edited by ' + lockDetails.lockedBy;

  return (
    <div className="container">
      <div className="row">
        <div className="col-2">
          &nbsp;
        </div>
        <div className="col-8">
          <div className="alert alert-warning" role="alert">
            <strong>Read Only</strong>&nbsp;&nbsp; 
            {message}
          </div>
        </div>
        <div className="col-2">
          &nbsp;
        </div>
      </div>
      
    </div>
  );
}
