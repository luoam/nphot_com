"use strict";

/**
 * user
 * @param text
 */
var user = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.account = obj.account;
        this.nickname = obj.nickname;
        this.email = obj.email;
        this.introduction = obj.introduction;
        this.review = obj.review;
        this.timestamp = obj.timestamp;
    } else {
        this.account = "";
        this.nickname = "";
        this.email = "";
        this.introduction = "";
        this.review = "";
        this.timestamp = "";
    }
};
user.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

/**
 * article
 * @param text
 */
var article = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.title = obj.title;
        this.summary = obj.summary;
        this.content = obj.content;
        this.account = obj.account;
        this.timestamp = obj.timestamp;
        this.image = obj.image;
    } else {
        this.title = "";
        this.summary = "";
        this.content = "";
        this.account = "";
        this.timestamp = "";
        this.image = "";
    }
};
article.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

/**
 * article_zanfee
 * @param text
 */
var article_zanfee = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.zanfee = obj.zanfee;
        this.zantotals = obj.zantotals;
        this.zans = obj.zans;
    } else {
        this.zanfee = "";
        this.zantotals = "";
        this.zans = "";
    }
};
article_zanfee.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
/**
 * article_zanlist
 * @param text
 */
var article_zanlist = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.zanlist = obj.zanlist;
    } else {
        this.zanlist = "";
    }
};
article_zanlist.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};
/**
 * account_article_list
 * @param text
 */
