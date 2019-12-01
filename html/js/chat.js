// function hideBox(id){
// 	var elem = document.getElementById(id);
// 	elem.classList.remove("active");
// }
// $("#showontopUsername").html('ALL');

$("#hideUserlisting").hide();
$("#showBackbutton, #showChatdetails").show();
function showBox(id) {
  var elem = document.getElementById(id);
  elem.classList.add("active");
}

$(document).on("click", "[data-userchat]", function() {
  $("#showontopUsername").html($(this).attr("data-userchat"));

  $("#hideUserlisting").hide();
  $("#showBackbutton, #showChatdetails").show();
});

$(document).on("click", "#showontopUsername", function() {
  $("#hideUserlisting").show();
  $("#showBackbutton, #showChatdetails").hide();
});

// var clickUsername = document.querySelectorAll("[data-userchat]");
// for (i = 0; i < clickUsername.length; i++) {
//   clickUsername[i].addEventListener('click', function(event) {
//     document.getElementById('hideUserlisting').style.display = "none";
//     // document.getElementById('searchBox').style.display = "none";

//     document.getElementById('showBackbutton').style.display = "block";
//     document.getElementById('showChatdetails').style.display = "block";

//     // document.getElementById('searchInput').value = "";
//     // searchFunction();
//   });
// }

// function backbutton() {
// 	document.getElementById('showBackbutton').style.display = "none";
//   document.getElementById('showChatdetails').style.display = "none";
//   document.getElementById('searchBox').style.display = "none";
//   document.getElementById('hideUserlisting').style.display = "block";
// }

function searchFunction() {
  // Declare variables
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById("searchInput");
  filter = input.value.toUpperCase();
  ul = document.getElementById("hideUserlisting");
  li = ul.getElementsByTagName("li");

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("h4")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

// function showSearchbox(){
//   document.getElementById('searchBox').style.display = "block";
// }

// function backfromSearch(){
//   document.getElementById('searchBox').style.display = "none";
//   document.getElementById('searchInput').value = "";
//   searchFunction();
// }
