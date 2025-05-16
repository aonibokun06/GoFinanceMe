// scripts/generatePages.js
// Usage: node scripts/generatePages.js
const fs = require('fs')
const path = require('path')

// list of all the components from your routes table
const components = [
  'LoginPage',
  'RegisterPage',
  'ProfilePage',
  'RequestWizardStep1',
  'RequestWizardStep2',
  'DashboardPage',
  'RequestsListPage',
  'RequestDetailPage',
  'TransactionsPage',
  'SettingsPage',
]

const outDir = path.resolve(__dirname, '../src/pages')

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

components.forEach((name) => {
  const filePath = path.join(outDir, `${name}.jsx`)
  if (fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${name}.jsx (already exists)`)
    return
  }

  const content = `import React from 'react'

/**
 * ${name}
 * (path: ${name === 'RequestDetailPage' ? '/requests/:requestId' : 
     name === 'RequestsListPage' ? '/requests' :
     name === 'RequestWizardStep1' ? '/request' :
     name === 'RequestWizardStep2' ? '/request/details' :
     name === 'LoginPage' ? '/login' :
     name === 'RegisterPage' ? '/register' :
     name === 'ProfilePage' ? '/profile' :
     name === 'DashboardPage' ? '/dashboard' :
     name === 'TransactionsPage' ? '/transactions' :
     name === 'SettingsPage' ? '/settings' :
     '/'
   } )
 */
const ${name} = () => {
  return (
    <div>
      <h1>${name}</h1>
      {/* TODO: implement */}
    </div>
  )
}

export default ${name}
`

  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`✅ Created ${name}.jsx`)
})