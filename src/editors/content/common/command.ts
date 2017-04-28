import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';

// A command can be executed in a particular context and is provided a 
// set of services that it can use to accomplish its goal.  It takes
// as input a state of a particular type and asynchronously returns 
// a new version of that state.  
export interface Command<DataType> {

  // Execute this command given state and context. 
  execute(state: DataType, context: AppContext, services: AppServices) : Promise<DataType>;

  // Determines is the preconditions required for this command to be able
  // to be executed are met.  This can be used to determine, for example, if
  // a toolbar button that exposes a command should be enabled or disabled. 
  precondition(state: DataType, context: AppContext): boolean;
}

export abstract class AbstractCommand<DataType> implements Command<DataType> {
  
  abstract execute(state: DataType, context: AppContext, services: AppServices) : Promise<DataType>;
  
  precondition(state: DataType, context: AppContext) : boolean {
    return true;
  }
}

// Things that can process commands.  
export interface CommandProcessor<DataType> {
  
  process(command: Command<DataType>);

  checkPrecondition(command: Command<DataType>) : boolean;
}