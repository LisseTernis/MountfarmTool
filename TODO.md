[ ] Replace using xivapi.com with our own scraping.
    - Reason being, xivapi.com broke and I want to replace it.

    [✓] List queries necessary:
        a) Get list of data centers
        b) Get list of servers in a data center
        c) Search for an FC by name within a given server
           > ~~We only need **name** and **id**!~~
           > We need **name**, **id**, and **rank*!
        d) Get a list of all members of an FC
           > We only need **name** and **id**!
        e) Get a list of all mounts and minions of a PC
           > We only need **names**!
        f) Get a list of all the achievements of a PC
           > We need **names** and **categories**.
    [✓] Determine the relevant queries/URLs for the lodestone site:
        > The base URL is "https://na.finalfantasyxiv.com/lodestone"
        a) might have to hard-code this
        b) might have to hard-code this
        c) /freecompany/?q=<name>&worldname=<server>
           > Returns a PAGINATED result!
        d) /freecompany/<id>/member
           > Returns a PAGINATED result!
        e) /character/<id>/mount/
           /character/<id>/minion/
        f) /character/<id>/achievement/

[✓] Figure out how to deal with paginated results
    - CSS selector "btn__pager__next" should be the element that will lead us to 
      the next page, check it's `href` attribute: it will be 
      'javascript:void(0);" if there are no more pages.
[✓] Steal the CSS selectors from xivapi
    [✓] Finding the free company by name and server:
        Each result is represented by an element with CSS selector 
        `.entry__block`
        [✓] ID
            Use the `href` attribute of the above node and match the following 
            regular expression: "/lodestone/freecompany/(?<ID>\\d+)/" to get the 
            id.
        [✓] Name
            The above node contains a node with CSS selector `.entry__name`; use 
            its "textContent" attribute to get the name.
    [✓] Getting the members of an FC
        Each result is represented by an element with CSS selector `.entry__bg`
        [✓] ID
            Use the `href` attribute of the above node and match the following 
            regular expression: "/lodestone/character/(?<ID>\\d+)/" to get the 
            id.
        [✓] Name
            The above node contains a node with CSS selector `.entry__name`; use 
            its "textContent" attribute to get the name.
    [✓] Getting the mounts of a character
        Each result can only be identified by name: look for the nodes with CSS 
        selector `.character__item_icon` and call it's `click()` function?  
        Would that even work?
        No, but here's a trick I discovered from the xivapi.com sources: *use 
        the mobile version of the /mount and /minion endpoints!*
        [✓] How to request the mobile version of an endpoint?
            window.fetch(url, {headers: {"User-Agent": "Mozilla/5.0 (iPhone; CPU 
                iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like 
                Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1"}});

    [✓] Getting the minions of a character
        Using the mobile version of the endpoint + the selection of <span> nodes 
        with class "mount__name" I have been able to get a full list of mount 
        names for a given character id.


[✓] Remember how to create a separate document out of a URL.
    var doc = (new DOMParser).parseFromString(htmlHead + html, "text/html");
[✗] How to request an endpoint in JS
    fetch(url, options)

    [✗] Figure out how to fix this error when using fetch in the console while 
        on the mountfarm tool page on git:

        Cross-Origin Request Blocked: The Same Origin Policy disallows reading 
        the remote resource at 
        https://na.finalfantasyxiv.com/lodestone/character/9347267/mount/.  
        (Reason: CORS header ‘Access-Control-Allow-Origin’ missing). Status 
        code: 200.

        Code used: 
        window.fetch("https://na.finalfantasyxiv.com/lodestone/character/9347267/mount/").then((response)=>console.log(response.body.includes("mount__name")));

        Turns out this can't be fixed: it is a security feature of modern 
        browsers.

        I am now trying to use a shared web hosting service.  Unfortunately it 
        only supports PHP (and maybe Python), so I am looking into replicating 
        what I need in PHP.

[ ] Using a PHP web server
    [✓] Fetch a lodestone page in PHP
        This works using curl_init/curl_setopt/curl_exec/curl_close.

    [✓] Fetch a *mobile* version of a lodestone page in PHP
        Setting the header seems to work:
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) 
         AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 
         Safari/604.1"));

    [✓] Parse a lodestone page in PHP
        Looks like we don't get CSS selector support in PHP (what a surprise), 
        so we'll have to use XPath instead!

        //div[contains(concat(' ', normalize-space(@class), ' '), ' Test ')]

        The above ought to find all <div> elements with an attribute "class" 
        that contains the class "Test".

        Using XPath is less convenient, but for the limited use-cases we're 
        looking at here, it would appear good enough.  I've managed to retrieve 
        a full list of mounts for a character.

    [✓] Deal with pagination -- test: FC members.
        I managed to get a full list of members!

    […] Implement endpoint parameters for the queries we need:

        [✓] Search for an FC by name within a given server
            We'll use this as a first test run to define the workflow for the 
            rest of the required features.

            [✓] Define parameters
                `?op=id&name=Mistwalkers&world=Bismarck`
            [✓] Figure out endpoint query and parsing elements
            [✓] Define result JSON attributes
                Single string containing the ID; empty on error.
            [✓] Implement and test
        [✓] Get a list of FC members given an FC's id
            [✓] Define parameters
                `?op=me&id=9226468261598593545`
            [✓] Figure out endpoint query and parsing elements
            [✓] Define result JSON attributes
                Array of objects, each with `id`, `name`, and `rank`
            [✓] Implement and test
        [✓] Get the mounts of a PC given their id
            [✓] Define parameters
                `?op=mo&id=9347267`
            [✓] Figure out endpoint query and parsing elements
            [✓] Define result JSON attributes
                Array of names as strings
            [✓] Implement and test
        [✓] Get the minions of a PC given their id
            [✓] Define parameters
                `?op=mi&id=9347267`
            [✓] Figure out endpoint query and parsing elements
            [✓] Define result JSON attributes
                Array of names as strings
            [✓] Implement and test
        […] Get the achievements of a PC given their id
            [✓] Define parameters
                `?op=ac&id=9347267`
            [✓] Figure out endpoint query and parsing elements
            [✓] Define result JSON attributes
                Array of objects, each with `name` and `type`
            [✓] Implement and test
    [✓] Error handling!

    [✓] Replace the use of xivapi with our own api in the javascript code.

    [✓] Enforce the use of https to make the clipboard work.

    [✓] Clean up code!


    [ ] Upload all the new code onto the github repo.
    [ ] Make a deployment script to upload changed files to the server.
