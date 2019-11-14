import { valueOr } from 'utils/utils';

type RenderLayoutHtmlOptions = Partial<{
  prompt: string,
  showCodeEditor: boolean,
  editorText: string,
}>;

export const renderLayoutHtml = ({
    prompt = '',
    showCodeEditor = true,
  }: RenderLayoutHtmlOptions = {}) => `<div id="q1" class="question">
  <div id="prompt">${valueOr(prompt, '')}</div>
  ${showCodeEditor
    ? `
    <div>
      <button id="run" class="btn btn-primary btn-xs">Run</button>
      <button id="clear" class="btn btn-primary btn-xs" style="float: right;">Clear</button>
    </div>
    <div id="editor"></div>
    <div id="console"></div>`
    : `
    <div>
      <button id="clear" class="btn btn-primary btn-xs" style="float: right;">Clear</button>
    </div>
    <div id="console"></div>`
  }
</div>
`;

export const renderDefaultStylesCss = () => `/*
Copyright (c) 2019 Carnegie Mellon University.
*/

/* The console container element */
#console {
    height: 250px;
    width: 340px;
    position:relative;
    background-color: black;
    border: 2px solid #CCC;
    margin: 0 auto;
    margin-top: 0px;
    display: inline-block;
    left: 0;
    margin-left: -10px;
}
/*#console {
    width: 670px;
    height: 400px;
    background-color:black;
}*/
/* The inner console element. */
.jqconsole {
    padding: 10px;
}
/* The cursor. */
.jqconsole-cursor {
    background-color: gray;
}
/* The cursor color when the console looses focus. */
.jqconsole-blurred .jqconsole-cursor {
    background-color: #666;
}

.jqconsole-header {
    color: white;
    font-size: smaller;
}
/* The current prompt text color */
.jqconsole-prompt {
    color: #0d0;
}
/* The command history */
.jqconsole-old-prompt {
    color: #0b0;
    font-weight: normal;
}
/* The text color when in input mode. */
.jqconsole-input {
    color: #dd0;
}
/* Previously entered input. */
.jqconsole-old-input {
    color: #bb0;
    font-weight: normal;
}
/* The text color of the output. */
.jqconsole-output {
    color: white;
}
/* The text color of the output. */
.jqconsole-hint {
    color: yellow;
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
.out_val {
    color: black;
    background-color: aquamarine;
}
#editor {
    height: 250px;
    width: 320px;
    border: 2px solid #CCC;
    position:relative;
    display: inline-block;
    left: 0;
    margin-right: -1px;
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

export type Question = {
  id: string,
  initeditortext: string,
  language: string,
  functionname: string,
  testCases: TestCase[],
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
