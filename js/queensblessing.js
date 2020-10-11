/**
 * API by https://spoonacular.com/food-api/
 */
$(function(){


    var pageCache = {};

    hideBackButton()

    // initial page is favorites
    loadFavorites()

    $("#backbutton").on('click',function(){
        popPage();
    })


    $("#collapse").on("click",function(){
        var bar = $(".collapse-bar");
        if ( bar.hasClass("collapsed") ){
            bar.removeClass('collapsed');
        } else {
            bar.addClass('collapsed');
        }
    });


    $("#loadfavorites").on("click",function(){
        loadFavorites();
    })
    
    $("#searchrecipes").on("click",function(){
        loadSearchPage();
    })

    function loadSearchResults( query ){
        // layer this business
        startTransitionIndicator()
        $.get(query, function( data ){

            //var apiData = JSON.parse(data)
            var apiData = JSON.parse(data);
            if( !apiData ) return

            if( apiData.results.length == 0 ) return

            newNavPage("Results", searchResultsPage, apiData)
        })

    }

    function newSingleItemLink(title, id, image){
        var link = $("<a>");
            link.attr('href','#')
            link.addClass(['stretched-link','text-dark'])
            link.html(title)

            link.data("id",id)
            link.data("image",image)
            link.data("title",title)

            link.on('click',function(){
                var item = $(this)
                pageCache["recipe"] = {
                    id: item.data('id'),
                    image: item.data('image'),
                    title: item.data('title')
                }
                newNavPage(item.data('title'), singleItemPage, item)
            })

        return link
    }

    function searchResultsPage(page, insert, data){
        var apiData = data
        var loadPoint = insert
        getTemplate('list-card',function(data){

            var el = $(data);

            for( var i=0; i<apiData.results.length; i++ ){
                var next = el.clone();

                var link = newSingleItemLink(
                    apiData.results[i]["title"],
                    apiData.results[i]["id"],
                    apiData.results[i]["image"]
                )

                next.find('.card-header').html("").append(link)
                next.find('.card-img').attr('src',apiData.results[i]["image"])
                loadPoint.append(next);
            }
        })

    }

    function singleItemPage(page,insert,data){
        var lp = insert;
        var item = data;
        getTemplate('single-recipe',function(data){
            var el = $(data)
            var favButton = el.find("#addtofavorites");
            disableButton( favButton )
            favButton.on("click",function(){
                if(favButton.attr("disabled")){
                    return
                }
                // send id data title image
                $.post(
                    "http://manetheren/services/recipe/add.php",
                    pageCache["recipe"]
                ).done(function(data){
                    if(data != "success") {
                        alert("Failed.")
                    }
                    disableButton(favButton)
                    check_in_favorites( 
                        request_favorites_string( pageCache["recipe"].id ), 
                        favButton )
                })

            })


            fillRecipeFromApiId(el,
                item.data("id"),
                item.data("image"),
                item.data('title'))
            //fillRecipeFromApiId(el,apiData.results[i]["id"])
            lp.append(el)
        })
    }

    function loadSingleItem( id ){

    }

    function loadFavorites(){
        var favs_link = request_favorites_list_string();

        $.get(favs_link, function(data) {
            var apiData = JSON.parse(data)
            if( !apiData ) return;

            //if(apiData.favorites.length == 1 ) return

            newTopLevelPage("Favorites", favoritesPage, apiData)
        })
    }

    function favoritesPage(page,insert,data){
        var lp = insert;
        var apiData = data.favorites;
        getTemplate('single-recipe',function(data){
            var el = $(data)

            // load card template
            getTemplate('list-card', function(data){
                var card = $(data)

                for( var i=0; i<apiData.length-1; i++ ){
                    var next = card.clone()

                    var link = newSingleItemLink(
                        apiData[i]["title"],
                        apiData[i]["id"],
                        apiData[i]["image_path"]
                    )


                    next.find('.card-header').html("").append(link)
                    next.find('.card-img').attr('src',apiData[i]["image_path"])
                    lp.append(next);
                }

                card.remove()
            })

        })
    }

    
    function fillRecipeFromApiId( el, id, image, title ){
        //el.find(".card-header").html(title)
        el.find(".card-img").attr("src",image)

        var ingredients  = el.find(".ingredients-list")
        var instructions = el.find(".instructions-list")

        var usedIngredients = []

        var query_string = request_single_string(id)
        var check_in_favorites_string = request_favorites_string(id)


        $.get(query_string, function(data){

            pageCache["recipe"].data = data;

            var apiData = JSON.parse(data)
            if( !apiData ) return;

            var button = el.find("#addtofavorites")
            check_in_favorites( check_in_favorites_string, button )
            
            var steps = apiData[0]["steps"]

            for( var i=0; i<steps.length; i++ ){
                instructions.append($("<li>").html(steps[i]["step"]))
                var ingreds = steps[i]["ingredients"]
                for( var j=0; j<ingreds.length; j++ ){
                    if( usedIngredients.includes(ingreds[j]["name"]) ){
                        continue
                    }
                    var item = $("<li>")
                    /*item.css({"display":"inline-block"})*/
                    item.html(ingreds[j]["name"])
                    ingredients.append(item)

                    usedIngredients.push(ingreds[j]["name"])
                }
            }

            ingredients.find("li").on("click",function(){
                $(this).toggleClass("checked")
            })
        })
    }

    function loadSearchPage(){
        newPage('Search', function(page,insert){
            var loadPoint = insert
            getTemplate('search-page',function(data){
                var el = $(data)
                loadPoint.append(el)
                el.find("#searchbutton").on("click",function(){

                    // collect data from the form and send it on
                    request_search(el)

                })
            })
        }, true)
    }

    function newPage( title, func, topLevel = false ){
        newDataPage( title, (p,lp,d)=>{func(p,lp)}, null, topLevel )
    }

    function newDataPage( title, func, data, topLevel = false ){
        var pushData = data
        startTransitionIndicator()
        getTemplate('page',function(data){
            var page = $(data);
            pushPage(page, title, topLevel)
            var loadPoint = page.find('.insert-lane');
            func(page,loadPoint, pushData)
        })
    }

    function newNavPage( title, func, data ){
        return newDataPage( title, func, data, false )
    }

    function newTopLevelPage( title, func, data ){
        return newDataPage( title, func, data, true )
    }
    
    var pageQueue = []

    function setPageTitle(title) {
        $("#pagetitle").html(title)
    }


    function disableButton( button ){
        button.attr("disabled",true)
    }


    function check_in_favorites( path, btn ){
        var button = btn
        $.get(path,function(data){
            if(data == "yes" ){
                setFavoriteButtonToRemove( button )
            } else {
                setFavoriteButtonToAdd( button )
            }
        })
    }   

    function setFavoriteButtonToAdd( button ){
        button.attr("disabled",false)
        button.html("Add to Favorites")
    }

    function setFavoriteButtonToRemove( button ){
        button.attr("disabled",false)
        button.html("Remove from Favorites")
    }

    function startTransitionIndicator(){
        var sb = $("#spinnerbox")
        sb.show()
        sb.css("z-index","99")
    }

    function endTransitionIndicator(){
        var sb = $("#spinnerbox")
        sb.hide()
        sb.css("z-index","-1")
    }

    function getPageTitle(){
        return $("#pagetitle").html()
    }

    function transitionPage(page, oldPage, loadPoint, func, title=null){
        
        page.hide()
        if(oldPage.length == 0){
            loadPoint.append(page)
            page.fadeIn()
            setPageTitle(title)
            endTransitionIndicator()
            return
        }
        oldPage.fadeOut(()=>{
            func()
            loadPoint.append(page)
            page.fadeIn()
            setPageTitle(title)
            endTransitionIndicator()
        })

    }


    function pushPage (page, title, topLevel) {
        var lp = $("#loadpoint")
        var oldPage = lp.children()
        if( !topLevel ) {
            transitionPage(page, oldPage, lp, ()=>{
                oldPage.detach()
                oldPage['oldPageTitle'] = getPageTitle()
                pageQueue.push(oldPage)
                showBackButton()
            }, title)
        } else {
            transitionPage(page, oldPage, lp, ()=>{
                oldPage.remove()
                pageQueue.forEach((item,index) => {
                    item.remove()
                })
                pageQueue = []
            }, title)
            hideBackButton()
        }
    }

    function popPage(){
        var lp = $("#loadpoint")
        var oldPage = lp.children()
        var newPage = pageQueue.pop()

        transitionPage(newPage, oldPage, lp, ()=>{
            oldPage.remove()
        }, newPage['oldPageTitle'])

        if( pageQueue.length == 0 ){
            hideBackButton()
        }
    }

    function hideBackButton() {
        $("#backbutton").hide();
    }

    function showBackButton() {
        $("#backbutton").show();
    }


    function getTemplate (template, func) {
        $.get('templates/'+template+'.html', func)
    }


    // REQUEST CALLS
    
    // list of accepted cuisines from api
    var cuisines = [
        "None",
        "African",
        "American",
        "British",
        "Cajun",
        "Caribbean",
        "Chinese",
        "Eastern European",
        "European",
        "French",
        "German",
        "Greek",
        "Indian",
        "Irish",
        "Italian",
        "Japanese",
        "Jewish",
        "Korean",
        "Latin American",
        "Mediterranean",
        "Mexican",
        "Middle Eastern",
        "Nordic",
        "Southern",
        "Spanish",
        "Thai",
        "Vietnamese"
    ];


    function request_favorites () {
        // this will make a request to the manetheren server
        // for a list of favorite recipes that I've cached
    }

    // random search
    function request_random () {
        // gets a random recipe from the the actual API
    }

    function request_single_string( id ){
        return "http://manetheren/services/recipe/single.php?id="+id
    }
    
    function request_favorites_string( id ){
        return "http://manetheren/services/recipe/favorite_exists.php?id="+id
    }

    function request_favorites_list_string(){
        return "http://manetheren/services/recipe/favorites.php"
    }

    function request_single_favorite( id ){
        return "http://manetheren/services/recipe/favorite.php?id="+id
    }

    function request_search ( search_page ) {
        var querybox = search_page.find("#searchquery");
        var query = querybox.val()

        // uses the actual API to look up a list of recipes
        var search_string = "query="+query;

        // lets define the options we want to support

        var number_select = search_page.find("#numberresults")
        var number_results = number_select.val()
        
        search_string += "&number="+number_results

        var ingredients_group = search_page.find("[name='ingredients_group']:checked")
        var ingredients_values = []
        ingredients_group.each(function(){
            ingredients_values.push($(this).val())
        })

        var ingredients_string = ""
        while( ingredients_values.length > 0 ){
            ingredients_string += ingredients_values.pop()
            if( ingredients_values.length > 0 ){
                ingredients_string += ",";
            }
        }

        search_string += "&includeIngredients="+ingredients_string

        var queryString = request_string(search_string)
        loadSearchResults( queryString )
    }

    function shopping_list () {
        // uses the manetheren server to pull a list of 
        // things to buy at the grocery store
    }

    function request_string ( query ) {
        return "http://manetheren/services/recipe/search.php?"+query
    }

});
