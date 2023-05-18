const batchConfig = global.globalRequire('batchjob/config');
const {Database} = global.globalRequire('batchjob/database')

class GnuboardHelper {

  constructor(){
    this.database = new Database(batchConfig);
  }

  static build() {
    return new GnuboardHelper();
  }

  async createBoardTable(id){

    let createSql = `
    CREATE TABLE IF NOT EXISTS g5_write_${id} (
      wr_id int(11) NOT NULL AUTO_INCREMENT,
      wr_num int(11) NOT NULL DEFAULT '0',
      wr_reply varchar(10) NOT NULL,
      wr_parent int(11) NOT NULL DEFAULT '0',
      wr_is_comment tinyint(4) NOT NULL DEFAULT '0',
      wr_comment int(11) NOT NULL DEFAULT '0',
      wr_comment_reply varchar(5) NOT NULL,
      ca_name varchar(255) NOT NULL,
      wr_option set('html1','html2','secret','mail') NOT NULL,
      wr_subject varchar(255) NOT NULL,
      wr_content text NOT NULL,
      wr_seo_title varchar(255) NOT NULL DEFAULT '',
      wr_url text NOT NULL DEFAULT '',
      wr_link1 text NOT NULL DEFAULT '',
      wr_link2 text NOT NULL DEFAULT '',
      wr_link1_hit int(11) NOT NULL DEFAULT '0',
      wr_link2_hit int(11) NOT NULL DEFAULT '0',
      wr_hit int(11) NOT NULL DEFAULT '0',
      wr_good int(11) NOT NULL DEFAULT '0',
      wr_nogood int(11) NOT NULL DEFAULT '0',
      mb_id varchar(20) NOT NULL,
      wr_password varchar(255) NOT NULL,
      wr_name varchar(255) NOT NULL,
      wr_email varchar(255) NOT NULL,
      wr_homepage varchar(255) NOT NULL,
      wr_datetime datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
      wr_file tinyint(4) NOT NULL DEFAULT '0',
      wr_last varchar(19) NOT NULL,
      wr_ip varchar(255) NOT NULL,
      wr_facebook_user varchar(255) NOT NULL,
      wr_twitter_user varchar(255) NOT NULL,
      wr_1 varchar(255) NOT NULL,
      wr_2 varchar(255) NOT NULL,
      wr_3 varchar(255) NOT NULL,
      wr_4 varchar(255) NOT NULL,
      wr_5 varchar(255) NOT NULL,
      wr_6 varchar(255) NOT NULL,
      wr_7 varchar(255) NOT NULL,
      wr_8 varchar(255) NOT NULL,
      wr_9 varchar(255) NOT NULL,
      wr_10 varchar(255) NOT NULL,
      PRIMARY KEY (wr_id),
      KEY wr_seo_title (wr_seo_title),
      KEY wr_num_reply_parent (wr_num,wr_reply,wr_parent),
      KEY wr_is_comment (wr_is_comment,wr_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    `;

    await this.conn.query(createSql);
    console.log(` ${cateId} insert done ! `)

  }

  async addBoard(category){

    try {

      if(this.database.initialized){

        let boardTemplate = require('./board.json')

        const cateId = category.id;
        const groupId = category.groupId;
        const cateName = category.name;

        let boardData = Object.assign({}, boardTemplate, {
          bo_table: cateId
          , gr_id: groupId
          , bo_subject: cateName
        })

        let keys = Object.keys(boardData)
        let values = Object.values(boardData)

        let columns = keys.join(', ')
        let columnValues = keys.map(_=>'?').join(', ')

        let sql = ` insert into g5_board (${columns}) values (${columnValues}) `;

        this.conn = await this.database.beginTransaction();

        let result = await this.conn.query (sql, values);

        if(result.affectedRows < 1){
          await this.conn.rollback();
        } else {
          await this.createBoardTable(cateId)

          await this.conn.commit();
        }
      }

    } catch(err){
      console.error(err);
    }finally {
      this.database.close();
    }
  }

  async getBoards(){

  }

  async addArticle(boardId, arg){

    try {

      await this.database.init();

      if(this.database.initialized){

        let articleTemplate = require('./article.json')

        let boardData = Object.assign({}, articleTemplate, arg)

        let keys = Object.keys(boardData)
        let values = Object.values(boardData)

        let columns = keys.join(', ')
        let columnValues = keys.map(_=>'?').join(', ')

        let sql = ` insert into g5_write_${boardId} (${columns}) values (${columnValues}) `;

        console.log(`\t gnu insert`);

        let insertResult = await this.database.insert(sql, values);
        let boardUpdate = await this.database.execute(` update g5_board set bo_count_write = (select count(*) from g5_write_${boardId}) where bo_table = '${boardId}' `);

        let insertedId = insertResult.insertId;
        await this.database.execute(` update g5_write_${boardId} set wr_parent = ${insertedId} where wr_id = ${insertedId} `);
        console.log(`\t gnu board new insert`);
        let boardNewSql = `INSERT INTO g5_board_new(bo_table, wr_id, wr_parent, bn_datetime, mb_id, wr_hit, wr_comment) VALUES (?,?,?,?,?, 0, 0) `
        await this.database.insert(boardNewSql, [boardId, insertedId, insertedId, arg.wr_datetime, 'admin']);
        console.log(`\t gnu ${insertedId}, board updated : ${boardUpdate.affectedRows}`);

      }

    } catch(err){
      console.error(err);
    } finally {
      await this.database.close();
    }

  }

  async close(){
    await this.database.close();
  }

  async getArticles(){

  }


}

module.exports = {
  GnuboardHelper
}
