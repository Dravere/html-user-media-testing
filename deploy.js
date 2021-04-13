const { exec } = require('child_process');

async function execute(cmd) {
  return new Promise((resolve, reject) => {
    console.log(cmd);
    exec(cmd, (err, stdout, stderr) => {
      console.log(stdout);
      if(err) {
        console.log(stderr);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function run() {
  await execute('ng build --base-href /html-user-media-testing/ --prod');
  await execute('git add dist');
  await execute('git commit -m "GitHub Pages Deploy Version ' + new Date().toISOString() + '"');
  await execute('git push origin master');
  await execute('git subtree push --prefix dist/HtmlUserMediaTesting origin gh-pages');
}

run().then(() => {
  console.log("Deployed successfully!");
}).catch((err) => {
  console.log("Deployment failed: ", err);
});
