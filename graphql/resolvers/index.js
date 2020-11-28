//const mutations = require("./mutations");
const queries = require("./queries");
const Date = require('./scalarTypes/Date')

module.exports = {
/*   Mutation:{
    ...mutations  
  }, */
  Query:{
    ...queries
  },
  Date
}