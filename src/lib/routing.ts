export function routeFromPath(
  path: string,
  navigate: (page: string, data?: unknown) => void,
) {
  if (path === "/" || path === "") return;
  const segments = path.split("/").filter(Boolean);
  if ((segments[0] === "product" || segments[0] === "products") && segments[1]) {
    navigate("product-page", segments[1]);
  } else if (segments[0] === "catalogue") {
    if (segments[1]) navigate("category", segments[1]);
    else navigate("catalogue");
  } else if (segments[0] === "about") {
    navigate("about");
  } else if (segments[0] === "manufacturing") {
    navigate("manufacturing");
  } else if (segments[0] === "contact") {
    navigate("contact");
  } else if (segments[0] === "blog") {
    if (segments[1]) navigate("blog-post", segments[1]);
    else navigate("blog");
  } else if (segments[0] === "products" || segments[0] === "product") {
    navigate("products");
  } else {
    navigate("content-page", segments.join("/"));
  }
}
