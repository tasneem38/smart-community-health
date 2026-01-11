export function formatSymptomSMS(report: any) {
  const name = report.name || 'NA';
  const age = report.age || 'NA';
  const symptomCodes = (report.symptoms || []).join(',');
  const date = report.onset_date || new Date().toISOString().slice(0,10);
  const latlon = report.location ? `${report.location.latitude.toFixed(5)},${report.location.longitude.toFixed(5)}` : '0,0';
  const village = report.village || 'NA';
  // Example: SYM|name|age|code1,code2|date|lat,lon|village
  return `SYM|${name}|${age}|${symptomCodes}|${date}|${latlon}|${village}`;
}
