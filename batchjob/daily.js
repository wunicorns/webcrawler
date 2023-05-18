// const cp = require('child_process');
// const numCPUs = require('os').cpus().length;

const dbm = require('../database/mariadb')
const config = require('../config')

const crawl = require('../utility/crawl');
const logger = require('../utility/logger');
const service = require('../service/contentsCrawler')

const {GnuboardHelper} = require('./service/gnuboard');

async function crawlingList (domain, linkMap){

    await dbm.init();

    try {

      for(k in linkMap){

        let links = linkMap[k];
        let remainCount = links.length;
        logger.info(`${k} :: count = ${remainCount}`);
        if(remainCount < 1) continue;

        for(const link of links){

          logger.info(`\t - ${link}`);

          const $ = await crawl.getDocument(domain + link);

          const trs = $("div.board_list_wrap tbody").find("tr");

          let subCount = trs.length;

          logger.info(`\t\t @ crawled :: ${subCount}`);

          for(const tr of trs){

            try {

              const childs = $(tr).find("td");
              const dt = childs[childs.length - 1].children[0].data;
              const aTag = $(childs[0].children.filter((el,i)=>el.name==='a')[0]);
              const url = domain + aTag.attr('href');

              let articleCount = await dbm.Articles.count({where: { url: url }});

              logger.info(`\t\t\t - ${url}`);
              logger.info(`\t\t\t\t ${subCount} - ${(articleCount > 0 ? "exist" : "new")} / ${aTag.text()} :: crawl`);

              if(articleCount > 0) {

              } else {

                const gnu = GnuboardHelper.build();

                try {

                  let value = await service.crawlContent({
                    url: url,
                    status: 1,
                    lastmod: new Date(dt)
                  });

                  let inserted = await dbm.Articles.create(value);
                  let article = await service.parseContent(inserted);

                  const cateId = value.opt1.split("=")[1];

                  logger.info(`\t\t\t\t - @ parsed remain :: ${subCount} ${url}`);

                  gnu.addArticle(cateId, {
                    wr_subject: article.title,
                    wr_content: article.content,
                    wr_link1: ' ',
                    wr_link2: ' ',
                    wr_url: article.url,
                    wr_datetime: article.lastmod
                  });

                  logger.info(`\t\t\t\t @ gnu added`);

                  inserted.status = 2;
                  inserted.content = article.content;
                  inserted.save();

                  logger.info(`\t\t\t\t :: ${article.id}, remain :: ${subCount}`);

                } catch(_err) {
                  logger.error(_err);
                } finally {
                  //await gnu.close();
                }

              }

              subCount--;

            } catch (error_2){
              logger.error(error_2);
            }
          }

          logger.info(`\t\t @ crawled :: done`);
        }

        logger.info(`\t\t @ links :: done`);
      }

      logger.info(`\t\t @ linkMap :: done`);

    } catch(error_1){
      logger.error(error_1);
    } finally {
      logger.info("@job:daily done");
    }

}

async function crawling (domain, linkMap){

    await dbm.init();

    try {

      for(k in linkMap){

        let links = linkMap[k];
        let remainCount = links.length;
        logger.info(`${k} :: count = ${remainCount}`);
        if(remainCount < 1) continue;

        for(const link of links){

          logger.info(`\t - ${link}`);

          const $ = await crawl.getDocument(domain + link);

          let viewLinks = $(".wrap_left").find("a").filter((_, tag)=>$(tag).attr("href").indexOf("bbs/view")>-1);
          viewLinks = Array.from(viewLinks.map((_, tag)=>$(tag).attr("href")));
          viewLinks = viewLinks.filter((l, i)=>viewLinks.indexOf(l)===i);

          let subCount = viewLinks.length;

          logger.info(`\t\t @ crawled :: ${subCount}`);

          for(const aLink of viewLinks){

            try {

              logger.info(`\t\t\t - ${aLink}`);

              const url = domain + aLink;

              let articleCount = await dbm.Articles.count({where: { url: url }});

              logger.info(`\t\t\t\t ${subCount} - ${(articleCount > 0 ? "exist" : "new")} / ${aLink} :: crawl`);

              if(articleCount > 0) {

              } else {

                const gnu = GnuboardHelper.build();

                try {

                  let value = await service.crawlContent({url: url, status: 1});
                  let inserted = await dbm.Articles.create(value);
                  let article = await service.parseContent(inserted);
                  
                  const cateId = value.opt1.split("=")[1];

                  logger.info(`\t\t\t\t - @ parsed remain :: ${subCount} ${url}`);

                  gnu.addArticle(cateId, {
                    wr_subject: article.title,
                    wr_content: article.content,
                    wr_link1: ' ',
                    wr_link2: ' ',
                    wr_url: article.url,
                    wr_datetime: value.lastmod
                  });

                  logger.info(`\t\t\t\t @ gnu added`);

                  inserted.status = 2;
                  inserted.content = article.content;
                  inserted.save();

                  logger.info(`\t\t\t\t :: ${article.id}, remain :: ${subCount}`);

                } catch(_err) {
                  console.log(195, _err)
                  logger.error(_err);
                } finally {
                  //await gnu.close();
                }

              }

              subCount--;

            } catch (error_2){
              logger.error(error_2);
            }
          }

          logger.info(`\t\t @ crawled :: done`);
        }

        logger.info(`\t\t @ links :: done`);
      }

      logger.info(`\t\t @ linkMap :: done`);

    } catch(error_1){
      logger.error(error_1);
    } finally {
      logger.info("@job:daily done");
    }

}

async function daily (domain, urls){

  logger.info('daily job start')

  config.init();

  const linkMap = {};
  for( const _url of urls ){
    logger.info(' crawl :: ' + _url);
    const $ = await crawl.getDocument(domain + _url);
    const lefLink = $(".wrap_left").find("a");

    let links = [];
    for(const a of lefLink){
      let href = $(a).attr("href");
      //let txt = $(a).text();
      if(href.indexOf("bbs/list")>-1){
        links.push(href);
      }
    }

    linkMap[_url] = links.filter((l, i)=>links.indexOf(l)===i);

  }

  await crawling(domain, linkMap);

}

module.exports = {
  daily
}
