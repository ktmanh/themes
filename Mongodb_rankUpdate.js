var Mongo = require('./mongodb_mod');
var database = "anadata";
var config = {
    url: "mongodb://localhost:27017" + database,
    db: database,
    col: "testthu"
};


exports.get_paging = async function (pattern) {
//    return new Promise(async (resolve, reject) => {
    try {
        let result = await Mongo.getPaging(config, pattern);
        return result;
    } catch (err) {
        //reject('err get_paging');
        throw err;
    }
//    });
};
exports.get_count = async function (pattern) {
//    return new Promise(async (resolve, reject) => {
    try {
        let count = await Mongo.getCount(config, pattern);
        return count;
    } catch (err) {
        throw err;
    }
//    });
};
exports.update_rankUpdate = async function (query_find, query_update) {
//    return new Promise(async (resolve, reject) => {
    try {
        let res = await Mongo.upload_by(config, query_find, query_update);
        return res;
    } catch (err) {
//            reject('err update_rankUpdate');
        throw err;
    }
//    });
};
exports.find_rankUpdate_by_domain = async function (domain) {
//    return new Promise(async (resolve, rejcet) => {
    try {
        let result = await Mongo.find_by_domain(config, domain);
        return result;
        //resolve(result);
    } catch (err) {
//            reject('err find_rankUpdate_by_domain');
        throw err;
    }
//    });
};
exports.insertRankUpdate = async function (items) {
//    return new Promise(async (resolve, reject) => {
    try {
        let result = await Mongo.insertItems(config, items);
        return result;
    } catch (err) {
        throw err;
    }
//    })
}

exports.deleteRankUpdate_firstOne = async function (pattern) {
//    return new Promise(async (resolve, reject) => {
    try {
        let result = await Mongo.deleteOne(config, pattern);
        return result;
    } catch (err) {
        return err;
    }
//    })
}



