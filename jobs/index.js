const cleanOldFilesJob = require('./cleanOldFiles')

const registerAllJobs  = ()=>{
    cleanOldFilesJob()
}

module.exports = registerAllJobs 