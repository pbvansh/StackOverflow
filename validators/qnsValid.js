

const isTitle = async (ctx, next) => {
    const { title } = ctx.request.body;
    if (!title) {
        ctx.body = 'title is required';
        return;
    }
    if (title.length < 5) {
        ctx.body = 'title is must more than 5 char';
        return;
    }
    if (title.length > 100) {
        ctx.body = 'title is must less than 100 char';
        return;
    }
    await next()
}

const isdesc = async (ctx, next) => {
    const { desc } = ctx.request.body;
    if (!desc) {
        ctx.body = 'description is required';
        return;
    }
    if (desc.length > 5000) {
        ctx.body = 'description is must less than 5000 char';
        return;
    }
    await next()
}

const setOrg = async (ctx, next) => {
    const { role } = ctx.user;
    if (role == 'owner') {
        ctx.user.org_id = ctx.user._id;
    }
    await next()
}

const isTags = async (ctx, next) => {
    const { tags } = ctx.request.body;
    const reg = /^[^ !@#$%^&*(),.?":{}|<>]{2,20}$/;
    tags.length > 0 ? tags.forEach(tag => {
        if (!reg.test(tag)) {
            ctx.body = 'Please provide valid tags.';
            return;
        }
    }) : null;
    await next()
}

const filter = async (ctx, next) => {
    const { sortBy, filterBy, dateBy, page = 1, limit = 10 } = ctx.request.query;
    let noOfDoc = Number(limit);
    if (noOfDoc < 1) {
        ctx.body = 'The limit must be positive or > 0';
        return;
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
    console.log(filter)
    ctx.sortBy = sort;
    ctx.filterBy = filter;
    ctx.dateBy = date;
    ctx.skip = skip;
    ctx.limit = noOfDoc;
    await next()
}



module.exports = {
    isTags,
    isTitle,
    isdesc,
    setOrg,
    filter
}
