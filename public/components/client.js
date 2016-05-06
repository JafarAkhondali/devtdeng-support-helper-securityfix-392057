$(document).ready(function() {
  var console = $("#console");

  function log(message) {
    console.text(console.text() + "\n" + message);
  }

  function httpGetAsync(url, query_text, callback){
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() { 
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
              callback(xmlHttp.responseText);
      }
      xmlHttp.open("POST", url, true);
      var params = JSON.stringify({
        query: {
            match: {
                content: query_text
            }
        },
        fields: ['url', 'title'],
        from: 0,
        size: 5
      })      
      xmlHttp.send(params);
  }

  function handle_response(response){
    $('.result-box').show();
    var d = $('.result-area');
    d.html("<b>Recommended Documentation</b>");

    var hits = JSON.parse(response).hits.hits;
    var length = hits.length;
    for (var i = 0; i < length; i++) {
      if (hits[i]._score < 0.10)
        continue;
      var html = '<div class="panel panel-success"><div class="panel-heading">' + '<a href=' + hits[i].fields.url + ' target="_blank">' + hits[i].fields.title + '</a>' + '</div></div>';
      d.append(html);
      d.scrollTop(d.prop("scrollHeight"));
    }
  }

  function kb_handle_response(response){
    $('.kb-result-box').show();
    var d = $('.kb-result-area');
    d.html("<b>Recommended KB Articles</b>");

    var hits = JSON.parse(response).hits.hits;
    var length = hits.length;
    for (var i = 0; i < length; i++) {
      if (hits[i]._score < 0.10)
        continue;      
      var html = '<div class="panel panel-success"><div class="panel-heading">' + '<a href=' + hits[i].fields.url + ' target="_blank">' + hits[i].fields.title + '</a>' + '</div></div>';
      d.append(html);
      d.scrollTop(d.prop("scrollHeight"));
    }
  }  

  function query_elasticsearch(query_text){
    httpGetAsync('http://10.65.127.241:9200/doc/fulltext/_search', query_text, handle_response);
  }

  function kb_query_elasticsearch(query_text){
    httpGetAsync('http://10.65.127.241:9200/kb/fulltext/_search', query_text, kb_handle_response);
  }

  function countWords(str){
    var count = 0;
    words = str.split(" "); 
      for (i=0 ; i < words.length ; i++){
        if (words[i] != "")
          count += 1; 
    }
    return count;
  }

  $('.sr-title textarea').keyup(function(e) {
    var title = $('#title-input').val().trim();
    query_elasticsearch(title);
    kb_query_elasticsearch(title);
  });

  $('.sr-description textarea').keydown(function(e) {
    // TODO:
  });
});