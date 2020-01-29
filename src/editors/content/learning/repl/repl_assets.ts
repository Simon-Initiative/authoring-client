import { valueOr } from 'utils/utils';
import * as contentTypes from 'data/contentTypes';
import guid from 'utils/guid';

export const EXAMPLE_PROMPT_HTML = '<p><strong>THIS IS EXAMPLE CONTENT. PLEASE EDIT OR \
DELETE IT.</strong></p><p>Implement the function <code>add(a, b)</code> below. Add your \
own assertions to cover any edge cases. Click <strong>Run</strong> to test out your \
solution. When satisfied with your implementation, click <strong>Submit</strong> to score \
your solution.</p>';

export const EXAMPLE_CODE = `# THIS IS EXAMPLE CONTENT.
# PLEASE EDIT OR DELETE IT.

""" Returns the sum of 2 numbers """
def add(a, b):
  ## IMPLEMENT YOUR SOLUTION HERE ##

assert add(1,1) == 2
assert add(-1, 3) == 2
## ADD YOUR OWN ASSERTIONS HERE ##

print("Nice job! All assertions passed.")
print("Click Submit to score your solution.")
`;

export const createExampleQuestion = (): Question => ({
  id: guid(),
  initeditortext: EXAMPLE_CODE,
  language: 'python',
  functionname: 'add',
  testCases: [{
    guid: guid(),
    input: '1,1',
    output: '2',
  }],
  hints: [],
});

const EXAMPLE_SOLUTION = `""" Returns the sum of 2 numbers """
def add(a, b):
  return a + b
`;

export const createExampleSolution = (): Solution => ({
  language: 'python',
  value: EXAMPLE_SOLUTION,
});

type RenderLayoutHtmlOptions = Partial<{
  prompt: string,
  showCodeEditor: boolean,
  isGraded: boolean,
}>;

export const renderLayoutHtml = ({
    prompt = '',
    showCodeEditor = true,
    isGraded = false,
  }: RenderLayoutHtmlOptions = {}) => `<div id="q1" class="question">
  <div id="prompt">${valueOr(prompt, '')}</div>
  ${showCodeEditor
    ? `
    <div>
      <button id="run" class="btn btn-primary btn-xs">Run</button>
      ${isGraded ? '<button id="submit" class="btn btn-primary btn-xs">Submit</button>' : ''}
      <button id="clear" class="btn btn-primary btn-xs" style="float: right;">Clear</button>
    </div>
    <div id="editor"></div>
    <div id="console"></div>`
    : `
    <div>
      <button id="clear" class="btn btn-primary btn-xs" style="float: right;">Clear</button>
    </div>
    <div id="console"${showCodeEditor ? '' : ' class="console-only"'}></div>`
  }
</div>
`;

export const renderDefaultStylesCss = () => `/*
Copyright (c) 2019 Carnegie Mellon University.
*/

/* The console container element */
#console {
  height: 250px;
  width: 50%;
  position:relative;
  background-color: black;
  border: 2px solid #CCC;
  margin: 0 auto;
  margin-top: 0px;
  display: inline-block;
  left: 0;
}
#console.console-only {
  width: 100%;
}
#editor {
  height: 250px;
  width: 50%;
  border: 2px solid #CCC;
  position:relative;
  display: inline-block;
  left: 0;
  margin-right: -5px;
}
#oli-embed {
  position: relative;
  margin-bottom: 5px;
}
.hints {
  border-radius: 10px;
  background: #fde9a2;
  border: solid 2px;
  border-color: #73716e;
  padding: 4px 7px 4px 7px;
  display: none;
  position: relative;
}
.hints .next {
  display: block;
  position: absolute;
  top: 31%;
  right: 15px;
  background: url("asSprite.png") no-repeat -8px 0px;
  text-indent: -9999px;
  height: 15px;
  width: 10px;
}
.hints .content {
  display: inline-block;
}
.feedback {
  margin-top: 5px;
  border-radius: 10px;
  border: solid 2px;
  border-color: #73716e;
  padding: 4px 7px 4px 7px;
  display: none;
}

/* ace editor styles */
.ace_editor {
  height: 250px;
  width: 350px;
  border: 1px solid #CCC;
}

.scrollmargin {
  height: 80px;
}
`;

export const renderDefaultControlsHtml = () => `<div>
    <button id="hint_btn" type="button" class="btn btn-primary btn-xs">Hint</button>
    <button id="solution_btn" type="button" class="btn btn-primary btn-xs">Our Solution</button>
    <button id="next_btn" type="button" class="btn btn-primary btn-xs" style="float: right;">Reset</button>
</div>
`;

export type TestCase = {
  guid: string;
  input: string;
  output: string;
};

export type Hint = {
  id: string,
  content: contentTypes.RichText,
};

export type Question = {
  id: string,
  initeditortext: string,
  language: string,
  functionname: string,
  testCases: TestCase[],
  hints: Hint[],
};

type RenderQuestionsXmlParams = Partial<{
  questions: Question[],
}>;

export const renderQuestionsXml = ({
  questions = [],
}: RenderQuestionsXmlParams = {}) => `<?xml version="1.0" encoding="UTF-8"?>
<root>
${
  questions.map(question => `
  <question id="${question.id}">
    <part id="${question.id}_1">
        <initeditortext><![CDATA[${valueOr(question.initeditortext, '')}]]></initeditortext>
        ${question.testCases.length > 0
          ? `
          <feedbackengine>
              <cloudcoder>
                  <language>${valueOr(question.language, '')}</language>
                  <problemtype>function</problemtype>
                  <functionname>${valueOr(question.functionname, '')}</functionname>
                  ${question.testCases.map(testcase => `<testcase>
                      <input>${valueOr(testcase.input, '')}</input>
                      <output>${valueOr(testcase.output, '')}</output>
                  </testcase>`)}
              </cloudcoder>
          </feedbackengine>
          `
          : ''
        }
        ${question.hints.map(hint => `<hint id="${hint.id}">
          ${hint.content.toHtml()}
        </hint>`)}
    </part>
  </question>
`)
}
</root>
`;

export type Solution = {
  language: string;
  value: string;
};

type RenderSolutionsXmlParams = Partial<{
  solutions: Solution[];
}>;

export const renderSolutionsXml = ({
  solutions = [],
}: RenderSolutionsXmlParams = {}) => `<?xml version="1.0" encoding="UTF-8"?>
<root>
${
  solutions.map(solution => `
  <solution>
    <pre class="brush: ${valueOr(solution.language, '')}"><![CDATA[${valueOr(solution.value, '')}]]></pre>
  </solution>
`)
}
</root>
`;