var account_article_list = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.article_list = obj.article_list;
    } else {
        this.article_list = "";
    }
};
account_article_list.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var nphotContract = function () {
    LocalContractStorage.defineMapProperty(this, "UserMap", {
        parse: function (text) {
            return new user(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "ArticlesMap", {
        parse: function (text) {
            return new article(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "ArticleszanfeeMap", {
        parse: function (text) {
            return new article_zanfee(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "ArticleszanlistMap", {
        parse: function (text) {
            return new article_zanlist(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "AccountArticleslistMap", {
        parse: function (text) {
            return new account_article_list(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });


    LocalContractStorage.defineProperty(this, "regfee");
    LocalContractStorage.defineProperty(this, "SuperAdmin");
    LocalContractStorage.defineProperty(this, "start_time");
    LocalContractStorage.defineProperty(this, "shutdown_time");
    LocalContractStorage.defineProperty(this, "poweroff");
};
nphotContract.prototype = {
    init: function () {
        this.regfee = 0.01;
        this.start_time = Date.now();
        this.shutdown_time = '';
        this.poweroff = false;
        this.SuperAdmin = 'n1Lvduf7mV6NBXwi43ahP3RqRKrnp6jHa8D';
        LocalContractStorage.set("users", {});
        LocalContractStorage.set("acticles", {});
        LocalContractStorage.set("latestzan", {});
        LocalContractStorage.set("recommend", {});
    },
    /**
     * 是否是json对象
     * @param val
     * @returns {boolean}
     * @private
     */
    _isObject: function (val) {
        return val != null && typeof val === 'object' && Array.isArray(val) === false;
    },

    /**
     * json转数组
     * @param json
     * @returns {Array}
     * @private
     */
    _json2array: function (json) {
        var arr = [];
        if (this._isObject(json)) {
            for (var i in json) {
                arr[i] = json[i];
            }
        }
        return arr;
    },

    /**
     * 数组装json
     * @param arr
     * @private
     */
    _array2json: function (arr) {
        var json = {};
        if (Array.isArray(arr)) {
            for (var i in arr) {
                json[i] = arr[i];
            }
        }
        return json;
    },

    /**
     * 返回元素在数组中的索引
     * @param array
     * @param val
     * @returns {number}
     * @private
     */
    _indexOf: function (array, val) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] == val) return i;
        }
        return -1;
    },
    /**
     * 删除数组中的元素
     * @param array
     * @param val
     * @private
     */
    _remove: function (array, val) {
        var index = this._indexOf(array, val);
        if (index > -1) {
            array.splice(index, 1);
        }
        return array;
    },

    /**
     * contract transfer
     * @param from
     * @param to
     * @param value
     * @private
     */
    _transfer: function (from, to, value) {
        let result = Blockchain.transfer(to, value);
        let status = true;
        if (result) {
            status = true;
        } else {
            status = false;
        }
        Event.Trigger("transfer", {
            Status: status,
            Transfer: {
                from: from,
                to: to,
                value: value
            }
        });

    },

    /**
     * check the contract is alive
     * @private
     */
    _checkengine: function () {
        if (this.poweroff) {
            throw new Error("此合约已经停止运行");
        }
    },
    /**
     * shutdown the contract
     */
    shutdown: function () {
        let from = Blockchain.transaction.from;
        if (from === this.SuperAdmin) {
            this.poweroff = true;
            this.shutdown_time = Date.now();
        } else {
            throw new Error("访问受限");
        }
    },
    /**
     * 修改注册时的nas参数
     * @param value
     * @returns {string}
     * @constructor
     */
    Editregfee: function (value) {
        this._checkengine();
        let from = Blockchain.transaction.from;
        if (from == this.SuperAdmin) {
            let tvalue = parseFloat(value);
            if (isNaN(tvalue)) {
                throw new Error("参数错误");
            }
            this.regfee = tvalue;
            return '{"result":"1"}';//操作成功
        } else {
            throw new Error("限制访问");
        }
    },

    /**
     * 返回当前的regfee
     * @returns {number|*}
     * @constructor
     */
    Getregfee: function () {
        this._checkengine();
        return this.regfee;
    },

    /**
     * 注册账号
     * @param nickname
     * @param email
     * @param introduction
     * @returns {string}
     */
    userregister: function (nickname, email, introduction) {
        this._checkengine();
        //step1
        if (nickname === "" || email === "") {
            throw new Error("称呼和邮箱是必填的");
        }
        if (nickname.length > 50 || email.length > 50 || introduction.length > 500) {
            throw new Error("输入的文字超过了最大长度");
        }
        //step2
        let account = Blockchain.transaction.from;
        if (this.UserMap.get(account)) {
            throw new Error("一个钱包地址只能注册一次，不用重复注册");
        }
        //step3
        let fee = Blockchain.transaction.value;
        let bigregfee = new BigNumber(this.regfee * 1000000000000000000);
        if (fee.lt(bigregfee)) {
            throw new Error("你需要支付" + this.regfee + "NAS");
        }
        //step4
        let new_user = new user();
        let timestamp = Date.now();
        new_user.account = account;
        new_user.nickname = nickname;
        new_user.email = email;
        new_user.introduction = introduction;
        new_user.review = "";
        if (account === this.SuperAdmin) {
            new_user.review = account;
        }
        new_user.timestamp = timestamp;
        this.UserMap.set(account, new_user);
        //step5
        let userlist = LocalContractStorage.get("users");
        let usersArr = this._json2array(userlist);
        usersArr.unshift(account);
        userlist = this._array2json(usersArr);
        LocalContractStorage.set("users", userlist);
        return '{"result":"1"}';
    },

    /**
     * 审查账号
     * @param account
     */
    userreview: function (account) {
        this._checkengine();
        let o_account = Blockchain.transaction.from;
        let o_user_info = this.UserMap.get(o_account);
        if (o_user_info && o_user_info.review) {
            let user_info = this.UserMap.get(account);
            if (user_info) {
                if (user_info.review) {
                    throw new Error("不能重复审查");
                } else {
                    user_info.review = o_account;
                    this.UserMap.set(account, user_info);
                    let bigregfee = new BigNumber(this.regfee * 1000000000000000000);
                    this._transfer(Blockchain.transaction.to, o_account, bigregfee);
                    return '{"result":"1"}';
                }

            } else {
                throw new Error("尝试审查的账号不存在");
            }
        } else {
            throw new Error("当前用来审查的账号操作受限");
        }

    },

    /**
     * 返回用户列表，带分页
     * @param limit
     * @param offset
     */
    getuserlist: function (limit, offset) {
        this._checkengine();
        limit = parseInt(limit);
        offset = parseInt(offset);
        let userlist = LocalContractStorage.get("users");
        let tmpuserlistArr = this._json2array(userlist);
        let userlistArr = tmpuserlistArr.reverse();
        if (offset > userlistArr.length) {
            throw new Error("offset 数值太大");
        }
        let number = offset + limit;
        if (number > userlistArr.length) {
            number = userlistArr.length;
        }

        let result = [];
        for (var i = offset; i < number; i++) {
            let fti = this.UserMap.get(userlistArr[i]);
            result.push(fti);
        }
        let res = {};
        res.result = result;
        res.total = userlistArr.length;
        return res;
    },

    /**
     * 查看用户信息
     * @param account
     * @returns {*}
     */
    getuserinfo: function (account) {
        this._checkengine();
        let user_info = this.UserMap.get(account);
        if (user_info) {
            return user_info;
        } else {
            throw new Error("账号信息不存在");
        }
    },

    /**
     * add article
     * @param title
     * @param summary
     * @param content
     * @param zanfee
     * @param zantotals
     * @returns {string}
     */
    addarticle: function (title, summary, content, image, zanfee, zantotals) {
        this._checkengine();
        let account = Blockchain.transaction.from;
        //step1
        let userlist = LocalContractStorage.get("users");
        let userlistArr = this._json2array(userlist);
        if (this._indexOf(userlistArr, account) > -1) {
            let user_info = this.UserMap.get(account);
            if (user_info && user_info.review) {
                //step2
                if (title === "" || content === "") {
                    throw new Error("标题和内容是必填的");
                }
                if (title.length > 100 || content.length > 65535) {
                    throw new Error("输入的文字超过了最大长度");
                }

                //step3
                let tzanfee = parseFloat(zanfee);
                if (isNaN(tzanfee)) {
                    tzanfee = 0;
                }
                let tzantotals = parseInt(zantotals);
                let value = Blockchain.transaction.value;
                let tvalue = new BigNumber(tzanfee * tzantotals * 1000000000000000000);
                if (value.lt(tvalue)) {
                    throw new Error("你需要支付" + tzanfee * tzantotals + "NAS");
                }
                //step4
                let timestamp = Date.now();
                let id = account + "_" + timestamp;
                let new_article = new article();
                new_article.account = account;
                new_article.timestamp = timestamp;
                new_article.title = title;
                new_article.summary = summary;
                new_article.content = content;
                new_article.image = image;
                let article_info = this.ArticlesMap.get(id);
                if (article_info) {
                    throw new Error("编号已经被占用，请重新提交");
                }
                this.ArticlesMap.set(id, new_article);
                //step5
                let new_articlezanfee = new article_zanfee();
                new_articlezanfee.zanfee = tzanfee;
                new_articlezanfee.zantotals = tzantotals;
                new_articlezanfee.zans = 0;
                this.ArticleszanfeeMap.set(id, new_articlezanfee);
                //step6
                let article_lists = LocalContractStorage.get("acticles");
                let article_listsArr = this._json2array(article_lists);
                article_listsArr.unshift(id);
                article_lists = this._array2json(article_listsArr);
                LocalContractStorage.set("acticles", article_lists);
                //step7
                let account_article_lists = this.AccountArticleslistMap.get(account);
                if (!account_article_lists) {
                    account_article_lists = new account_article_list();
                    account_article_lists.article_list = {};
                }
                let tmp_article_list = account_article_lists.article_list;
                let tmp_article_listArr = this._json2array(tmp_article_list);
                tmp_article_listArr.unshift(id);
                tmp_article_list = this._array2json(tmp_article_listArr);
                account_article_lists.article_list = tmp_article_list;
                this.AccountArticleslistMap.set(account, account_article_lists);
                return '{"result":"1"}';

            } else {
                throw new Error("当前账户还没有通过审查");
            }
        } else {
            throw new Error("当前钱包还没有注册");
        }
    },

    /**
     * rewardarticle
     * @param id
     */
    rewardarticle: function (id) {
        this._checkengine();
        let article_info = this.ArticlesMap.get(id);
        if (article_info) {
            let value = Blockchain.transaction.value;
            let account = article_info.account;
            this._transfer(Blockchain.transaction.to, account, value);
        } else {
            throw new Error("文章信息不存在");
        }
    },
    /**
     * zan article
     * @param id
     * @returns {string}
     */
    zanarticle: function (id) {
        this._checkengine();
        //step1
        let account = Blockchain.transaction.from;
        let article_info = this.ArticlesMap.get(id);
        if (article_info) {
            //step2
            let farticle_zanlist = this.ArticleszanlistMap.get(id);
            if (!farticle_zanlist) {
                farticle_zanlist = new article_zanlist()
                farticle_zanlist.zanlist = {};
            }
            let tmp_article_zanlist = farticle_zanlist.zanlist;
            let tmp_article_zanlistArr = this._json2array(tmp_article_zanlist);
            if (this._indexOf(tmp_article_zanlistArr, account) > -1) {
                throw new Error("不支持重复点赞");
            } else {
                tmp_article_zanlistArr.unshift(account);
                tmp_article_zanlist = this._array2json(tmp_article_zanlistArr);
                farticle_zanlist.zanlist = tmp_article_zanlist;
                this.ArticleszanlistMap.set(id, farticle_zanlist);

                //step3
                let article_zanfee = this.ArticleszanfeeMap.get(id);
                let zanfee = article_zanfee.zanfee;
                let zantotals = article_zanfee.zantotals;
                let zans = article_zanfee.zans;
                let tmp_zans = zans + 1;
                article_zanfee.zans = tmp_zans;
                this.ArticleszanfeeMap.set(id, article_zanfee);

                //step4
                if (!(tmp_zans > zantotals)) {
                    let bigzanfee = new BigNumber(zanfee * 1000000000000000000);
                    this._transfer(Blockchain.transaction.to, account, bigzanfee);
                }
                //step5
                let latestzan_lists = LocalContractStorage.get("latestzan");
                let latestzan_listsArr = this._json2array(latestzan_lists);
                if (latestzan_listsArr.length > 300) {
                    latestzan_listsArr.pop();
                }
                latestzan_listsArr.unshift(id);
                latestzan_lists = this._array2json(latestzan_listsArr);
                LocalContractStorage.set("latestzan", latestzan_lists);
                return '{"result":"1"}';
            }


        } else {
            throw new Error("文章信息不存在");
        }
    },

    /**
     * getarticletotal
     * @returns {number}
     */
    getarticletotal: function () {
        this._checkengine();
        let article_lists = LocalContractStorage.get("acticles");
        let tmparticle_listsArr = this._json2array(article_lists);
        return tmparticle_listsArr.length;
    },


    /**
     * getarticlelist
     * @param limit
     * @param offset
     */
    getarticlelist: function (limit, offset) {
        this._checkengine();
        limit = parseInt(limit);
        offset = parseInt(offset);
        let article_lists = LocalContractStorage.get("acticles");
        let tmparticle_listsArr = this._json2array(article_lists);
        let article_listsArr = tmparticle_listsArr;
        if (offset > article_listsArr.length) {
            throw new Error("offset 数值太大");
        }
        let number = offset + limit;
        if (number > article_listsArr.length) {
            number = article_listsArr.length;
        }

        let result = [];
        for (var i = offset; i < number; i++) {
            let fti = this.ArticlesMap.get(article_listsArr[i]);
            fti.id = article_listsArr[i];
            result.push(fti);
        }
        let res = {};
        res.result = result;
        res.total = article_listsArr.length;
        return res;

    },

    /**
     * getarticlelistbyaccount
     * @param account
     * @param limit
     * @param offset
     */
    getarticlelistbyaccount: function (account, limit, offset) {
        this._checkengine();
        let account_article_lists = this.AccountArticleslistMap.get(account);
        if (!account_article_lists) {
            account_article_lists = new account_article_list()
            account_article_lists.article_list = {};
        }
        let tmp_article_list = account_article_lists.article_list;
        let tmp_article_listArr = this._json2array(tmp_article_list);
        let article_listArr = tmp_article_listArr;
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > article_listArr.length) {
            throw new Error("offset 数值太大");
        }
        let number = offset + limit;
        if (number > article_listArr.length) {
            number = article_listArr.length;
        }

        let result = [];
        for (var i = offset; i < number; i++) {
            let fti = this.ArticlesMap.get(article_listArr[i]);
            fti.id = article_listArr[i];
            result.push(fti);
        }
        let res = {};
        res.result = result;
        res.total = article_listArr.length;
        return res;

    },

    /**
     * getarticleinfo
     * @param id
     * @returns {*}
     */
    getarticleinfo: function (id) {
        this._checkengine();
        let article_info = this.ArticlesMap.get(id);
        if (article_info) {
            return article_info;
        } else {
            throw new Error("文章信息不存在");
        }
    },

    /**
     * getarticlezanfee
     * @param id
     * @returns {*}
     */
    getarticlezanfee: function (id) {
        this._checkengine();
        let article_zanfee = this.ArticleszanfeeMap.get(id);
        if (article_zanfee) {
            return article_zanfee;
        } else {
            return '{"result":"0"}';
        }
    },

    /**
     * getarticlezans
     * @param id
     * @returns {Array}
     */
    getarticlezans: function (id, limit) {
        this._checkengine();
        let article_info = this.ArticlesMap.get(id);
        if (article_info) {
            let article_zanlists = this.ArticleszanlistMap.get(id);
            if (!article_zanlists) {
                article_zanlists = new article_zanlist();
                article_zanlists.zanlist = {};
            }
            let tmp_article_zanlist = article_zanlists.zanlist;
            let tmp_article_zanlistArr = this._json2array(tmp_article_zanlist);
            let result = [];
            limit = parseInt(limit);
            for (let i = 0; i < tmp_article_zanlistArr.length; i++) {
                result.push(tmp_article_zanlistArr[i]);
                if (i > limit) {
                    break;
                }
            }
            return result;

        } else {
            throw new Error("文章信息不存在");
        }
    },

    /**
     * getarticlezansbylimit
     * @param id
     * @param limit
     * @param offset
     * @returns {Array}
     */
    getarticlezansbylimit: function (id, limit, offset) {
        this._checkengine();
        let article_info = this.ArticlesMap.get(id);
        if (article_info) {
            let article_zanlists = this.ArticleszanlistMap.get(id);
            if (!article_zanlists) {
                article_zanlists = new article_zanlist();
                article_zanlists.zanlist = {};
            }
            let tmp_article_zanlist = article_zanlists.zanlist;
            let tmp_article_zanlistArr = this._json2array(tmp_article_zanlist);
            limit = parseInt(limit);
            offset = parseInt(offset);
            if (offset > tmp_article_zanlistArr.length) {
                throw new Error("offset 数值太大");
            }
            let number = offset + limit;
            if (number > tmp_article_zanlistArr.length) {
                number = tmp_article_zanlistArr.length;
            }

            let result = [];
            for (var i = offset; i < number; i++) {
                result.push(tmp_article_zanlistArr[i]);
            }
            return result;

        } else {
            throw new Error("文章信息不存在");
        }
    },

    /**
     * getlatestzan
     * @param limit
     * @returns {Array}
     */
    getlatestzan: function (limit) {
        this._checkengine();
        limit = parseInt(limit);
        let latestzan_lists = LocalContractStorage.get("latestzan");
        let latestzan_listsArr = this._json2array(latestzan_lists);
        let number = limit;
        if (number > latestzan_listsArr.length) {
            number = latestzan_listsArr.length;
        }
        let result = [];
        for (var i = 0; i < number; i++) {
            let fti = this.ArticlesMap.get(latestzan_listsArr[i]);
            fti.id = latestzan_listsArr[i];
            result.push(fti);
        }
        return result;
    },
    /**
     * getstarttime
     * @returns {number | *}
     */
    getstarttime: function () {
        return this.start_time;
    },

    /**
     * getshutdowntime
     * @returns {string}
     */
    getshutdowntime: function () {
        return this.shutdown_time;
    },

    /**
     * recommend
     * @param id
     */
    recommend: function (id) {
        this._checkengine();
        let article_info = this.ArticlesMap.get(id);
        if (article_info) {
            let recommend_lists = LocalContractStorage.get("recommend");
            let recommend_listsArr = this._json2array(recommend_lists);
            if (this._indexOf(recommend_listsArr, id) > -1) {
                return '{"result":"1"}';
            } else {
                if (recommend_listsArr.length > 3) {
                    recommend_listsArr.pop();
                }
                recommend_listsArr.unshift(id);
                recommend_lists = this._array2json(recommend_listsArr);
                LocalContractStorage.set("recommend", recommend_lists);
            }
        } else {
            throw new Error("文章信息不存在");
        }


    },
    /**
     * getrecommend
     * @returns {Array}
     */
    getrecommend: function () {
        this._checkengine();
        let recommend_lists = LocalContractStorage.get("recommend");
        let recommend_listsArr = this._json2array(recommend_lists);
        let result = [];
        for (var i = 0; i < recommend_listsArr.length; i++) {
            let fti = this.ArticlesMap.get(recommend_listsArr[i]);
            fti.id = recommend_listsArr[i];
            result.push(fti);
        }
        return result;
    },

    /**
     * getblancebysuperadmin
     * @param value
     */
    getblancebysuperadmin: function (value) {
        let account = Blockchain.transaction.from;
        if (account === this.SuperAdmin) {
            this._transfer(Blockchain.transaction.to, account, new BigNumber(value * 1000000000000000000));
        }
    }
};
module.exports = nphotContract;