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
export class Math extends React.Component<MathProps, any> {

  componentDidMount() {
    this.typeset(false);
  } 

    /**
     * Update the jax, force update if the display mode changed
     */
  componentDidUpdate(prevProps) {
    const forceUpdate = prevProps.inline != this.props.inline;
    this.typeset(forceUpdate);
  }

  /**
   * Prevent update when the tex has not changed
   */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return (
        nextProps.children != this.props.children
        || nextProps.inline != this.props.inline
        || nextContext.MathJax != this.context.MathJax
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

        if (jax) jax.Text(text, () => {});
        else {
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
        this.script.type = 'math/mml; ' + (inline ? '' : 'mode=display');
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
    return <span ref={(n) => this.node = n} />;
  }
}

