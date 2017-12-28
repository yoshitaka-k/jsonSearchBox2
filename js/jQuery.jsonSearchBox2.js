/**
* jQuery.jsonSearchBox
* @version  0.2.0
* @author   Yoshitaka <yoshitaka.ktgwya@gmail.com>
* @license  MIT License (https://github.com/yoshitaka-k/blob/master/LICENSE.md)
* @link     https://github.com/yoshitaka-k
* jQuery.jsonSearchBox
* @version  0.2.0
* @author   Yoshitaka <yoshitaka.ktgwya@gmail.com>
* @license  MIT License (https://github.com/yoshitaka-k/blob/master/LICENSE.md)
* @link     https://github.com/yoshitaka-k
*
* @options requestUrl {String}
*          ※ JSON情報を取得するURL
*          ※ こちらを設定した場合は、下記オプション『requestDoneEvent』にて取得した情報を、
*             Dictionaryへ格納した後、returnしてください。
* @options json {String} JSON型の文字列
*          ※ 『json』オプションと、上記『requestUrl』オプションの両方が設定されている場合は、
*             こちらの方が優先されます。
* @options searching {Bool} 入力フォームの値を元に検索するか
*          ※ false の場合は常に設定された値を表示するようになります。
* @options jsonLoadEvent {Function}
*          ※ JSON文字列をJSON型へエンコードした後に実行される処理の設定ができます。
* @options requestDoneEvent {Function}
*          ※ requestUrlを元に情報を取得した後に実行される処理の設定ができます。
* @options requestFailEvent {Function}
*          ※ requestUrlを元に情報の取得に失敗した後に実行される処理の設定ができます。
* @options resultClickEvent {Function}
*          ※ 検索結果のリストをクリックした後に実行される処理の設定ができます。
*/
;(function($, undefined) {
  "use strict";
  /**
  * 各要素にプラグインをセット
  * @param {Dictionary} options プラグインに対しての設定
  */
  $.fn.pluginTest = function(options) {
    return this.each(function(){
      (new PluginTest).init($(this), options);
    });
  };

  /**
  * PluginTest
  */
  function PluginTest() {
    this._searchboxId = 'json_search-div';
    this._searchboxClass = 'json_search';
    this._symbol = 'pt';
    this._uuId = new Date().getTime();
    this._json = {};
    this._keyCode = {
      up:    38,
      down:  40,
      left:  37,
      right: 39,
      // shift: 16,
      ctrl:  17,
      alt:   18,
      home:  36,
      end:   35,
      win:   91,
      // apple: 93,
    };
  };
  PluginTest.prototype = $.extend({
    /**
    * 初期化
    * @param {Element} elem プラグインを指定した要素
    * @param {Dictionary} options プラグインに対しての設定
    * @return this
    */
    init: function(elem, options) {
      // 要素を控える
      this.elem = elem;
      // 認識用ID生成
      this._uuId += 1;
      if (this.elem.attr('data-id') !== '') this.elem.attr('data-id', this._symbol+this._uuId);
      this.setOptions(options)
          .buildBox()
          .load()
          .setEvent();
      return this;
    },
    /**
    * 設定を反映
    * @param {Dictionary} options 設定内容
    * @return this
    */
    setOptions: function(options) {
      if (this.options && !options) return this;
      if (this.options) {
        $.extend(this.options, options);
        return this;
      }
      this.options = $.extend({
        requestUrl: '',
        json: '',
        searching: true,
        jsonLoadEvent: function() {},
        requestDoneEvent: function() {},
        requestFailEvent: function() {},
      }, options);
      return this;
    },
    /**
    * json / requestUrl を読み込む
    * @return this
    */
    load: function() {
      if (this.options.json != '') this.jsonLoad();
      else if (this.options.requestUrl != '') this.ajaxLoad();
      return this;
    },
    /**
    * 検索結果のリストの生成
    * @return this
    */
    buildBox: function() {
      if ($('div#' + this._searchboxId).length !== 0) return this;
      var $div = $('<div/>').attr('id', this._searchboxId)
                            .addClass(this._searchboxClass)
                            .css('display', 'none');
      $('body').append($div);
      return this;
    },
    /**
    * 入力フォームにイベントを設定する
    * @return this
    */
    setEvent: function() {
      let self = this;
      this.elem.on({
        'focus': function(event) { self.show(event) },
        'change': function(event) { self.show(event) },
        'keyup': function(event) { self.show(event) },
      });
      var clickId = null;
      $(document).on('click', function(e) {
        clickId = $(e.target).attr('data-id');
        if (typeof clickId === 'undefined') {
          self.hide();
          return this;
        }
        if (!clickId.match(new RegExp('^' + self._symbol + '[0-9]+'))) {
          self.hide();
        }
      });
      return this;
    },
    /**
    * 検索結果のリストに表示させる内容物の生成
    * @param
    * @return 生成したリスト
    */
    buildList: function(searchResults) {
      let self = this;
      let $ul = $('<ul/>');
      $.each(searchResults, function(key, value) {
        let $a = $('<a/>').attr('id', key)
                          .attr('href', 'javascript:;')
                          .attr('data-href', self.elem.attr('id'))
                          .html(value)
                          .on('click', function(e) {
                            e.preventDefault();
                            self.elem.val($(this).html());
                            self.hide();
                          });
        $ul.append($('<li/>').html($a));
      });
      return $ul;
    },
    /**
    * 検索結果のリストを表示する
    * @return this
    */
    show: function(event) {
      var searching = true;
      $.each(this._keyCode, function(k, v) {
        if (v === event.which) searching = false;
      });
      if (!searching) return this;

      let searchResults = this.search(event);
      if (Object.keys(searchResults).length === 0) {
        this.hide();
        return this;
      }

      // 表示させる内容の生成
      let $searchBox = $('div#' + this._searchboxId);
      let offset = this.elem.offset();
      let outerHeight = this.elem.outerHeight();
      $searchBox.hide().html('')
                .css({
                  'top': offset.top + outerHeight,
                  'left': offset.left,
                })
                .html(this.buildList(searchResults))
                .slideDown(200);

      return this;
    },
    /**
    * 検索結果のリストを非表示にする
    * @return this
    */
    hide: function() {
      $('div#' + this._searchboxId).slideUp(200);
      return this;
    },
    /**
    * JSONを検索
    * @param InputEventObject
    * @return Object
    */
    search: function() {
      let self = this;
      if (!this.elem.val() || !this.options.searching) return this._json;
      var obj = {};
      $.each(this._json, function(i, e) {
        if (e.indexOf(self.elem.val()) !== -1) obj[i] = e;
      });
      return obj;
    },
    /**
    * JSONを変数へ格納
    */
    jsonLoad: function() {
      this._json = this.options.json;
      this.options.jsonLoadEvent();
    },
    /**
    * JSONを検索
    */
    ajaxLoad: function() {
      $.ajax({
        type: 'get',
        url: this.options.requestUrl,
        dataType: 'jsonp',
        context: this,
      })
      .done(function(data, status) {
        this._json = this.options.requestDoneEvent(data);
      })
      .fail(function(xhr, error) {
        this.options.requestFailEvent(xhr, error);
      });
    },
  }, PluginTest.prototype);
})(jQuery);
