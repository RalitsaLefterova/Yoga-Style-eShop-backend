module.exports = shipit => {

  require('shipit-deploy')(shipit)
  require('shipit-shared')(shipit)
  const fs = require('fs')

  const appName = 'api-yoga-style'

  shipit.initConfig({
    default: {
      branch: 'main',
      servers: 'root@172.104.251.14',
      repositoryUrl: 'git@github.com:RalitsaLefterova/Yoga-Style-eShop-backend.git',
      keepReleases: 5,
      shared: {
        dirs: [
          {
            path: 'node_modules',
            overwrite: true,
            chmod: '-R 777',
          },
          {
            path: 'uploads',
            overwrite: true,
            chmod: '-R 777',
          }
        ]
      }
    },
    staging: {
      deployTo: '/root/Yoga-Style-eShop-backend-staging'
    },
    production: {
      deployTo: '/root/Yoga-Style-eShop-backend'
    }
  })

  const path = require('path');
  const ecosystemFilePath = path.join(
    shipit.config.deployTo,
    'shared',
    'ecosystem.config.js'
  )
  const uploadsFolderPath = path.join(
    shipit.config.deployTo,
    'shared',
    'uploads'
  )

  shipit.blTask('npm:install', async () => {
    await shipit.remote(`cd ${shipit.releasePath} && nvm use && npm install`)
  })

  shipit.blTask('copy-config', async () => {
    shipit.log('copying ecosystem.config.js file :: >>>>> ')
    // await shipit.local(`scp /mnt/d/Projects-wip/Yoga-Style-eShop-backend/ecosystem.config.js root@172.104.251.14:/${shipit.releasePath}`)
    await shipit.copyToRemote('/mnt/d/Projects-wip/Yoga-Style-eShop-backend/ecosystem.config.js', ecosystemFilePath)
  })

  shipit.blTask('pm2-server', async () => {
    await shipit.remote(`pm2 delete -s ${appName} || :`);
    await shipit.remote(`pm2 start ${shipit.currentPath}/src/index.js -n ${appName} ${ecosystemFilePath} --env production`)
  })

  // shipit.blTask('server:restart', async () => {
  //   const command = 'pm2 restart all'
  //   await shipit.remote(`cd ${shipit.config.deployTo} && ${command}`)
  // })

  shipit.on('init', function () {
    shipit.log('--------------- 1 Init------------------')
  })

  shipit.on('fetched', function () {
    shipit.log('--------------- 2 Fetched ------------------')
  })

  shipit.on('updated', function () {
    shipit.log('--------------- 3 Updated ------------------')
    shipit.start('npm:install', 'copy-config')
  })
  

  shipit.on('published', function () {
    shipit.log('--------------- 4 Published ------------------')
  })

  shipit.on('cleaned', function () {
    shipit.log('--------------- 5 Cleaned ------------------')
    shipit.start('pm2-server');
  }) 
}