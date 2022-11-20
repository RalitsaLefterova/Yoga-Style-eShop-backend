module.exports = shipit => {
  // Load shipit-deploy tasks
  require('shipit-deploy')(shipit);
  require('shipit-shared')(shipit);

  shipit.initConfig({
    default: {
      branch: 'main',
      deployTo: '/root/Yoga-Style-eShop-backend',
      repositoryUrl: 'git@github.com:RalitsaLefterova/Yoga-Style-eShop-backend.git',
      keepReleases: 5,
      shallowClone: true,
      shared: {
        overwrite: true,
        dirs: ['node_modules']
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

  shipit.blTask('npm:install', async () => {
    await shipit.remote(`cd ${shipit.releasePath} && npm install`);
  })

  shipit.blTask('server:copyConfig', async () => {
    shipit.log('copying ecosystem.config.js file :: >>>>> ')
    await shipit.local(`scp mnt/d/Projects-wip/Yoga-Style-eShop-backend/ecosystem.config.js root@172.104.251.14:/${shipit.releasePath}`);
  })

  // shipit.blTask('server:start', async () => {
  //   await shipit.remote(`pm2 delete -s api-yoga-style || :`);
  //   const command = `pm2 start --name api-yoga-style ${shipit.currentPath}/src/index.js ecosystem.config.js --env production`;
  //   await shipit.remote(`cd ${shipit.config.deployTo} && ${command}`);
  // })

  // shipit.blTask('server:restart', async () => {
  //   const command = 'pm2 restart all';
  //   await shipit.remote(`cd ${shipit.config.deployTo} && ${command}`);
  // })

  shipit.on('init', function () {
    shipit.log('---------------1------------------');
  });

  shipit.on('fetched', function () {
    shipit.log('---------------2------------------');
  });

  shipit.on('updated', function () {
    shipit.log('---------------3------------------');
    shipit.start('npm:install');
    shipit.start('server:copyConfig');
  });

  shipit.on('published', function () {
    shipit.log('---------------4------------------');
    // shipit.start('server:restart');
  });

  shipit.on('cleaned', function () {
    shipit.log('---------------5------------------');
  });

  shipit.on('finish', function () {
    shipit.log('---------------6------------------');
  });

}