// function to center things
jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
                                                $(window).scrollLeft()) + "px");
    return this;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Add class to trigger logo animation
$(window).on("load", function() {
  $('#logo').addClass('loaded');
});

// Scroll to the correct section of the home page when
// the link is clicked from the dropdown menu
$("#events-link").click(function() {
    $([document.documentElement, document.body]).animate({
        scrollTop: 0
    }, 1000);
});

$("#sponsors-link").click(function() {
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#sponsors").offset().top - 100
    }, 1000);
});

$("#about-link").click(function() {
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#about-section").offset().top - 100
    }, 1000);
});

$("#people-link").click(function() {
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#people").offset().top - 100
    }, 1000);
});

$("#contact-link").click(function() {
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#contact").offset().top - 100
    }, 1000);
});


// Get the events that are coming up in the future, sorted by
// ascending date. Assumes each event object has a 'date' attribute.
function getUpcomingEvents(events) {
  var sortedEvents = events.sort(function(a, b) {
    return (new Date(a.date)) - (new Date(b.date));
  });
  // then, filter out the ones that have already happened
  return sortedEvents.filter(function(a) {
    return new Date(a.date) > Date.now();
  });
}

function displayEvent(event) {
  // The divs are identified by the first letter of the type of event
  // e.g. the reading group info is denoted by r-topic, r-date, etc.
  var prefix = event.type[0];
  $(("#" + prefix + "-topic")).html(event.title);
  $(("#" + prefix + "-author")).html(event.time);
  $(("#" + prefix + "-location")).html(event.location);
  $(("#" + prefix + "-date")).html(event.date + " " + event.time);
  var linksStr = '';
  for (var i=0; i<event.links.length; i++) {
    linksStr += '<a href="' + event.links[i].URL + '">';
    linksStr += event.links[i].text + '</a>';
  }
  $(("#" + prefix + "-links")).html(linksStr);
}

// Add an event to the carousel
function addEvent(event, active=false) {
  // The divs are identified by the first letter of the type of event
  // e.g. the reading group info is denoted by r-topic, r-date, etc.
  var prefix = event.type[0];
  var eventStr = '<div class="carousel-item';

  // If this is the first event being added, make it active
  if (active) {
    eventStr += ' active';
  }
  eventStr += '">';
  eventStr += '<span class="event-date">' + event.date + '</span> | ';
  eventStr += '<span class="event-author">' + event.time + '</span> | ';
  eventStr += '<span class="event-date">' + event.location + '</span>';
  eventStr += '<div class="event-topic">' + event.title + '</div>';

  // Add links
  var linksStr = '';
  for (var i=0; i<event.links.length; i++) {
    linksStr += '<a href="' + event.links[i].URL + '">';
    linksStr += event.links[i].text + '</a>';
  }
  eventStr += '<div class="event-links">' + linksStr + '</div>';
  eventStr += '</div>';
  $(("#" + prefix + "-carousel-inner")).append(eventStr);
}

// Given an event type (e.g. workshops, reading-groups, special-events) in the
// format with a hyphen in the middle, add the given number of indicators to the
// carousel
function addCarouselIndicators(eventType, number) {
  var outerId = '#' + eventType[0] + '-indicators';
  console.log(outerId);
  for (var i = 0; i < number; i++) {
    indicatorStr = '<li data-target="#' + eventType + '-inner" data-slide-to="' + i.toString() + '"';
    if (i == 0) {
      indicatorStr += ' class="active"';
    }
    indicatorStr += '></li>';
    $(outerId).append(indicatorStr);
  }
}


// Make the carousel indicators be circles
async function updateCarouselIndicators() {
  await sleep(150);
  $('.carousel-indicators').children().each(function(i) {$(this).html(emptyCircle)});
  $('li.active').each(function(i){$(this).html(filledCircle)});
}


// How big the sponsor logos are
var sponsorSizes = {
  'Tera': 250,
  'Giga': 200,
  'Kilo': 150,
  'Startup': 120
};

var sponsorParents = {
  'Tera': 'sponsors-tera-list',
  'Giga': 'sponsors-giga-list',
  'Kilo': 'sponsors-small-list',
  'Startup': 'sponsors-small-list'
};

// Pass in a "sponsor" object, with a name, link, image, and tier,
// and output
function addSponsor(s) {
  var nodestr = '<div class="sponsor-card"><a href="' + s.link_to_website + '"><div class="prof-pic-wrapper"><div class="prof-pic-border"><img class="prof-pic" src="';
  console.log(s.link_to_logo);
  nodestr += s.link_to_logo + '" /></div></div><div class="sponsor-name">' + s.name + '</div></a>';
  nodestr += '<div class="tier">' + s.tier + '</div></div>';
  var nodes = $($.parseHTML(nodestr));
  var borderCSS = {
    'height': sponsorSizes[s.tier].toString() + 'px',
    'width': sponsorSizes[s.tier].toString() + 'px',
    'border-radius': Math.ceil(sponsorSizes[s.tier] / 2 + 3).toString() + 'px',
    'border': '5px solid #4d4a4a'
  };
  nodes.find('.prof-pic-border').first().css(borderCSS);
  // nodes.find('.prof-pic').first().css({ 'height': (sponsorSizes[s.tier] - 10).toString() + 'px' });
  $('#' + sponsorParents[s.tier]).append(nodes);
}

