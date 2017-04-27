import { AppServices } from '../../common/AppServices';
import { AppContext } from '../../common/AppContext';

// A command can be executed in a particular context and is provided a 
// set of services that it can use to accomplish its goal.  It takes
// as input a state of a particular type and asynchronously returns 
// a new version of that state.  
export interface Command<DataType> {
  execute(state: DataType, context: AppContext, services: AppServices) : Promise<DataType>;
}

export abstract class AbstractCommand<DataType> implements Command<DataType> {
  abstract execute(state: DataType, context: AppContext, services: AppServices) : Promise<DataType>;
}

// Things that can process commands.  
export interface CommandProcessor<DataType> {
  process(command: Command<DataType>);
}