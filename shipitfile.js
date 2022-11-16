module.exports = shipit => {
  // Load shipit-deploy tasks
  require('shipit-deploy')(shipit)

  shipit.initConfig({
    default: {
      deployTo: '/Yoga-Style-eShop-backend',
      repositoryUrl: 'git@github.com:RalitsaLefterova/Yoga-Style-eShop-backend.git',
      keepReleases: 5,
      shared: {
        overwrite: true,
        dirs: ['node_modules']
      }
    },
    staging: {
      servers: 'root@172.104.251.14',
    }
  })
}