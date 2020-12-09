module.exports = async (_, {}, { models }) => {
  return await models.Movie.find();
};