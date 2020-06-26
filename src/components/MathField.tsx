import * as React from 'react';

export interface MathFieldProps {}
  
export interface MathFieldState {
      latex: string;  
}

// Global MathLive object from mathlive script loaded in index.html
declare var MathLive: any; 

export class MathField extends React.Component<MathFieldProps, MathFieldState> {
    constructor(props) {
      super(props);
      this.state = { latex: ''};
    }

    
    componentDidMount() {
      MathLive.makeMathField('mf', {
        fontsDirectory: 'https://unpkg.com/mathlive/dist/fonts/',
        virtualKeyboardMode: 'manual',
        onContentDidChange: mf => { this.onChange(mf.$text()); },
      });
    }

    onChange(latex) { 
      this.setState({ latex });
    }
    
    render() {
      return <div style={{border:'1px solid #ced4da', padding:'5px', borderRadius:'.25rem'}}> 
        <p><b>MathLive Preview</b>: Copy/paste LaTex string below to matching pattern</p>
        <div id='mf' style={{background: '#EEE'}} />
        <p style={{padding:'5px'}}>{this.state.latex}</p>
       </div>;
    }
  }