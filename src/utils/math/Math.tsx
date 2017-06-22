import * as React from 'react';
import { process } from './process';

const MathJax : any = (window as any).MathJax;

export interface Math {
  node: any;
  script: any;
}

export interface MathProps {
  inline: boolean;
}

/**
 * React component to render maths using mathjax
 * @type {ReactClass}
 */
export class Math extends React.Component<MathProps, { isMathJaxReady: boolean }> {

  constructor(props) {
    super(props);

    console.log('isMathJaxReady: ' + MathJax.isReady);

    this.state = {
      isMathJaxReady: MathJax.isReady,
    };
  }

  componentDidMount() {

    if (this.state.isMathJaxReady) {
      this.typeset(false);
    } else {
      MathJax.Hub.Register.StartupHook(
        'End',
        () => this.setState({ isMathJaxReady: true }),
      );
    }

  } 

    /**
     * Update the jax, force update if the display mode changed
     */
  componentDidUpdate(prevProps) {
    if (this.state.isMathJaxReady) {
      const forceUpdate = prevProps.inline !== this.props.inline;
      this.typeset(forceUpdate);
    }
  }

  /**
   * Prevent update when the tex has not changed
   */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return (
        nextState.isMathJaxReady !== this.state.isMathJaxReady
        || nextProps.children !== this.props.children
        || nextProps.inline !== this.props.inline
        || nextContext.MathJax !== this.context.MathJax
    );
  }

  /**
   * Clear the math when unmounting the node
   */
  componentWillUnmount() {
    this.clear();
  }

  /**
   * Clear the jax
   */
  clear() {
    if (!this.script || !MathJax) {
      return;
    }

    const jax = MathJax.Hub.getJaxFor(this.script);
    if (jax) {
      jax.Remove();
    }
  }

  /**
   * Update math in the node.
   * @param {Boolean} forceUpdate
   */
  typeset(forceUpdate) {
    const { children } = this.props;

    if (!MathJax) {
      return;
    }

    const text = children;

    if (forceUpdate) {
      this.clear();
    }

    if (!forceUpdate && this.script) {
      MathJax.Hub.Queue(() => {
        const jax = MathJax.Hub.getJaxFor(this.script);

        if (jax) {
          jax.Text(text, () => {});
        } else {
          const script = this.setScriptText(text);
          process(MathJax, script, () => {});
        }
      });


    } else {
      const script = this.setScriptText(text);
      process(MathJax, script, () => {});
    }
  }

  /**
   * Create a script
   * @param  {String} text
   * @return {DOMNode} script
   */
  setScriptText(text) {
    const { inline } = this.props;

    if (!this.script) {
      this.script = document.createElement('script');
      
      const tex = 'math/tex; ';
      const mml = 'math/mml; ';
      let type = tex;
      if (text.startsWith('<')) {
        type = mml;
      }
      
      this.script.type = type + (inline ? '' : 'mode=display');
      (this.node as any).appendChild(this.script);
    }

    if ('text' in this.script) {
        // IE8, etc
      this.script.text = text;
    } else {
      this.script.textContent = text;
    }

    return this.script;
  }

  render() {
    return <span ref={ n => this.node = n} />;
  }
}

