const fs = require('fs')
const path = require('path')

const db = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../lib/database.json'), 'utf8')
)

const en = {}

for (const entry of db){
    const key = entry.match

    en[`${key}__explanation`] = entry.explanation
    en[`${key}__why`] = entry.why

    entry.fixes.forEach((fix,i) => {
        en[`${key}__fix_${i}`] = fix
    })
}

fs.mkdirSync(path.join(__dirname,'../locales'),{recursive:true})
fs.writeFileSync(
    path.join(__dirname,'../locales/en.json'),
    JSON.stringify(en,null,2),
    'utf8'
)

console.log(` Extracted ${Object.keys(en).length} strings to locales/en.json`)