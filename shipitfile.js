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
    staging: {
      servers: 'root@172.104.251.14'
    }
  });

  shipit.blTask('npm:install', async () => {
    await shipit.remote(`cd ${shipit.releasePath} && npm install`);
  })

  shipit.on('init', function () {
    shipit.log('---------------1------------------');
  });

  shipit.on('fetched', function () {
    shipit.log('---------------2------------------');
  });

  shipit.on('updated', function () {
    shipit.log('---------------3------------------');
    shipit.start('npm:install')
  });

  shipit.on('published', function () {
    shipit.log('---------------4------------------');
  });

  shipit.on('cleaned', function () {
    shipit.log('---------------5------------------');
  });

  shipit.on('finish', function () {
    shipit.log('---------------6------------------');
  });

}