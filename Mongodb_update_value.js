var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var connectoption = {useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000};
var Mongo = require('./mongodb_mod');
var fs = require('fs-extra');

var database = 'anadata';
var collection = 'alexa_rank';
var url = "mongodb://localhost:27017/" + database;

var path = "F:/alexa_05_01/crawl_title_des_14_2.txt";
var path_nottitle = "F:/alexa_31_12/notitle_crawler_2.txt";
var path_top_1m_05_01 = "F:/alexa_05_01/top-1m.txt";
var path_json = "C:/Users/Admin/Downloads/rank_archive.json";
var path_append_update_new_dm = "F:/alexa_05_01/new_domain_update.txt";
var path_folder = "F:/run_machine3/";
var path_move = "F:/run_move_machine3/";
var path_redirect = "F:/alexa_05_01/domain_redirect.txt";
var path_new_dm_18_01 = "F:/alexa_18_01_2021/new_domain_18_1.txt";
var path_ads = "F:/alexa_31_12/ads_clean/";

var config = {
    url: url,
    db: database,
    col: collection
};


function changeName() {
    Mongo.changeCollectionName(config, 'alexa_rank');
}

async function createIndex() {
    let res = await Mongo.createIndex(config, 'domain');
}
let keywords = new RegExp('hot');
let pattern = [
    {
        $match: {
            $or: [
                {domain: keywords},
                {description: keywords},
                {title: keywords}
            ]
        }
    },
    {$skip: 0},
    {$limit: 10}
];

async function get_paging() {
    let res = await Mongo.getPaging(config, pattern);
    console.log(res);
}
async function find_by_domain() {
    let res = await Mongo.find_by_domain(config, 'youtube');
    console.log(res);
    return res;
}

async function getData() {
//    let data_ = await fs.readFileSync(path, {encoding: "utf-8"}).toString().split(/\r?\n/);
    let data_ = await fs.readdirSync(path_ads);
    return data_;
}
getData().then((res, err) => {
    let start = new processor(res, 5).execute();
});

class processor {
    constructor(urls, limit) {
        this.urls = urls;
        this.limit = limit;
    }
    executeAsync(coll, index, limit) {
        if (index >= this.urls.length) { //index vuot qua danh sach
            return sleep(0);
        }
        var endIndex = index + limit; //xac dinh diem cuoi
        if (endIndex > this.urls.length) {
            endIndex = this.urls.length;
        }
        var me = this;
        return new Promise(async function (resolve, reject) {
            var number_proceses = endIndex - index;
            var process_count = 0;
            for (let i = index; i < endIndex; i++) {
                me.process_url(coll, me.urls[i], function () {
                    process_count++;
                });
            }
            while (process_count < number_proceses) { //doi xu ly xong
                await me.sleep(0);
            }
            resolve();
        });
    }

    async execute() {
        let db = await MongoClient.connect(config.url, connectoption);
        let dbo = await db.db(config.db);
        let coll = await dbo.collection(config.col);
        for (let i = 0; i < this.urls.length; i += this.limit) {
            await this.executeAsync(coll, i, this.limit);
            await this.sleep(100);
        }
        db.close();
    }

    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
    async process_url(coll, term, callback) {
        console.log(term);
        /*
         let pub = await fs.readFileSync(path_ads + term, {encoding: 'utf-8'});
         let res = await Mongo.upload_by(coll, {domain: term}, {adscode: pub});
         setTimeout(function () {
         callback();
         }, 50);
         */
        /*
         let obj = {};
         obj.domain = term;
         obj.dataset = data_;
         let res = await Mongo.insertItems(coll, config, obj);
         if (res) {
         fs.move(path_folder + term, path_move + term, function (err) {
         if (err) {
         console.log('err move');
         }
         console.log('movethanhcong:', term);
         })
         }
         setTimeout(function () {
         callback();
         }, 100);
         
         
         let obj = await base_data(term);
         console.log(obj);
         let res = await Mongo.find_by_domain(coll, config, obj.domain);
         if (!res) {
         fs.appendFileSync(path_append_update_new_dm, JSON.stringify(obj) + "\n", {encoding: "utf-8", flag: "a+"});
         }
         
         setTimeout(function () {
         callback();
         }, 100); 
         
         */
    }
}

function analytic_title_des(obj) {
    let new_ob = {}, new_data = {};
    if (obj.title) {
        new_ob.title = obj.title.trim();
    } else {
        fs.appendFileSync(path_nottitle, obj.domain + "\n", {encoding: 'utf-8', flag: "a+"});
        new_ob.title = '';
    }
    if (obj.description) {
        new_ob.description = obj.description.trim();
    } else {
        new_ob.description = '';
    }
    new_data.value = new_ob;
    new_data.domain = {domain: obj.domain};
    return new_data;
}

function analytic_data(obj) {
    if (obj.location == "http://127.0.0.1") {
        obj.location = "http://" + obj.domain;
    }
    let check_redirect = obj.location.includes(obj.domain);
    let new_ob = {};
    let new_data = {};
    if (check_redirect) {
        new_ob.original_domain = obj.location;
        new_ob.status = 1;
        new_ob.redirect_domain = null;
    } else {
        new_ob.original_domain = 'http://' + obj.domain;
        new_ob.redirect_domain = obj.location;
        new_ob.status = 2;
    }
    new_ob.title = null;
    new_ob.description = null;
    new_ob.main_domain = null;
    new_ob.domain_group = null;
    new_ob.last_rank = null;
    new_ob.visit = null;
    new_ob.visityear = null;
    new_ob.category = null;
    new_ob.whoisdate = null;
    new_ob.group = 1;
    new_ob.tag = null;
    new_ob.adscode = null;
    new_ob.last_update = null;
    new_ob.status_update = 1;
    new_ob.modified_date = getDateTime();
    new_data.domain = {domain: obj.domain};
    new_data.value = new_ob;

    return new_data;
}

async function update_mongo(coll, query_find, query_update) {
    let data_ = await Mongo.upload_by(coll, query_find, query_update);
    retunrn(data_);
}

function base_data(arr_) {
    let baseArr = arr_.split(",");
    let obj = {};
    obj.rank = baseArr[0].trim();
    obj.domain = baseArr[1].trim();
    return obj;
}
function getDateTime() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    if (month.toString().length == 1) {
        month = '0' + month;
    }
    if (day.toString().length == 1) {
        day = '0' + day;
    }
    if (hour.toString().length == 1) {
        hour = '0' + hour;
    }
    if (minute.toString().length == 1) {
        minute = '0' + minute;
    }
    if (second.toString().length == 1) {
        second = '0' + second;
    }
    var dateTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    return dateTime;
}
