const { sendMsg } = require("../utils/msg");


const isTitle = async (ctx, next) => {
    const { title } = ctx.request.body;
    if (!title) {
        sendMsg(ctx, 400, 'title is required')
    }
    if (title.length < 5) {
        sendMsg(ctx, 400, 'title is must more than 5 char')
    }
    if (title.length > 100) {
        sendMsg(ctx, 400, 'title is must less than 100 char')
    }
    await next()
}

const isdesc = async (ctx, next) => {
    const { desc } = ctx.request.body;
    if (!desc) {
        sendMsg(ctx, 400, 'description is required')
    }
    if (desc.length > 5000) {
        sendMsg(ctx, 400, 'description is must less than 5000 char')
    }
    await next()
}

const setOrg = async (ctx, next) => {
    const { role } = ctx.user;
    if (role == 'owner') {
        ctx.status = 400;
        ctx.user.org_id = ctx.user._id;
    }
    await next()
}

const isTags = async (ctx, next) => {
    const { tags } = ctx.request.body;
    const reg = /^[^ !@#$%^&*(),.?":{}|<>]{2,20}$/;
    tags.length > 0 ? tags.forEach(tag => {
        if (!reg.test(tag)) {
            sendMsg(ctx, 400, 'Please provide valid tags.')
        }
    }) : null;
    await next()
}

const filter = async (ctx, next) => {
    const { sortBy, filterBy, dateBy, page = 1, limit = 10 } = ctx.request.query;
    let noOfDoc = Number(limit);
    if (noOfDoc < 1) {
        sendMsg(ctx, 400, 'The limit must be positive or > 0')
    }
    let skip = ((Number(limit) * Number(page)) - Number(limit));
    skip < 0 ? skip = 0 : null;
    let sort = {}, filter = {}, date = {};
    if (sortBy) {
        sortBy.split(',').forEach((val) => {
            const data = val.split('_');
            sort[data[0]] = Number(data[1]);
        })
    }

    if (filterBy) {
        filterBy.split(',').forEach((val) => {
            const data = val.split('_');
            if (data[0] == 'tags') {
                const tags = data[1].slice(1, -1).split('||');
                data[1] = { $in: tags }
            }
            if (data[0] == 'upVotes' || data[0] == 'downVotes') {
                const lgAndGt = data[1].replace('-', ',');
                data[1] = JSON.parse(lgAndGt)
            }
            filter[data[0]] = data[1]
        })
    }

    if (dateBy) {
        const data = dateBy.split('_');
        let SDate = "$date", EDate = "$$NOW";
        let hour = 24;
        if (data[1] == 'H') {
            hour = Number(data[2]);
        } else if (data[1] == 'D') {
            hour = Number(data[2]) * 24;
        } else if (data[1] == 'M') {
            hour = Number(data[2]) * 24 * 30;
        }
        if (data[1] == 'R') {
            const range = data[2].split(',');
            SDate = new Date(range[0])
            EDate = new Date(range[1])
            date = { date: { $gte: SDate, $lt: EDate } }
        }
        else {
            date = {
                $expr: {
                    $lt: [{ $dateDiff: { startDate: SDate, endDate: EDate, unit: "hour" } }, hour]
                }
            }

        }
    }
    ctx.allFilters = { sort, filter, date, skip, noOfDoc };
    // ctx.sortBy = sort;
    // ctx.filterBy = filter;
    // ctx.dateBy = date;
    // ctx.skip = skip;
    // ctx.limit = noOfDoc;
    await next()
}



module.exports = {
    isTags,
    isTitle,
    isdesc,
    setOrg,
    filter
}
