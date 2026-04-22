const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'mockData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace standard arrays with empty arrays
const arraysToClear = [
  'mockThreats',
  'mockEmails',
  'mockReports',
  'mockTeamMembers',
  'mockApiKeys',
  'mockInvoices'
];

arraysToClear.forEach(arr => {
  const regex = new RegExp(`export const ${arr}(.*?)= \\[([\\s\\S]*?)\\]\\n`, 'g');
  content = content.replace(regex, `export const ${arr}$1= []\n`);
});

// Update chartData
const chartDataRegex = /export const chartData = \[([\s\S]*?)\]\n/;
content = content.replace(chartDataRegex, `export const chartData = [\n  { date: 'Aujourd\\'hui', emails: 0, threats: 0 },\n]\n`);

// Update threatTypesData
const threatTypesRegex = /export const threatTypesData = \[([\s\S]*?)\]\n/;
content = content.replace(threatTypesRegex, `export const threatTypesData = [\n  { name: 'Aucune donnée', value: 1, color: '#e5e7eb' },\n]\n`);

// Update threatsByDayData
const threatsByDayRegex = /export const threatsByDayData = \[([\s\S]*?)\]\n/;
content = content.replace(threatsByDayRegex, `export const threatsByDayData = [\n  { day: 'Lun', phishing: 0, malware: 0, bec: 0, spam: 0, spear: 0 },\n  { day: 'Mar', phishing: 0, malware: 0, bec: 0, spam: 0, spear: 0 },\n  { day: 'Mer', phishing: 0, malware: 0, bec: 0, spam: 0, spear: 0 },\n  { day: 'Jeu', phishing: 0, malware: 0, bec: 0, spam: 0, spear: 0 },\n  { day: 'Ven', phishing: 0, malware: 0, bec: 0, spam: 0, spear: 0 },\n  { day: 'Sam', phishing: 0, malware: 0, bec: 0, spam: 0, spear: 0 },\n  { day: 'Dim', phishing: 0, malware: 0, bec: 0, spam: 0, spear: 0 },\n]\n`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Mock data cleared successfully!');
