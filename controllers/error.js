exports.notFound = (req, res, next) => {
  res.status(404).render("404", { pageTitle: "Page Not found!", path:"/404" });
};

