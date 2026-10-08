export function dailyCourseManifest(files, read, now = Date.now()) {
  const lessons = [];
  for (const file of files) {
    const match = /^akademia\/kurscodzienny\/dzien-(\d+)\.html$/.exec(file.replaceAll('\\','/'));
    if (!match) continue;
    const number = Number(match[1]);
    if (number<1 || number>2009) continue;
    const title = (/<title>([\s\S]*?)<\/title>/i.exec(read(file))?.[1] || `Dzień ${number}`).replace(/<[^>]*>/g,'').trim().slice(0,300);
    const availableAt = new Date(Date.UTC(2026,9,number)).toISOString();
    if (Date.parse(availableAt)>now) continue;
    lessons.push({number,title,availableAt,url:`https://polskieradio.cc/akademia/kurscodzienny/dzien-${String(number).padStart(2,'0')}`});
  }
  return {version:1,lessons:lessons.sort((a,b)=>a.number-b.number)};
}
