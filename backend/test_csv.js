const XLSX = require('xlsx');

const csvData = Buffer.from('Registration Number,Combination,Name\n1234,COMB1,John\n 5678 ,COMB2,Jane\n');
const wb = XLSX.read(csvData, { type: 'buffer' });
const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

console.log('Parsed JSON:', json);

for (const row of json) {
    let regNum;
    for (const key of Object.keys(row)) {
        const cleanKey = key.trim().toLowerCase();
        if (['registration number', 'regnumber', 'reg no', 'registration no'].includes(cleanKey)) {
            regNum = row[key];
            break;
        }
    }
    console.log('Found regNum:', regNum);
}
