const RequestConnectionSchema = require('../models/request')

// Two users may chat only when an accepted connection exists between them.
const areConnected = async (userIdA, userIdB) => {
    if (!userIdA || !userIdB) return false
    const connection = await RequestConnectionSchema.findOne({
        status: "accepted",
        $or: [
            { fromUserId: userIdA, toUserId: userIdB },
            { fromUserId: userIdB, toUserId: userIdA }
        ]
    })
    return !!connection
}

module.exports = { areConnected }
