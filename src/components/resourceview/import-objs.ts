const XLSX: any = {};
const { skills, objectives } = require('./templates');

function toModel(sheet) {

  const skills = [];
  try {
    let row = 1;
    while (true) {

      if (sheet['A' + row] === undefined) break;

      const id = sheet['A' + row].v;
      const title = sheet['B' + row].v;
      skills.push({ id, title });

      row += 1;
    }

  } catch (e) {
    console.log('error encountered in extracting values: ' + e);
    return null;
  }
  return skills;
}


export function buildSkillsModel(file) {

  const workbook = (typeof file) === 'string'
    ? XLSX.readFile(file)
    : XLSX.read(file, { type: 'buffer' });

  const sheet = workbook.Sheets[Object.keys(workbook.Sheets)[0]];
  const context = { errors: [] };
  const model = toModel(sheet);

  return new Promise((resolve, reject) => {

    // zip(objectives(model), skills(model), context)
    //   .then(file => resolve({ zip: base64_encode(file), errors: context.errors }))
    //   .catch(e => reject(e));
  });

}

function zip(objectives, skills, context) {
  return new Promise((resolve, reject) => {
    // const output = 'skills.zip';
    // try {
    //   const zip = new JSZip();
    //   zip.folder('x-oli-learning_objectives').file('objectives.xml', objectives);
    //   zip.folder('x-oli-skills_model').file('skills.xml', skills);

    //   zip
    //     .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    //     .pipe(fs.createWriteStream(output))
    //     .on('finish', function () {
    //       resolve(output);
    //     });
    // } catch (e) {
    //   context.errors.push(e);
    //   reject(e);
    // }
  });
}

module.exports = {
  buildSkillsModel,
};
