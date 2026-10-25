const fs = require('fs');
const path = require('path');

const modules = [
  { name: 'app', pkg: '@firebase/app' },
  { name: 'auth', pkg: '@firebase/auth' },
  { name: 'firestore', pkg: '@firebase/firestore' },
  { name: 'storage', pkg: '@firebase/storage' },
];

modules.forEach(({ name, pkg }) => {
  const targetDir = path.join(__dirname, '..', 'node_modules', 'firebase', name, 'dist');
  if (fs.existsSync(targetDir)) {
    const targetFile = path.join(targetDir, 'index.mjs');
    if (!fs.existsSync(targetFile)) {
      fs.writeFileSync(targetFile, `export * from '${pkg}';\n`, 'utf8');
      console.log(`[patch-firebase] Created ${name}/dist/index.mjs`);
    }
  }
});
