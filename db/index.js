// // require and re-export all files in this db directory (users, activities...)

module.exports = {
    ...require('./users'),
    ...require('./routine_activities'),
    ...require('./routines'),
    ...require('./activities')

}