const XLSX: any = {};

import guid from 'utils/guid';
const { formative, summative, pool } = require('./templates');


function isEmptySheet(sheet) {
  return sheet['A1'] === undefined;
}

function sheetToComponent(sheet) {
  const v = sheet['A1'].v;
  if (v === 'Question ID') {
    return questionHandler(sheet);
  }
  return poolHandler(sheet);
}


function questionHandler(sheet) {

  const q = { id: '', choices: [], skills: [], responses: [], hints: [], body: '', type: 'mc' };
  try {
    let row = 1;
    while (true) {

      if (sheet['A' + row] === undefined) break;

      const k = sheet['A' + row].v;
      const v = sheet['B' + row].v;

      if (k === '') {
        break;
      } else if (k === 'Question ID') {
        q.id = v;
      } else if (k === 'Question Text') {
        q.body = v;
      } else if (k === 'Question Hint') {
        q.hints.push(v);
      } else if (k === 'Skill ID') {
        q.skills.push(v);
      } else if (k.startsWith('Choice')) {

        const correctness = sheet['C' + row] !== undefined ? sheet['C' + row].v : 'Incorrect';
        const feedback = sheet['D' + row].v;
        const choice = { content: v, value: guid() };

        const score = correctness.toLowerCase() === 'correct'
          ? '1' : '0';

        const response = { match: choice.value, score, feedback };
        q.responses.push(response);
        q.choices.push(choice);

      }

      row += 1;
    }

  } catch (e) {
    console.log('error encountered in extracting values: ' + e);
    return null;
  }
  return q;
}


function poolHandler(sheet) {

  const p = {
    id: '', type: 'pool', count: '*', strategy: 'random',
    exhaustion: 'reuse', scope: 'resource',
  };
  try {
    let row = 1;
    while (true) {

      if (sheet['A' + row] === undefined) break;

      const k = sheet['A' + row].v;
      const v = sheet['B' + row].v;

      if (k === '') {
        break;
      } else if (k === 'Pool ID') {
        p.id = v;
      } else if (k === 'Count') {
        p.count = v;
      } else if (k === 'Strategy') {
        p.strategy = v;
      } else if (k === 'Exhaustion') {
        p.exhaustion = v;
      }

      row += 1;
    }

  } catch (e) {
    console.log('error encountered in extracting values: ' + e);
    return null;
  }
  return p;
}

function extractComponents(file) {

  const workbook = (typeof file) === 'string'
    ? XLSX.readFile(file)
    : XLSX.read(file, { type: 'buffer' });

  const components = [];

  Object.keys(workbook.Sheets).map((key) => {

    const s = workbook.Sheets[key];

    if (!isEmptySheet(s)) {
      const c = sheetToComponent(s);

      if (c !== null && c.id !== undefined) {
        components.push(c);
      } else {
        console.log('error in sheet ' + key);
      }
    }

  });

  return components;
}


export function toOLI(inputFile, id, type, title) {
  const components = extractComponents(inputFile);
  let content;
  if (type === 'pool') {
    content = pool(id, title, components);
  } else if (type === 'summative') {
    content = summative(id, title, components);
  } else {
    content = formative(id, title, components);
  }
  return content;
}
