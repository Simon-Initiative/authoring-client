
export type LockDetails = {
  lockedBy: string;
  lockedAt: number;
};

export function renderLocked(lockDetails: LockDetails) {
  return (
    <div className="container">
      <div className="row">
        <div className="col-2">
          &nbsp;
        </div>
        <div className="col-8">
          <div className="alert alert-warning" role="alert">
            <strong>Read Only</strong>&nbsp;&nbsp; 
            The contents of this page is being edited by {lockDetails.lockedBy}
          </div>
        </div>
        <div className="col-2">
          &nbsp;
        </div>
      </div>
      
    </div>
  );
}
