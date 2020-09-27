$(function(){
    $("#collapse").on("click",function(){
        var bar = $(".collapse-bar");
        if ( bar.hasClass("collapsed") ){
            bar.removeClass('collapsed');
        } else {
            bar.addClass('collapsed');
        }
    });
});