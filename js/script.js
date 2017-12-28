$(function(){
  $('input.demo-input').pluginTest({
    // json: $.parseJSON('{"a":"b","c":"d","e":"f"}'),
    requestUrl: 'https://www.googleapis.com/books/v1/volumes?q=%E5%A4%8F%E7%9B%AE%E6%BC%B1%E7%9F%B3',
    requestDoneEvent: function(data) {
      var json = {};
      $.each(data.items, function(i, obj) {
        json[obj.id] = obj.volumeInfo.title;
      });
      return json;
    }
  });
});
