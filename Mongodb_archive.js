var Mongo = require('./mongodb_mod');
var database = "anadata";
var config = {
    url: "mongodb://localhost:27017" + database,
    db: database,
    col: "testthu"
}

//let keywords = new RegExp('love');
//var pattern = [
//    {
//        $match: {
//            $or: [
//                {domain: keywords}
//            ]
//        }
//    },
//    {$skip: 0},
//    {$limit: 10}
//];


exports.getPaging = async function (pattern) {
    
    try {
        let result = await Mongo.getPaging(config, pattern);
        return result;
    } catch (err) {
        throw err;
    }
}


exports.get_count = async function (pattern) {
    try {
        let count = await Mongo.getCount(config, pattern);
        return count;
    } catch (err) {
        throw err;
    }
}

exports.update_rankArchive = async function (query_find, query_update) {
    try {
        let res = await Mongo.upload_by(config, query_find, query_update);
        return res;
    } catch (err) {
        throw err;
    }
}

exports.find_rankArchive_by_domain = async function (domain) {
    try {
        let result = await Mongo.find_by_domain(config, domain);
        return result;
    } catch (err) {
        throw err;
    }
}

exports.insertRankArchive = async function (items) {
    try {
        let result = await Mongo.insertItems(config, items);
        return result;
    } catch (err) {
        throw err;
    }
}

exports.deleteRankArchive_firstOne = async function (pattern) {
    try {
        let result = await Mongo.deleteOne(config, pattern);
        return result;
    } catch (err) {
        throw err;
    }
}