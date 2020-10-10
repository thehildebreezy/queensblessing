/**
 * API by https://spoonacular.com/food-api/
 */
$(function(){

    /**
     * While this variable is true, we will disable the actions of changing pages
     * This will allow us to have some fancy transitions without worrying too much
     * about the animations being interrupted.
     * We are also going to skip queuing any new page requests to simplify actions
     */
    var changingPages = false;

    var pageCache = {};

    hideBackButton()

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


    $("#loadcards").on("click",function(){
        // load demo
        loadDemo();
    })
    
    $("#searchrecipes").on("click",function(){
        loadSearchPage();
    })

    function loadSearchResults( query ){
        // layer this business
        $.get(query, function( data ){

            //var apiData = JSON.parse(data)
            var apiData = JSON.parse(data);
            if( !apiData ) return

            if( apiData.results.length == 0 ) return

            newNavPage("Results", searchResultsPage, apiData)
        })

    }

    function searchResultsPage(page, insert, data){
        var apiData = data
        var loadPoint = insert
        getTemplate('list-card',function(data){

            var el = $(data);

            for( var i=0; i<apiData.results.length; i++ ){
                var next = el.clone();
                var link = $("<a>");
                link.attr('href','#')
                link.addClass(['stretched-link','text-dark'])
                link.html(apiData.results[i]["title"])

                link.data("recipe", apiData.results[i]["id"])
                link.data("image", apiData.results[i]["image"])
                link.data("title", apiData.results[i]["title"])

                pageCache["recipe"] = {
                    id: apiData.results[i]["id"],
                    image: apiData.results[i]["image"],
                    title: apiData.results[i]["title"]
                }

                link.on('click',function(){
                    var item = $(this)
                    newNavPage(item.data('title'), singleItemPage, item)
                })

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
                item.data("recipe"),
                item.data("image"),
                item.data('title'))
            //fillRecipeFromApiId(el,apiData.results[i]["id"])
            lp.append(el)
        })
    }

    function loadDemo(){

        // layer this business
        $.get('js/demo.json', function( data ){
            

            //var apiData = JSON.parse(data)
            var apiData = data;
            if( !apiData ) return

            if( apiData.results.length == 0 ) return

            newPage("Favorites", function(page, insert){

                var loadPoint = insert
                getTemplate('list-card',function(data){

                    var el = $(data);

                    for( var i=0; i<apiData.results.length; i++ ){
                        var next = el.clone();
                        var link = $("<a>");
                        link.attr('href','#')
                        link.addClass(['stretched-link','text-dark'])
                        link.html(apiData.results[i]["title"])

                        link.data("recipe", apiData.results[i]["id"])
                        link.data("image", apiData.results[i]["image"])
                        link.data("title", apiData.results[i]["title"])

                        link.on('click',function(){
                            var item = $(this)
                            newPage(item.data('title'), function(page,insert){
                                var lp = insert;
                                getTemplate('single-recipe',function(data){
                                    var el = $(data)
                                    fillRecipeFromApiId(el,
                                        item.data("recipe"),
                                        item.data("image"),
                                        item.data('title'))
                                    //fillRecipeFromApiId(el,apiData.results[i]["id"])
                                    lp.append(el)
                                })
                            })
                        })

                        next.find('.card-header').html("").append(link)
                        next.find('.card-img').attr('src',apiData.results[i]["image"])
                        loadPoint.append(next);
                    }
                })

            }, true)
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
        getTemplate('page',function(data){
            var page = $(data);
            pushPage(page, title, topLevel)
            var loadPoint = page.find('.insert-lane');
            func(page,loadPoint)
        })
    }

    function newDataPage( title, func, data, topLevel = false ){
        var pushData = data
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

    function getPageTitle(){
        return $("#pagetitle").html()
    }

    function transitionPage(page, oldPage, loadPoint, func, title=null){
        
        page.hide()
        if(oldPage.length == 0){
            loadPoint.append(page)
            page.fadeIn()
            setPageTitle(title)
            return
        }
        oldPage.fadeOut(()=>{
            func()
            loadPoint.append(page)
            page.fadeIn()
            setPageTitle(title)
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
