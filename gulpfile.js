const path = require('path')
const gulp = require('gulp')
const qs = require('querystring')

const axios = require('axios')
// const cheerio = require('cheerio')

const dbm = require('./database/mariadb')
const config = require('./config')

const logger = require('./utility/logger');

global.globalRequire = function(libPath) {
  return require(path.join(__dirname + '/' + libPath))
}

function clean(cb){
  console.log(`clean run`);
  cb();
}

/*
* console print contents groups
*/
// gulp.task('category', async function  (cb){
//
//   config.init();
//
//   dbm.init().then(async ()=>{
//
//     let result = await dbm.sequelize.query(' select opt1, count(*) from contents where status = 1 group by opt1 '
//       , { type: dbm.sequelize.QueryTypes.SELECT, raw: true });
//
//     for(const row of result){
//       const cateId = row.opt1.split("=")[1];
//       if(!cateId || !isNaN(cateId)) continue;
//
//       console.log(cateId);
//
//     }
//
//     cb();
//
//   });
//
//   console.log(`category run`);
//
// });

// gulp.task('articles', async function(cb){
//
//   logger.info('start !!! ');
//
//   config.init();
//
//   await dbm.init();
//
//   const service = require('./service/contentsCrawler')
//
//   let contentsList = await dbm.sequelize.query(' select id from contents where status <> 5 '
//     , { type: dbm.sequelize.QueryTypes.SELECT, raw: true });
//
//   for(const row of contentsList){
//
//     try {
//
//       let content = await dbm.Contents.findOne({
//         where: { id: row.id }
//       });
//
//       let articleCount = await dbm.Articles.count({
//         where: {
//           url: content.url
//         }
//       });
//
//       if(articleCount < 1) {
//         try {
//           let inserted = await dbm.Articles.create({
//             url: content.url
//             , name: content.name
//             , title: content.title
//             , opt1: content.opt1
//             , opt2: content.opt2
//             , opt3: content.opt3
//             , opt4: content.opt4
//             , opt5: content.opt5
//             , content: await service._parseContent(content)
//             , status: 1
//             , lastmod: content.lastmod
//           });
//
//           logger.info(`\t success @ contents :: ${inserted.id}, ${inserted.opt1} `);
//
//           content.status = 5;
//           content.save();
//
//         } catch(err) {
//
//           logger.error(err, `\t error -- @ contents :: ${content.id}, ${content.opt1} `);
//
//           content.status = 6;
//           content.save();
//         }
//       }
//
//     }catch(err){
//       console.error(err);
//     }
//   }
//
//   cb();
//
// });

gulp.task('articles:multi', async function(cb){

    logger.info(' running articles:multi !!!!! ')

    const job = require('./batchjob/batch.js');

    await job.start();

    logger.info(' job:daily done !!!!! ')

    cb();

});

gulp.task('job:daily', async function(cb){

  logger.info(' running job:daily !!!!! ')

  const job = require('./batchjob/daily.js');

  const domain = 'https://www.mimint.co.kr';

  const urls = [
    '/talk/',
    '/food_n/',
    '/baby_n/',
    '/love_n/',
    '/life/'
  ];

  await job.daily(domain, urls);

  logger.info(' job:daily done !!!!! ')

  cb();

});


async function cacheRefresh(boTable){
  config.init();
  const website = global.config.website;
  await axios.get(website + '/cache.php?table=' + boTable);
}

gulp.task('job:daily:function', async function(cb){
  cacheRefresh('beauty');
  cb();
});

gulp.task('job:daily:baby', async function(cb){
  logger.info(' running job:daily !!!!! ')
  const job = require('./batchjob/daily.js');
  const domain = 'https://www.mimint.co.kr';
  const urls = ['/baby_n/',];
  await job.daily(domain, urls);
  logger.info(' job:daily done !!!!! ');

  await cacheRefresh('baby');
  logger.info(' job:daily cache refresh done !!!!! ');
  cb();
});

gulp.task('job:daily:talk', async function(cb){
  logger.info(' running job:daily !!!!! ')
  const job = require('./batchjob/daily.js');
  const domain = 'https://www.mimint.co.kr';
  const urls = ['/talk/',];
  await job.daily(domain, urls);
  logger.info(' job:daily done !!!!! ')

  await cacheRefresh('talk');
  logger.info(' job:daily cache refresh done !!!!! ');
  cb();
});

gulp.task('job:daily:love', async function(cb){
  logger.info(' running job:daily !!!!! ')
  const job = require('./batchjob/daily.js');
  const domain = 'https://www.mimint.co.kr';
  const urls = ['/love_n/',];
  await job.daily(domain, urls);
  logger.info(' job:daily done !!!!! ')

  await cacheRefresh('love');
  logger.info(' job:daily cache refresh done !!!!! ');
  cb();
});

gulp.task('job:daily:life', async function(cb){
  logger.info(' running job:daily !!!!! ')
  const job = require('./batchjob/daily.js');
  const domain = 'https://www.mimint.co.kr';
  const urls = ['/life/',];
  await job.daily(domain, urls);
  logger.info(' job:daily done !!!!! ')

  await cacheRefresh('life');
  logger.info(' job:daily cache refresh done !!!!! ');
  cb();
});

gulp.task('job:daily:food', async function(cb){
  logger.info(' running job:daily !!!!! ')
  const job = require('./batchjob/daily.js');
  const domain = 'https://www.mimint.co.kr';
  const urls = ['/food_n/',];
  await job.daily(domain, urls);
  logger.info(' job:daily done !!!!! ')

  await cacheRefresh('food');
  logger.info(' job:daily cache refresh done !!!!! ');
  cb();
});

gulp.task('job:daily:media', async function(cb){
  logger.info(' running job:daily !!!!! ')
  const job = require('./batchjob/daily.js');
  const domain = 'https://www.mimint.co.kr';
  const urls = ['/bbs/list.asp?strBoardID=media',];
  await job.daily(domain, urls);
  logger.info(' job:daily done !!!!! ')

  await cacheRefresh('media');
  logger.info(' job:daily cache refresh done !!!!! ');
  cb();
});






gulp.task('crawling:manual', async function(cb){
  logger.info(' single crawling !!!!! ')
  config.init();
  const service = require('./service/contentsCrawler')
  let urlList = [];
  process.argv.forEach((val, index) => {
    logger.info(`${index}: ${val}`);
    if(val.startsWith("--url")){
      urlList.push(val.substring(val.indexOf("=") + 1));
    }
  });

  try {

    for(const url of urlList){
      logger.info(`crawl ::: ${url}`);
      await service.manual(url);
    }

  }catch(err){
    logger.error(err);
  }finally {
    cb();
  }

});

gulp.task('image:download', async function(cb){
  config.init();
  const siteRoot = global.config.siteRoot;
  // const imgRoot = '/tmp';
  const service = require('./service/contentsCrawler')
  let imageList = [];
  process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
    if(val.startsWith("--file")){
      imageList.push(val.split("=")[1]);
    }
  });
  const request = axios.create();
  request.defaults.timeout = 5000;

  for(const imgSrc of imageList){
    logger.info(`image crawl ::: ${imgSrc}`);
    await service.extractImage(request, siteRoot, imgSrc);
  }
  cb();
});


gulp.task('job:default', async function(cb){
  logger.info("default job nothing!")

  process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
  });

  cb();
})

exports.default = gulp.series(['job:default']);
