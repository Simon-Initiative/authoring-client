
import { buildFeedback } from '../../src/utils/feedback';

it('Creating Feedback Form URL', () => {
  
  const url = buildFeedback('Kilgore Trout', 'k@k.com', 'test');
    
  // Now verify that all the pieces and parts are present:
  expect(url).toBe('https://docs.google.com/forms/d/e/1FAIpQLSfrkoCCe2cX5KFKcdzmtb'
  + 'LVNPkTSQeiJ4w0mEBqCNrT6hfceA/viewform?'
  + 'entry.1045781291=test&'
  + 'emailAddress=k%40k.com&'
  + 'entry.2005620554=Kilgore%20Trout');
    
});
