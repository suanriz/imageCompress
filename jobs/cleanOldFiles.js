const cron = require('node-cron')

const fileStore = require('../service/fileStore')

const cleanOldFilesJob = ()=>{
    cron.schedule('0 0 * * *',
    async ()=> {
        await fileStore.cleanOldFiles()
    },
    { 
        noOverlap: true,
    });
}

module.exports = cleanOldFilesJob