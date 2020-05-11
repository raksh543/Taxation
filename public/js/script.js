// Loader

var preloader = document.getElementById("loading");

function myFunction(){
  preloader.style.display = 'none';
};

// Navbar
$('.navbar-collapse a').click(function(){
    $(".navbar-collapse").collapse('hide');
});

$(document).click(function(event) {
    $(event.target).closest(".navbar").length || $(".navbar-collapse.show").length && $(".navbar-collapse.show").collapse("hide")
  });




