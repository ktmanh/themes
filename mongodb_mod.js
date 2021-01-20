var fs = require('fs');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var connectoption = {useNewUrlParser: true, useUnifiedTopology: true, connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000};

let success = 'Success';
let error = 'Error';
let db = null;


/*
 *  ex: config = {
 *    url: "mongodb://localhost:27017/database",
 *    db: "database",
 *    col: "rank_archive"
 *  }
 */

/*
 * @param items is {} or []
 * ex: {domain: "google.com", 'rank: 1'}
 * @returns {}
 */
exports.insertItems = async function (/*coll, */config, items) {
    return new Promise(async function (resolve, reject) {
        try {
            db = await buildDb(config);
            let dbo = db.db(config.db);
            let coll = dbo.collection(config.col);
            items = convertItems(items);
            let insert_result = await coll.insertMany(items);
            db.close();
            resolve(insert_result);
        } catch (err) {
            if (db) {
                db.close();
            }
            reject(false);
        }
    });
}

/*
 * @param pattern is []
 * ex: pattern = [
 * {
 *  $match:{
 *      domain: "google.com"
 *  }
 * }
 * ]
 * @returns {}
 */

exports.getPaging = async function (config, pattern) {
    return new Promise(async function (resolve, reject) {
        try {
            db = await buildDb(config);
            let dbo = db.db(config.db);
            let coll = dbo.collection(config.col);
            let result = await coll.aggregate(pattern).toArray();
            db.close();
            resolve(result);
        } catch (err) {
            if (db) {
                db.close();
            }
            reject(err);
        }
    });
}
/*
 * @param domain is string
 * ex: domain = "google.com"
 * @returns {}
 */
exports.find_by_domain = async function (config, domain/*coll, domain*/) {
    return new Promise(async function (resolve, reject) {
        try {
            db = await buildDb(config);
            let dbo = db.db(config.db);
            let coll = dbo.collection(config.col);
            let res = await coll.findOne({domain: domain});
            resolve(res);
            db.close();
        } catch (err) {
            reject(err);
            throw err;
        }
    });
}
/*
 * ex pattern = {domain: "google.com"}
 * ex pattern = {domain: /google/} regex pattern
 * @returns int
 */

exports.getCount = async function (config, pattern) {
    return new Promise(async function (resolve, reject) {
        try {
            db = await buildDb(config);
            let dbo = db.db(config.db);
            let coll = dbo.collection(config.col);
            let result = await coll.find(pattern).count();
            db.close();
            resolve(result);
        } catch (err) {
            if (db) {
                db.close();
            }
            throw err;
        }
    });
}





/* 
 * @param is {}
 * ex: query_find = {
 *  domain: "google.com"
 * }
 * ex: query_update {
 *  rank: 10, title: "new title"
 * }
 * return { n: 1, nModified: 2, ok: 1 }
 * n: so tai lieu phu hop voi query
 * nModified: so tai lieu bi anh huong ( tuc la update bao nhieu thang )
 * ok: 1 thanh cong
 */
exports.upload_by = async function (coll/*config*/, query_find, query_update) {
    try {
//        db = await buildDb(config);
//        let dbo = db.db(config.db);
//        let coll = dbo.collection(config.col);
        let res = await coll.updateOne(query_find, {$set: query_update});
//        let res = coll.findOneAndUpdate({domain: "himalayanwritingretreat.com"}, {$set: {redirect_domain: '12345'}});
//        db.close();
//        return res.result;
    } catch (err) {
        if (db) {
            db.close();
        }
        throw err;
        //return false;
    }
}


/*
 * newName = string
 * ex: newName = "new_collection"
 */
exports.changeCollectionName = async function (config, newName) {
    try {
        db = await buildDb(config);
        let dbo = db.db(config.db);
        dbo.renameCollection(config.col, newName);
        db.close();
    } catch (err) {
        if (db) {
            db.close();
        }
        console.log(err);
    }
}



exports.createIndex = async function (config, indexField) {
    try {
        db = await buildDb(config);
        let dbo = db.db(config.db);
        let coll = dbo.collection(config.col);
        let res = await coll.createIndex({"domain": 1});
        db.close();
        return res;
    } catch (err) {
        if (db) {
            db.close();
        }
        console.log(err);
        throw err;
    }
}

/*
 * pattern = {}
 * ex: pattern = {
 *  domain: "google.com"
 * }
 * return {}
 */
exports.deleteOne = async function (config, pattern) {
    try {
        db = await buildDb(config);
        let dbo = db.db(config.db);
        let coll = dbo.collection(config.col);
        let result = await coll.deleteOne(pattern);
        db.close();
        return result;
    } catch (err) {
        if (db) {
            db.close();
        }
        throw err;
    }
}

exports.checkItem = async function (items) {
    return await convertItems(items);
}

function convertItems(items) {
    if (Array.isArray(items)) {
        return items;
    }
    return [items];
}
function getDbNameFromUrl(url) {
    let url_split = url.split("/");
    let db_name = url_split[url_split.length - 1];
    return db_name;
}
function buildDb(config) {
    return new Promise((resolve, reject) => {
        let db = MongoClient.connect(config.url, connectoption);
        if (db) {
            resolve(db);
        } else {
            reject(error + "buildDB()");
        }
    })
}