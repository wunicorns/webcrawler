const axios = require('axios')

const dbm = require('./database/mariadb')
const config = require('./config')

const logger = require('./utility/logger');

const cron = require('node-cron');

global.globalRequire = function(libPath) {
  return require(path.join(__dirname + '/' + libPath))
}

/*
# ┌────────────── second (optional)
# │ ┌──────────── minute
# │ │ ┌────────── hour
# │ │ │ ┌──────── day of month
# │ │ │ │ ┌────── month
# │ │ │ │ │ ┌──── day of week
# │ │ │ │ │ │
# │ │ │ │ │ │
# * * * * * *

cron.schedule('* * * * * *', () => {
    console.log('running a task every minute');
});

*/

async function cacheRefresh(boTable){
    config.init();
    const website = global.config.website;
    await axios.get(website + '/cache.php?table=' + boTable);
  }
  
  async function dailyBaby(){
    logger.info(' running job:daily !!!!! ')
    const job = require('./batchjob/daily.js');
    const domain = 'https://www.mimint.co.kr';
    const urls = ['/baby_n/',];
    await job.daily(domain, urls);
    logger.info(' job:daily done !!!!! ');
  
    await cacheRefresh('baby');
    logger.info(' job:daily cache refresh done !!!!! ');
  };
  
async function dailyTalk(){
    logger.info(' running job:daily !!!!! ')
    const job = require('./batchjob/daily.js');
    const domain = 'https://www.mimint.co.kr';
    const urls = ['/talk/',];
    await job.daily(domain, urls);
    logger.info(' job:daily done !!!!! ')
  
    await cacheRefresh('talk');
    logger.info(' job:daily cache refresh done !!!!! ');
};
  
  async function dailyLove(){
    logger.info(' running job:daily !!!!! ')
    const job = require('./batchjob/daily.js');
    const domain = 'https://www.mimint.co.kr';
    const urls = ['/love_n/',];
    await job.daily(domain, urls);
    logger.info(' job:daily done !!!!! ')
  
    await cacheRefresh('love');
    logger.info(' job:daily cache refresh done !!!!! ');
  };
  
  async function dailyLife(){
    logger.info(' running job:daily !!!!! ')
    const job = require('./batchjob/daily.js');
    const domain = 'https://www.mimint.co.kr';
    const urls = ['/life/',];
    await job.daily(domain, urls);
    logger.info(' job:daily done !!!!! ')
  
    await cacheRefresh('life');
    logger.info(' job:daily cache refresh done !!!!! ');    
  };
  
  async function dailyFood(){
    logger.info(' running job:daily !!!!! ')
    const job = require('./batchjob/daily.js');
    const domain = 'https://www.mimint.co.kr';
    const urls = ['/food_n/',];
    await job.daily(domain, urls);
    logger.info(' job:daily done !!!!! ')
  
    await cacheRefresh('food');
    logger.info(' job:daily cache refresh done !!!!! ');
  };
  
  async function dailyMedia(){
    logger.info(' running job:daily !!!!! ')
    const job = require('./batchjob/daily.js');
    const domain = 'https://www.mimint.co.kr';
    const urls = ['/bbs/list.asp?strBoardID=media',];
    await job.daily(domain, urls);
    logger.info(' job:daily done !!!!! ')
  
    await cacheRefresh('media');
    logger.info(' job:daily cache refresh done !!!!! ');
  };
  
cron.schedule('0 10 1 * * *', async () => {

    console.log('running job !!');

    await dailyBaby();
    await dailyTalk();
    await dailyLove();
    await dailyLife();
    await dailyFood();
    await dailyMedia();
    
    console.log('done !!');

});  