// events master array of JSON object
// The objects should have a topic, type, date, semester, location, author
// and list of links. The links are objects, and each have a name and a URL
// e.g. {
// topic: 'Machine Learning for Dogs',
// date: '9/10/19',
// semester: 'Fall 2019',
// author: Rose Wang,
// type: reading group
// links: [{name: 'paper', url: 'arxiv.org/paper'}],
// location: the moon
//}
var readingGroups = [];
var workshopsList = [];
var specialEvents = [];
var exec = [];
var board = [];
var sponsors = [];

var readingGroupCircles;
var workshopCircles;

// Spans containing full and empty circles
var filledCircle = '<span id="rg-1">&#x25cf;</span>';
var emptyCircle = '<span id="rg-2">&#x25cb;</span>';


// Get the JSON file of events and pictures
$.getJSON("static/data/data.json", { callback: "?" }, function( data ) {
  // Events are in this giant list
  readingGroups = data.events.filter(function(e) {return e.type === "reading group"});
  workshopsList = data.events.filter(function(e) {return e.type === "workshop"});
  specialEvents = data.events.filter(function(e) {return e.type === "special event"});
  console.log('hi there');
  // Add the events to the carousel
  // Maximum of 3 events for each type
  // Add only the events that are coming up next, not the ones that
  // have already happened

  // sort the events by date, ascending chronologically
  readingGroups = getUpcomingEvents(readingGroups);

  // display only 3
  for (var i=0; i < Math.min(readingGroups.length, 3); i++) {
    if (i == 0) {
      addEvent(readingGroups[i], active=true);
    }
    else if (i < 3) {
      addEvent(readingGroups[i]);
    }
  }

  // filter and sort
  workshopsList = getUpcomingEvents(workshopsList);
  for (var i=0; i < Math.min(workshopsList.length, 3); i++) {
    if (i == 0) {
      addEvent(workshopsList[i], active=true);
    }
    else {
      addEvent(workshopsList[i]);
    }
  }
  if (workshopsList.length == 0) {
    $('#workshops-prev').css({'display': 'none'});
    $('#workshops-next').css({'display': 'none'});
    $('#workshops-inner').html('<div class="no-events">No upcoming workshops (yet!)</div>');
  }

  specialEvents = getUpcomingEvents(specialEvents);
  for (var i=0; i < Math.min(specialEvents.length, 3); i++) {
    if (i == 0) {
      addEvent(specialEvents[i], active=true);
    }
    else {
      addEvent(specialEvents[i]);
    }
  }

  if (specialEvents.length == 0) {
    $('#special-events').css({'display': 'none'});
  }

  // Add the correct number of carousel indicators
  addCarouselIndicators('reading-groups', Math.min(readingGroups.length, 3));
  addCarouselIndicators('workshops', Math.min(workshopsList.length, 3));
  addCarouselIndicators('special-events', Math.min(specialEvents.length, 3));
  updateCarouselIndicators();

  /////////////////////////////////////////
  // Put people's profile pictures up
  ////////////////////////////////////////
  exec = data.people.exec;
  for (var i=0; i < exec.length; i++) {
    var picstr = '<div class="person-card"><div class="exec-pic-wrapper prof-pic-wrapper" data-toggle="collapse" href="#exec-bio';
    picstr += i.toString() + '">';
    picstr += '<div class="exec-pic-border prof-pic-border"><img src="';
    picstr += exec[i].profile_pic;
    picstr += '" class="prof-pic" /></div> <div class="prof-name">';
    picstr += exec[i].name;
    picstr += '</div>';
    picstr += '<div class="prof-position">'
    picstr += exec[i].position;
    picstr += '</div>';
    // picstr += '<div class="prof-year">' + exec[i].year + "</div>";
    // close the prof-pic-wrapper
    picstr += '</div>';
    // the bio collapsable section
    picstr += '<div class="collapse bio" id="exec-bio';
    picstr += i.toString() + '">';
    picstr += exec[i].bio + '</div></div>';
    $('#exec-prof-pics').append(picstr);
  }
  board = data.people.board;
  for (var i=0; i < board.length; i++) {
    var picstr = '<div class="person-card"><div class="board-pic-wrapper prof-pic-wrapper" data-toggle="collapse" href="#board-bio';
    picstr += i.toString() + '">';
    picstr += '<div class="board-pic-border prof-pic-border"><img src="';
    picstr += board[i].profile_pic;
    picstr += '" class="prof-pic" /></div> <div class="prof-name">';
    picstr += board[i].name;
    picstr += '</div>';
    picstr += '<div class="prof-position">'
    picstr += board[i].position;
    picstr += '</div>';
    // picstr += '<div class="prof-year">' + board[i].year + "</div>";
    // close the prof-pic-wrapper
    picstr += '</div>';
    // the bio collapsable section
    picstr += '<div class="collapse bio" id="board-bio';
    picstr += i.toString() + '">';
    picstr += board[i].bio + '</div></div>';
    $('#board-prof-pics').append(picstr);
  }

  $('.carousel-control-next').on('click', function() {
    updateCarouselIndicators();
  });

  $('.carousel-control-prev').on('click', function() {
    updateCarouselIndicators();
  })


  // Populate sponsor images
  // addSponsor() function defined above
  sponsors = data.sponsors;
  for (var i=0; i < sponsors.length; i++) {
    addSponsor(sponsors[i]);
  }

});
