module.exports = shipit => {

  require('shipit-deploy')(shipit)
  require('shipit-shared')(shipit)
  const fs = require('fs')

  const appName = 'api-yoga-style';

  shipit.initConfig({
    default: {
      branch: 'main',
      deployTo: '/root/Yoga-Style-eShop-backend',
      repositoryUrl: 'git@github.com:RalitsaLefterova/Yoga-Style-eShop-backend.git',
      keepReleases: 5,
      // shared: {
      //   overwrite: true,
      //   dirs: ['node_modules']
      // }
      shared: {
        dirs: [
          {
            path: 'node_modules',
            overwrite: true,
            chmod: '-R 777',
          },
          {
            path: 'uploads/collections',
            overwrite: true,
            chmod: '-R 777',
          },
          {
            path: 'uploads/products',
            overwrite: true,
            chmod: '-R 777',
          }
        ]
      }
    },
    dev: {
      branch: 'development',
      servers: 'root@172.104.251.14'
    },
    staging: {
      servers: 'root@172.104.251.14'
    }
  });

  const path = require('path');
  const ecosystemFilePath = path.join(
    shipit.config.deployTo,
    'shared',
    'ecosystem.config.js'
  );
  const uploadsFolderPath = path.join(
    shipit.config.deployTo,
    'shared',
    'uploads'
  );

  shipit.blTask('npm:install', async () => {
    await shipit.remote(`cd ${shipit.releasePath} && nvm use && npm install`);
  })

  shipit.blTask('copy-config', async () => {
    shipit.log('copying ecosystem.config.js file :: >>>>> ')
    // await shipit.local(`scp /mnt/d/Projects-wip/Yoga-Style-eShop-backend/ecosystem.config.js root@172.104.251.14:/${shipit.releasePath}`);
    await shipit.copyToRemote('/mnt/d/Projects-wip/Yoga-Style-eShop-backend/ecosystem.config.js', ecosystemFilePath);
  })

  shipit.blTask('pm2-server', async () => {
    await shipit.remote(`pm2 delete -s ${appName} || :`);
    await shipit.remote(`pm2 start ${shipit.currentPath}/src/index.js -n ${appName} ${ecosystemFilePath} --env production`);
  })

  shipit.blTask('create-symlink', async () => {
    const targetDirectory = uploadsFolderPath // The directory we want to create a symlink to
    shipit.log(`uploadsFolderPath: ${uploadsFolderPath}`)
    shipit.log(`shipit.releasePath: ${shipit.releasePath}`)

    // Check if the target directory exists
    try {
      if (!fs.existsSync(targetDirectory)) {
        shipit.log(`Target directory does not exist: ${targetDirectory}`)
        return // Exit the task if the directory doesn't exist
      }
      // Create a symbolic link
      await shipit.remote(`ln -nfs ${uploadsFolderPath} ${shipit.releasePath}`)
      shipit.log(`Symbolic link created: ${uploadsFolderPath} -> ${shipit.releasePath}`)
    } catch (error) {
      shipit.log(`Error creating symbolic link: ${error.message}`)
    }
    // await shipit.remote(`ln -nfs ${uploadsFolderPath} ${shipit.releasePath}`)
  })

  // shipit.blTask('server:restart', async () => {
  //   const command = 'pm2 restart all';
  //   await shipit.remote(`cd ${shipit.config.deployTo} && ${command}`);
  // })

  shipit.on('init', function () {
    shipit.log('--------------- 1 Init------------------');
  });

  shipit.on('fetched', function () {
    shipit.log('--------------- 2 Fetched ------------------');
  });

  shipit.on('updated', function () {
    shipit.log('--------------- 3 Updated ------------------');
    shipit.start('npm:install', 'copy-config');
    shipit.start('create-symlink');
  });

  shipit.on('published', function () {
    shipit.log('--------------- 4 Published ------------------');
  });

  shipit.on('cleaned', function () {
    shipit.log('--------------- 5 Cleaned ------------------');
    shipit.start('pm2-server');
  });

}