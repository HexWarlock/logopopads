document.addEventListener("DOMContentLoaded", function () {
  const includes = document.querySelectorAll("[data-include]");
  let loadedCount = 0;

  includes.forEach((el) => {
    const file = el.getAttribute("data-include");
    fetch(file)
      .then((response) => {
        if (!response.ok) throw new Error(`Could not fetch ${file}`);
        return response.text();
      })
      .then((data) => {
        el.innerHTML = data;
        loadedCount++;

        // Once all includes are loaded, run active nav highlight
        if (loadedCount === includes.length) {
          highlightActiveNavLink();
        }
      })
      .catch((error) => {
        console.error(error);
        el.innerHTML = "<p>Error loading component.</p>";
      });
  });

  function highlightActiveNavLink() {
    const currentPath = window.location.pathname; // e.g. "/faq.html"
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === currentPath) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });
  }
  /* Inject favicon links into <head> */
  const faviconLinks = `
    <link rel="apple-touch-icon" sizes="180x180" href="/img/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/img/favicon/favicon-16x16.png">
    <link rel="manifest" href="/img/favicon/site.webmanifest">
    <link rel="shortcut icon" href="/img/favicon/favicon.ico">
  `;
  document.head.insertAdjacentHTML("beforeend", faviconLinks);
});
