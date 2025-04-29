const deleteProduct = async (btn) => {
  const productId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
  const article = document.getElementById(productId);
  console.log(article);

  try {
    const response = await fetch("/admin/product/" + productId, {
      method: "DELETE",
      headers: { "csrf-token": csrf },
    });

    const data = await response.json();

    if (data) {
      article.remove();
    }
  } catch (error) {
    console.log(error);
  }
};
