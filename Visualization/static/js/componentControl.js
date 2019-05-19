function addCanvas(divName) {
    var context = document.getElementById(divName);
    var svgPart = '<div class="svg"></div>';

    context.innerHTML = context.innerHTML + svgPart;
}