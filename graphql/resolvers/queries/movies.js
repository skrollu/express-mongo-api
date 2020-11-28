module.exports = async (_, {}, { models }) => {
  console.log(models)
  return await models.Movie.find();
};