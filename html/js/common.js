$(document).on('click', '.mobile-menu', function(){
	$('.mobile-menu,.menu-bar').toggleClass('active');
});



$(document).on('click', '.mobile-menu11', function() {
  $(this).toggleClass('active');
  $('.chats-box').toggleClass('active');
});
 
window.onload = function(){
  $('.top-header').removeClass('no-transition');
}






$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  e.target // newly activated tab
  e.relatedTarget // previous active tab
  var $card = $(this).closest('#nav-tab');
  $('html,body').animate({
    scrollTop: $card.offset().top - 30
  },500);
})
$('.collapse').on('shown.bs.collapse', function(e) {
  var $card = $(this).closest('.card');
  $('html,body').animate({
    scrollTop: $card.offset().top - 130
  },500);
}); 
$(window).on('load', function() {
    $('.loading').fadeOut();
});
// $(document).ready(function(){
//   $('.chat-icon').click(function(){
//     $('.chat-box-section').toggleClass('show-hide')
//   });
// });
$(window).on('load',function(){
        // $('#indexpopup').modal('show');
  });




$(document).on('click', '.dividendsModal', function(e){
  $('.onhelpshow').css("display", "none");
});
























