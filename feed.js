$(function () { // Document ready function
  let url = $('#happening-feed').attr('url'); // This is the URL for your JSON feed.

  //Pagination and modal
  let state = {
    'page': 1,
    'count': 0,
    'pageNum': 0,
    'window': 5,
    'feedSize': 0,
    'elementPerRow': 1,
    'currentEvent': 1,
  }

  //Configuration
  let config = {
    'popup': false,
    'wide': false,
    'search': false,
  }

  //Params
  let params = {
    'elementWidth': 300,
    'wide': "",
    'elementPerPage': 7,
  }

  //Fields
  let fields = {
    'title': '',
    'subtitle': '',
    'image_url': '',
    'date': '',
    'time_start': '',
    'time_end': '',
    'location': '',
    'links': '',
    'description': '',
    'page_link': '',
    'type': '',
    'tags': '',
  }

  //Events data
  let events;
  let filteredEvents;
  let showEvents;

  //Event placeholder
  let placeholder = {
    'event_title': "See whats Happening @ Michigan",
    'image_url': "https://events.umich.edu/images/default-events-module.png",
    'permalink': "https://events.umich.edu/",
    'date_start': "",
    'building_name': "",
    'links': [],
  }

  //advance search
  let tagSet = new Set();
  let typeSet = new Set();

  //Display the loader before getting the json data
  let loaderHtml = '<div class = "loader-container feed-container center"><div class="loader"></div></div>';
  $('#happening-feed').append(loaderHtml);

  //advance search animation
  let animateTime = 500;
  // Run an ajax call. The documentation is here : http://api.jquery.com/jquery.ajax/
  $.ajax({
    url: url, // Set the URL for the json feed
    success: function (data) { // Run this if there is a successful call
      let classList;
      let classListArray;
      let searchHtml;
      let eventFeedHtml;
      let linkToHappening;
      let linkToHappeningHtml;
      let paginationHtml;
      fields.title = 'event_title',
        fields.subtitle = 'event_subtitle',
        fields.image_url = 'image_url',
        fields.date = 'date_start',
        fields.time_start = 'time_start',
        fields.time_end = 'time_end',
        fields.location = 'building_name',
        fields.links = 'links',
        fields.description = 'description',
        fields.page_link = 'permalink',
        fields.type = 'event_type',
        fields.tags = 'tags',
        $('#happening-feed').empty();
      classList = $('#happening-feed').attr("class");
      classListArray = classList.split(/\s+/);
      classListArray.forEach(element => {
        if (element == "pop-up") config.popup = true;
        else if (element == "wide") {
          config.wide = true;
          params.wide = "-wide";
          params.elementWidth = 480;
        }
        else if (element == "search") {
          config.search = true;
        }
      });
      if (config.search) {
        searchHtml = '<div class = "feed-search feed-container center"><div id = "search-content" class = "search-content"><h3>Search Events</h3>'
        searchHtml += '<input id= "search-input" class = "search-input" type="text" placeholder="Search.."></input><div class = "advance-search-toggle-container"><a id = "advance-search-toggle">advance search</a><div>';
        $('#happening-feed').append(searchHtml);
        $("#search-input").on("keyup", function () {
          search();
        });
        $('#advance-search-toggle').on("click", function () {
          if ($('#advance-search').height() === 0) {
            autoHeightAnimate($('#advance-search'), animateTime);
          }
          else {
            $('#advance-search').stop().animate({ height: '0' }, animateTime);
          }
        });
      }
      eventFeedHtml = '<div id = "event-feed"></div>';
      $('#happening-feed').append(eventFeedHtml);
      linkToHappening = url.replace("/json", "");
      linkToHappeningHtml = '<div class = "feed-container center link-to-happening"><a href = "' + linkToHappening + '">View the full page on Happening @ Michigan</a></div>'
      $('#happening-feed').append(linkToHappeningHtml);
      paginationHtml = '<div class = "feed-container center"><div id="pagination-wrapper"></div></div>';
      $('#happening-feed').append(paginationHtml);
      if (config.popup) {
        let modalHtml = '<div id="feed-modal" class="feed-modal"><div class="feed-modal-content"><div id = "feed-modal-header" class="feed-modal-header"><span id = "feed-modal-close" class="feed-modal-close">&times;</span></div><div id = "feed-modal-body" class="feed-modal-body feed-modal-row"></div></div></div>';
        $('#happening-feed').append(modalHtml);
        // When the user clicks on <span> (x), close the modal
        $('#feed-modal-close').on('click', function () {
          $('#feed-modal').hide();
        });
      }
      events = data;
      filteredEvents = events;
      showEvents = filteredEvents;
      state.feedSize = $('#event-feed').width();
      state.elementPerRow = Math.floor(state.feedSize / params["elementWidth"]) >= 1 ? Math.floor(state.feedSize / params["elementWidth"]) : 1;
      pagination();
      if (config.search) advanceSearchSetup();
    }
  });

  $(window).resize(function () {
    state.feedSize = $('#happening-feed').width();
    if (state.elementPerRow != Math.floor(state.feedSize / params["elementWidth"])) {
      state.elementPerRow = Math.floor(state.feedSize / params["elementWidth"]) >= 1 ? Math.floor(state.feedSize / params["elementWidth"]) : 1;
      pagination();
    }
    buildModal(showEvents[state.currentEvent]);
  });

  $(window).click(function (event) {
    if (event.target == $('#feed-modal')[0]) {
      $('#feed-modal').hide();
    }
  });

  function pagination() {
    let trimStart;
    let trimEnd;
    let row;
    let html = '';
    state.count = Object.keys(showEvents).length;
    state.pageNum = (Math.ceil(state.count / params.elementPerPage) == 0) ? 1 : Math.ceil(state.count / params.elementPerPage);
    $('#event-feed').empty();
    trimStart = (state.page - 1) * params.elementPerPage;
    trimEnd = (trimStart + params.elementPerPage < state.count) ? trimStart + params.elementPerPage : state.count;
    for (let i = trimStart; i <= trimEnd; i++) { // loop though list of objects
      if ((i - trimStart) % state.elementPerRow == 0) {
        row = '<div class="event-row feed-container">';
        $('#event-feed').append(row);
      }
      if (i == trimEnd) {
        html = buildEvent(placeholder, -1);
      }
      else {
        html = buildEvent(showEvents[i], i); // build html for object
      }
      $('.event-row').last().append(html); // append each object to the <div id="happening-feed"></div>
    }

    if (state.count == 0) {
      html = "<h3>No events found. Please modify your search and try again</h3>";
      $('.event-row').last().append(html);
    }

    if (config.popup) {
      $(".event-modal-button").click(function () {
        $('#feed-modal').show();
        state.currentEvent = $(this).val();
        buildModal(showEvents[state.currentEvent]);
      });
      $(".event-title").click(function () {
        state.currentEvent = $(this).val();
        if (state.currentEvent == -1) {
          window.open(placeholder[fields.page_link]);
        }
        else {
          $('#feed-modal').show();
          buildModal(showEvents[state.currentEvent]);
        }
      });
    }
    pageButton();
  };

  function pageButton() {
    $('#pagination-wrapper').empty();
    let html = '';
    let maxLeft = (state.page - Math.floor(state.window / 2));
    let maxRight = (state.page + Math.floor(state.window / 2));
    if (maxLeft < 1) {
      maxLeft = 1;
      maxRight = state.window;
    }
    if (maxRight > state.pageNum) {
      maxLeft = state.pageNum - (state.window - 1);
      maxRight = state.pageNum;
      if (maxLeft < 1) {
        maxLeft = 1;
      }
    }
    for (let page = maxLeft; page <= maxRight; page++) {
      html += '<button value = ' + page + ' class = page-button>' + page + '</button>';
    }
    if (state.page != 1) {
      html = '<button value=' + 1 + ' class = "page-button">&#171; First</button>' + html;
    }

    if (state.page != state.pageNum) {
      html += '<button value=' + state.pageNum + ' class="page-button">Last &#187;</button>';
    }
    $('#pagination-wrapper').append(html);
    $('.page-button').on('click', function () {
      state.page = Number($(this).val());
      pagination();
      $('.page-button').filter(function () { return this.value == state.page }).addClass('current-page');
    });

  };

  // create html for object.
  function buildEvent(obj, count) {
    let html = '<div class="event' + params.wide + '" style="flex:0 0 ' + (100 / state.elementPerRow) + '%">';
    let image_url = (obj[fields.image_url]) ? obj[fields.image_url] : "https://events.umich.edu/images/default190@2x.png";
    let image = '<a class = "image-link" href =' + obj[fields.page_link] + '><div class = "event-image' + params.wide + '" style="background-image: url(' + image_url + ')"></div></a>';
    let title = obj[fields.title];
    let date = obj[fields.date];
    let links = obj[fields.links];
    let location_name = obj[fields.location];
    html += image;
    html += '<div class = "event-text' + params.wide + '">';
    if (config.popup) html += '<button value = "' + count + '" class = "event-title"><h3>' + title + '</h3></button>';
    else html += '<a href =' + obj[fields.page_link] + '><h3>' + title + '</h3></a>';
    if (date) {
      html += '<ul><li><i class="fa fa-fw fa-calendar"></i><span> Date: ' + date + '</span></li>';
    }
    if (location_name)
      html += '<li><i class="fa fa-location-arrow fa-fw"></i><span> Location: ' + location_name + '</span></li></ul>';
    for (let i = 0; i < Object.keys(links).length; i++) {
      let defaultTitle = (links[i].url.split("://"))[1];
      defaultTitle = (defaultTitle.split('/'))[0];
      let text = links[i].title == null ? defaultTitle : links[i].title;
      link = '<i class="fa fa-link fa-fw maize"></i><a href = ' + links[i].url + '> ' + text + '</a><br>';
      if (i % 2 == 0) {
        html += '<div class = feed-container>';
      }
      html += '<div class = "link-container">' + link + '</div>';
      if (i % 2 != 0 || i == Object.keys(links).length - 1) {
        html += '</div>';
      }
    }
    html += '</div>';
    // When the user clicks the buttons, open the modal 
    if (config.popup && count != -1) html += '<button value = "' + count + '" class = "event-modal-button">Read More</button>';
    html += '</div>';
    return html;
  };

  function buildModal(obj) {
    let titles = '<h2>' + obj[fields.title] + '</h2>';
    let image_url = (obj[fields.image_url]) ? obj[fields.image_url] : "https://events.umich.edu/images/default190@2x.png";
    let html = '<div class = "feed-modal-side">';
    let hours;
    let minutes;
    let ampm;
    let strStartTime;
    let strEndTime;
    $('#feed-modal-header h2, #feed-modal-header h4').remove();
    $('#feed-modal-body').empty();
    $('#feed-modal-event-link').remove();
    if (obj[fields.subtitle] != "") titles += '<h4>' + obj[fields.subtitle] + '</h4>';
    $('#feed-modal-header').append(titles);
    html += '<div class = "feed-modal-image" style="background-image: url(' + image_url + ')"></div>';
    if ($(window).width() > 800) html += buildModalLinks(obj);
    html += '</div>';
    html += '<div class = "feed-modal-main"><div class= "feed-modal-text">';
    html += obj[fields.description];
    html += '</div><hr><ul><li><i class="fa fa-fw fa-calendar"></i>';
    html += '<span> ' + obj[fields.date].replaceAll('-', '/') + '</span></li>';
    hours = obj[fields.time_start].substring(0, 2);
    minutes = obj[fields.time_start].substring(3, 5);
    ampm = parseInt(hours) >= 12 ? ' pm' : ' am';
    hours = ((parseInt(hours) + 11) % 12 + 1);
    strStartTime = hours + ':' + minutes + ampm;
    hours = obj[fields.time_end].substring(0, 2);
    minutes = obj[fields.time_end].substring(3, 5);
    ampm = parseInt(hours) >= 12 ? ' pm' : ' am';
    hours = ((parseInt(hours) + 11) % 12 + 1);
    strEndTime = hours + ':' + minutes + ampm;
    html += '<li><i class="fa fa-fw fa-clock-o"></i><span> ' + strStartTime + ' - ' + strEndTime + '</span></li>';
    if (obj[fields.location]) html += '<li><i class="fa fa-location-arrow fa-fw"></i><span> Location: ' + obj[fields.location] + '</span></li>';
    html += '</ul></div>';
    if ($(window).width() <= 800) html += buildModalLinks(obj);
    $('#feed-modal-body').append(html);
    $('#feed-modal-body').after('<a id = "feed-modal-event-link" href =' + obj[fields.page_link] + '>View on Happening @ Michigan' + '</a>');
  };

  function buildModalLinks(obj) {
    let links = obj[fields.links];
    let linkHtml = "";
    if (Object.keys(links).length > 0) {
      linkHtml += '<div class = "small-title">related link</div>';
      for (let i = 0; i < Object.keys(links).length; i++) {
        let defaultTitle = (links[i].url.split("://"))[1];
        defaultTitle = (defaultTitle.split('/'))[0];
        let text = links[i].title == null ? defaultTitle : links[i].title;
        link = '<i class="fa fa-link fa-fw blue"></i><a class = "feed-modal-link" href = ' + links[i].url + '> ' + text + '</a><br>'
        linkHtml += link;
      }
    }
    return linkHtml;
  };

  function search() {
    if (!$("#search-input").val()) {
      showEvents = filteredEvents;
    }
    else {
      let value = $("#search-input").val().toLowerCase();
      let eventSet = new Set();
      let count = 0;
      showEvents = filteredEvents.filter(obj => obj[fields.type].toLowerCase().includes(value));
      for (let i = count; i < Object.keys(showEvents).length; i++) eventSet.add(showEvents[i][fields.title]);
      count = Object.keys(showEvents).length;
      showEvents = showEvents.concat(filteredEvents.filter(obj => obj[fields.tags].find(element => element.toLowerCase().includes(value)) && !eventSet.has(obj[fields.title])));
      for (let i = count; i < Object.keys(showEvents).length; i++) eventSet.add(showEvents[i][fields.title]);
      count = Object.keys(showEvents).length;
      showEvents = showEvents.concat(filteredEvents.filter(obj => (obj[fields.title].toLowerCase().includes(value) || obj[fields.location].toLowerCase().includes(value) || obj[fields.description].toLowerCase().includes(value)) && !eventSet.has(obj[fields.title])));
    }
    state.page = 1;
    pagination();
  };

  function advanceSearchSetup() {
    let advanceSearchHtml = '<div id = "advance-search" class = "advance-search"><div class = "container-fluid"><div class = "row">';
    for (let i = 0; i < events.length; i++) {
      for (let j = 0; j < events[i].tags.length; j++) {
        tagSet.add(events[i].tags[j]);
      }
      typeSet.add(events[i].event_type);
    }
    advanceSearchHtml += '<div class = "col-sm-6 search-container"><label for = "search-start-date">Start Date: </label><br><input type = "date" id = "search-start-date" class = "search-date"></div>';
    advanceSearchHtml += '<div class = "col-sm-6 search-container"><label for = "search-end-date">End Date: </label><br><input type = "date" id = "search-end-date" class = "search-date"></div>';
    advanceSearchHtml += '</div>';
    advanceSearchHtml += '<div class = "row type-row"><div class = "col-sm-6 search-container">';
    advanceSearchHtml += '<label for = "type-checkbox">Event types:</label><br>';
    advanceSearchHtml += '<div class = "search-checkbox-container">';
    typeSet.forEach(element => {
      advanceSearchHtml += '<label><input type="checkbox" class="type-checkbox" value="' + element + '"> ' + element + '</label><br>';
    });
    advanceSearchHtml += '</div></div>';
    advanceSearchHtml += '<div class = "col-sm-6 search-container">';
    advanceSearchHtml += '<label for = "tag-checkbox">Event tags:&nbsp</label><input id = "tag-search-input" class = "tag-search-input" type="text" placeholder="Search Tags.."></input><br>';
    advanceSearchHtml += '<div class = "search-checkbox-container">';
    tagSet.forEach(element => {
      advanceSearchHtml += '<div><label class="tag-label"><input type="checkbox" class="tag-checkbox" value="' + element + '"> ' + element + '</label></div>';
    });
    advanceSearchHtml += '</div></div></div>';
    advanceSearchHtml += '<div class = "advance-search-button-container"><button id = "search-clear" class = "search-clear">Clear Search</button><button id = "advance-search-submit" class = "advance-search-submit">Submit</button></div></div>';
    $('#search-content').append(advanceSearchHtml);
    $("#tag-search-input").on("keyup", function () {
      tagSearch();
    });
    $('#advance-search-submit').on('click', function () {
      $('#advance-search').stop().animate({ height: '0' }, animateTime);
      advanceSearch();
    });
    $('#search-clear').on('click', function () {
      clearSearch();
    });
  };

  function advanceSearch() {
    let typeChecked = new Set();
    let tagChecked = new Set();
    filteredEvents = events;
    $(".type-checkbox").each(function () {
      if ($(this).is(':checked')) typeChecked.add($(this).val());
    });
    $(".tag-checkbox").each(function () {
      if ($(this).is(':checked')) tagChecked.add($(this).val());
    });
    if (typeChecked.size != 0) {
      filteredEvents = filteredEvents.filter(obj => typeChecked.has(obj[fields.type]));
      if (tagChecked.size != 0) filteredEvents = filteredEvents.concat(events.filter(function (obj) {
        for (tag of obj[fields.tags]) {
          if (tagChecked.has(tag)) return true;
        }
        return false;
      }));
    }
    else if (tagChecked.size != 0) filteredEvents = filteredEvents.filter(function (obj) {
      for (tag of obj[fields.tags]) {
        if (tagChecked.has(tag)) return true;
      }
      return false;
    });
    if ($('#search-start-date').val()) filteredEvents = filteredEvents.filter(obj => obj[fields.date] >= $('#search-start-date').val());
    if ($('#search-end-date').val()) filteredEvents = filteredEvents.filter(obj => obj[fields.date] <= $('#search-end-date').val());
    search();
  };

  function tagSearch() {
    let value = $("#tag-search-input").val().toLowerCase();
    $('.tag-checkbox').filter(function () {
      $(this).toggle($(this).val().toLowerCase().indexOf(value) > -1);
    });
    $('.tag-label').filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  };

  function clearSearch() {
    $('#search-start-date').val("");
    $('#search-end-date').val("");
    $('input:checkbox').each(function () {
      $(this).prop("checked", false);
    });
    $('#tag-search-input').val("");
    $("#search-input").val("");
    filteredEvents = events;
    search();
  };

  /* Function to animate height: auto */
  function autoHeightAnimate(element, time) {
    let curHeight = element.height(); // Get Default Height
    let autoHeight = element.css('height', 'auto').height(); // Get Auto Height
    element.height(curHeight); // Reset to Default Height
    element.stop().animate({ height: autoHeight }, time, function () { $('#advance-search').css("height", "auto"); }); // Animate to Auto Height
  };
});