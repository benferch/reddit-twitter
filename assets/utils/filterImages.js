module.exports = function filterImages (posts) {
  return posts.filter(
    (p) =>
      !p.data.is_video &&
      !p.data.url.includes('.gif') &&
      !p.data.is_self &&
      p.data.title.length <= 280
  );
}