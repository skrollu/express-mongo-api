module.exports = async (_, { id }, { models }) => {
  return await models.Movie.findById({_id: id});
};