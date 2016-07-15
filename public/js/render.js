// load each list from endpoint
var load = function(endpoint, headerText, callback) {
      
  var index = $('#index');
  var header = $('#header');

  header.text(headerText)

  $.get(endpoint, function(data) {

    if (data.success === true && typeof data.data === "object") {

      index.html("");

      if (data.data.length) {
        data.data.forEach(function(n) {
          index.append('<li class="list-group-item"><h4><a href="/index' + n.name + '">' + n.name + '</a></h4></li>')
        })
      }

      else {
        index.html("")
        index.append('<li class="list-group-item"><h4>Nothing here</h4></li>')
      }
    }

    if (typeof callback === "function") {
      return callback(null, data);
    }

  })
  .fail(function() {
    
    index.html("")
    index.append('<li class="list-group-item"><h4>Nothing here</h4></li>');

    if (typeof callback === "function") {
      return callback(true, null);
    }

  });

}

// load a service
var loadService = function(endpoint, headerText) {
      
  var code = $('#code');
  var header = $('#header');

  header.text(headerText)

  $.get(endpoint, function(data) {

    if (data.success === true && typeof data.data === "object" && typeof data.data[0] === "object") {

      code.text("");
      
      if (typeof data.data[0].value === "object") {
        var value = JSON.stringify(data.data[0].value, null, 2);
      }

      else {
        var value = data.data[0].value;
      }

      code.text(value);

    }

  })
  .fail(function() {
    code.text("Error - no data found")
  });

}

// load env lists
var loadEnv = function(endpoint, headerText, callback) {
      
  var index = $('table#index tbody');
  var header = $('#header');

  header.text(headerText)

  $.get(endpoint, function(data) {

    if (data.success === true && typeof data.data === "object") {

      index.html("");

      if (data.data.length) {
        data.data.forEach(function(n) {
          var key = n.name.split("/")[3];
          index.append('<tr><td><button type="button" class="btn btn-success pull-right" onclick="updateEnv(\'' + key + '\')">Update</button><button type="button" class="btn btn-danger pull-right mr10" onclick="deleteEnv(\'' + key + '\')">Delete</button><h4>' + key + '</h4></td><td><input data-key="' + key + '" class="form-control" type="text" value="' + n.value + '"></td></tr>')
        })
      }

      else {
        index.html("")
      }
    }

    if (typeof callback === "function") {
      return callback(null, data);
    }

  })
  .fail(function() {
    
    index.html("")

    if (typeof callback === "function") {
      return callback(true, null);
    }

  });

}

// generate breadcrumbs
var breadcrumbs = function() {

  var b = $('#breadcrumbs');
  var bits = location.pathname.split("/").filter(function(b) {
    return b;
  });

  var link = "/";
  for (var i = 0; i <= bits.length; i++) {

    if (i === 0) {
      var label = "index";
    }

    else {
      var label = bits[i];
    }

    
    // link
    if (i < (bits.length -1)) {
      
      if (i !== 0) {
        link += bits[i] + '/';
      }

      b.append('<li><a href="' + link + '">' + label + '</a></li>');

      if (i === 0) {
        link += "index/"
      }

    }

    // no link
    else if (i !== bits.length || bits.length === 0) {
      b.append('<li class="active">' + label + '</li>')
    }

  }

}

// show or hide the env button
var showEnvButton = function(err, data) {
        
  if (err) {
    $('#env-row').removeClass("hidden");
    return;
  }

  var row = $('#env-row')

  var env = data.data.filter(function(n) {
    return n.name.match(/env$/)
  });

  if (env.length === 1) {
    $('#env-row').addClass("hidden");
  }
  else {
    $('#env-row').removeClass("hidden");
  }

}

// create env directory
var createEnv = function() {

  if (typeof namespace === "undefined" || namespace == "" || !namespace) {
    return;
  }

  $.post("/" + namespace + "/env")

}

var setEnv = function() {

  if (typeof namespace === "undefined" || namespace == "" || !namespace) {
    return;
  }

  $('p#env-error').addClass("invisible")

  var key = $('input#key').val();
  var value = $('input#value').val();

  if (!key || !value) {
    $('p#env-error').removeClass("invisible")
    return;
  }

  $.post("/" + namespace + "/env/" + key, { value: value }, function() {
    $('input#key').val("");
    $('input#value').val("");
  })

}

var updateEnv = function(key) {

  if (typeof namespace === "undefined" || namespace == "" || !namespace) {
    return;
  }

  var input = $('input[data-key="'+key+'"]');
  var value = input.val();

  input.removeClass("input-err");

  if (!key || !value) {
    input.addClass("input-err");
    return;
  }

  $.post("/" + namespace + "/env/" + key, { value: value }, function() {
    input.val("");
  })

}

var deleteEnv = function(key) {

  if (typeof namespace === "undefined" || namespace == "" || !namespace) {
    return;
  }

  if (confirm("Are you sure you want to delete the env variable: " + key + "?")) {
    $.ajax({
      url: "/" + namespace + "/env/" + key,
      type: 'DELETE'
    });
  }
  
}

// create a new namespace
var createNamespace = function() {

  var ns = $('form#namespace input#namespace').val();

  if (!ns) {
    return;
  }
  
  $.post("/namespace/" + ns)

}